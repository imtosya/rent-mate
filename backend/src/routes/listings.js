const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');


function formatListing(row) {

    let imageUrls = [];
    try {
        imageUrls = typeof row.image_urls === 'string'
            ? JSON.parse(row.image_urls)
            : (row.image_urls || []);
    } catch (_) { imageUrls = []; }


    const typeMap = {
        'аренда':     'apartment',
        'подселение': 'room',
        'субаренда':  'apartment',
    };
    const typeRuMap = {
        'аренда':     'Квартира',
        'подселение': 'Комната',
        'субаренда':  'Субаренда',
    };

    // Предпочтение по полу → английский
    const genderMap = {
        'любой':           'any',
        'только мужчины':  'male',
        'только женщины':  'female',
    };

    const firstImage = imageUrls[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';


    const amenities = [];
    if (row.wifi)        amenities.push('Wi-Fi');
    if (row.parking)     amenities.push('Парковка');
    if (row.pet_friendly) amenities.push('Можно с питомцами');

    return {
        id:              String(row.id),
        title:           row.title,
        description:     row.description || '',
        price:           Number(row.price),
        location:        [row.district, row.city].filter(Boolean).join(', '),
        city:            row.city,
        district:        row.district || '',
        address:         row.address || '',
        image:           firstImage,
        gallery:         imageUrls.length > 0 ? imageUrls : [firstImage],
        rating:          Number(Number(row.avg_rating || 0).toFixed(1)),
        rooms:           Number(row.rooms || 1),
        roommates:       Number(row.roommate_count || 0),
        type:            typeMap[row.listing_type] || 'apartment',
        typeRu:          typeRuMap[row.listing_type] || 'Квартира',
        listing_type:    row.listing_type,
        petFriendly:     !!row.pet_friendly,
        genderPreference: genderMap[row.gender_pref] || 'any',
        gender_pref:     row.gender_pref,
        amenities:       amenities,
        wifi:            !!row.wifi,
        parking:         !!row.parking,
        floor:           row.floor || null,
        total_floors:    row.total_floors || null,
        area_sqm:        row.area_sqm ? Number(row.area_sqm) : null,
        is_active:       !!row.is_active,
        review_count:    Number(row.review_count || 0),
        created_at:      row.created_at,
        owner: {
            id:       String(row.owner_id),
            name:     row.owner_name || 'Пользователь',
            avatar:   row.owner_avatar || '',
            bio:      row.owner_bio || '',
            phone:    row.owner_phone || '',
            rating:   0,
            verified: true,
        },
        ownerId: String(row.owner_id),
    };
}


router.get('/', async (req, res) => {
    try {
        const {
            city, type, minPrice, maxPrice, rooms,
            wifi, petFriendly, search,
            sort = 'newest', limit = 20, offset = 0
        } = req.query;

        let sql = `
            SELECT l.*, u.name AS owner_name, u.avatar_url AS owner_avatar,
                   u.bio AS owner_bio, u.phone AS owner_phone,
                   COALESCE(AVG(r.rating), 0) AS avg_rating,
                   COUNT(DISTINCT r.id) AS review_count,
                   COUNT(DISTINCT rm.id) AS roommate_count
            FROM listings l
            JOIN users u ON l.owner_id = u.id
            LEFT JOIN reviews r   ON r.listing_id  = l.id
            LEFT JOIN roommates rm ON rm.listing_id = l.id
            WHERE l.is_active = TRUE
        `;
        const params = [];

        if (city)     { sql += ' AND l.city LIKE ?';         params.push(`%${city}%`); }


        if (type) {
            const typeToRu = { apartment: 'аренда', room: 'подселение', studio: 'аренда' };
            const ruType = typeToRu[type];
            if (ruType) { sql += ' AND l.listing_type = ?'; params.push(ruType); }
        }

        if (minPrice) { sql += ' AND l.price >= ?';          params.push(+minPrice); }
        if (maxPrice) { sql += ' AND l.price <= ?';          params.push(+maxPrice); }
        if (rooms)    { sql += ' AND l.rooms = ?';           params.push(+rooms); }
        if (wifi === 'true')        sql += ' AND l.wifi = TRUE';
        if (petFriendly === 'true') sql += ' AND l.pet_friendly = TRUE';

        if (search) {
            sql += ' AND (l.title LIKE ? OR l.description LIKE ? OR l.address LIKE ? OR l.city LIKE ?)';
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }

        sql += ' GROUP BY l.id';

        const sortMap = {
            newest:     'l.created_at DESC',
            price_asc:  'l.price ASC',
            price_desc: 'l.price DESC',
            rating:     'avg_rating DESC',
        };
        sql += ` ORDER BY ${sortMap[sort] || sortMap.newest} LIMIT ? OFFSET ?`;
        params.push(+limit, +offset);

        const [rows] = await db.query(sql, params);


        let countSql = `
            SELECT COUNT(DISTINCT l.id) AS total
            FROM listings l
            WHERE l.is_active = TRUE
        `;
        const countParams = [];
        if (city)     { countSql += ' AND l.city LIKE ?';         countParams.push(`%${city}%`); }
        if (minPrice) { countSql += ' AND l.price >= ?';           countParams.push(+minPrice); }
        if (maxPrice) { countSql += ' AND l.price <= ?';           countParams.push(+maxPrice); }
        if (rooms)    { countSql += ' AND l.rooms = ?';            countParams.push(+rooms); }
        if (wifi === 'true')        countSql += ' AND l.wifi = TRUE';
        if (petFriendly === 'true') countSql += ' AND l.pet_friendly = TRUE';
        if (search) {
            countSql += ' AND (l.title LIKE ? OR l.description LIKE ? OR l.address LIKE ? OR l.city LIKE ?)';
            const s = `%${search}%`;
            countParams.push(s, s, s, s);
        }

        const [[{ total }]] = await db.query(countSql, countParams);

        res.json({
            listings: rows.map(formatListing),
            pagination: { total: Number(total), limit: +limit, offset: +offset }
        });
    } catch (err) {
        console.error('listings GET error:', err);
        res.status(500).json({ error: 'Ошибка получения объявлений' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const [[listing]] = await db.query(`
            SELECT l.*, u.name AS owner_name, u.avatar_url AS owner_avatar,
                   u.bio AS owner_bio, u.phone AS owner_phone,
                   COALESCE(AVG(r.rating), 0) AS avg_rating,
                   COUNT(DISTINCT r.id) AS review_count
            FROM listings l
            JOIN users u ON l.owner_id = u.id
            LEFT JOIN reviews r ON r.listing_id = l.id
            WHERE l.id = ? AND l.is_active = TRUE
            GROUP BY l.id
        `, [req.params.id]);

        if (!listing)
            return res.status(404).json({ error: 'Объявление не найдено' });

        const [roommates] = await db.query(`
            SELECT u.id, u.name, u.avatar_url AS avatar, rm.joined_at
            FROM roommates rm JOIN users u ON rm.user_id = u.id
            WHERE rm.listing_id = ?
        `, [req.params.id]);

        const [reviews] = await db.query(`
            SELECT r.id, r.rating, r.comment, r.created_at,
                   u.id AS author_id, u.name AS author_name, u.avatar_url AS author_avatar
            FROM reviews r JOIN users u ON r.author_id = u.id
            WHERE r.listing_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.id]);


        const formattedReviews = reviews.map(r => ({
            id:      String(r.id),
            rating:  r.rating,
            comment: r.comment || '',
            date:    new Date(r.created_at).toLocaleDateString('ru-RU'),
            user: {
                id:       String(r.author_id),
                name:     r.author_name,
                avatar:   r.author_avatar || '',
                rating:   r.rating,
                verified: true,
            }
        }));

        const result = formatListing(listing);
        result.reviews  = formattedReviews;
        result.roommates_list = roommates.map(rm => ({
            id:        String(rm.id),
            name:      rm.name,
            avatar:    rm.avatar || '',
            joined_at: rm.joined_at,
        }));

        res.json(result);
    } catch (err) {
        console.error('listing GET/:id error:', err);
        res.status(500).json({ error: 'Ошибка получения объявления' });
    }
});


router.post('/', auth, async (req, res) => {
    try {
        const {
            title, description, price,
            city = 'Бишкек', district, address,
            rooms = 1, floor, total_floors, area_sqm,
            listing_type,   // принимаем и русский и английский
            type,           // английский вариант от фронтенда
            pet_friendly = false,
            petFriendly,    // camelCase вариант
            gender_pref = 'любой',
            genderPreference, // английский вариант
            wifi = false, parking = false,
            image_urls = [],
            gallery,        // альтернативное название от фронтенда
        } = req.body;

        if (!title || !price)
            return res.status(400).json({ error: 'Заголовок и цена обязательны' });
        if (Number(price) <= 0)
            return res.status(400).json({ error: 'Цена должна быть > 0' });


        const typeToRu = { apartment: 'аренда', room: 'подселение', studio: 'аренда', house: 'аренда' };
        const normalizedType = typeToRu[listing_type] || typeToRu[type] || listing_type || 'аренда';


        const genderToRu = { any: 'любой', male: 'только мужчины', female: 'только женщины' };
        const normalizedGender = gender_pref || genderToRu[genderPreference] || 'любой';


        const isPetFriendly = pet_friendly || petFriendly || false;


        const images = gallery || image_urls || [];

        const [result] = await db.query(`
            INSERT INTO listings
              (owner_id, title, description, price, city, district, address,
               rooms, floor, total_floors, area_sqm,
               listing_type, pet_friendly, gender_pref, wifi, parking, image_urls)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            req.session.userId, title, description || null, +price,
            city, district || null, address || null,
            +rooms, floor || null, total_floors || null, area_sqm || null,
            normalizedType, !!isPetFriendly, normalizedGender, !!wifi, !!parking,
            JSON.stringify(images)
        ]);

        const [[row]] = await db.query(`
            SELECT l.*, u.name AS owner_name, u.avatar_url AS owner_avatar,
                   u.bio AS owner_bio, u.phone AS owner_phone,
                   0 AS avg_rating, 0 AS review_count, 0 AS roommate_count
            FROM listings l JOIN users u ON l.owner_id = u.id
            WHERE l.id = ?
        `, [result.insertId]);

        res.status(201).json({
            message: 'Объявление создано!',
            listing: formatListing(row)
        });
    } catch (err) {
        console.error('listing POST error:', err);
        res.status(500).json({ error: 'Ошибка создания объявления' });
    }
});


router.put('/:id', auth, async (req, res) => {
    try {
        const [[listing]] = await db.query(
            'SELECT * FROM listings WHERE id = ? AND owner_id = ?',
            [req.params.id, req.session.userId]
        );
        if (!listing)
            return res.status(404).json({ error: 'Не найдено или не твоё объявление' });


        const { price } = req.body;
        if (price && +price < listing.price) {
            const [favUsers] = await db.query(
                'SELECT user_id FROM favorites WHERE listing_id = ?', [req.params.id]
            );
            for (const f of favUsers) {
                await db.query(
                    'INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)',
                    [f.user_id, 'price_drop',
                        `Снижение цены: ${listing.title}`,
                        `Цена снижена с ${listing.price} до ${price} сом`,
                        `/listings/${req.params.id}`]
                );
            }
        }


        const body = { ...req.body };
        if (body.type && !body.listing_type) {
            const typeToRu = { apartment: 'аренда', room: 'подселение', studio: 'аренда', house: 'аренда' };
            body.listing_type = typeToRu[body.type] || 'аренда';
        }
        if (body.genderPreference && !body.gender_pref) {
            const genderToRu = { any: 'любой', male: 'только мужчины', female: 'только женщины' };
            body.gender_pref = genderToRu[body.genderPreference] || 'любой';
        }
        if (body.petFriendly !== undefined && body.pet_friendly === undefined) {
            body.pet_friendly = body.petFriendly;
        }
        if (body.gallery && !body.image_urls) {
            body.image_urls = body.gallery;
        }

        const allowed = ['title', 'description', 'price', 'city', 'district', 'address',
            'rooms', 'floor', 'total_floors', 'area_sqm', 'listing_type',
            'pet_friendly', 'gender_pref', 'wifi', 'parking', 'image_urls', 'is_active'];

        const sets = []; const vals = [];
        for (const f of allowed) {
            if (body[f] !== undefined) {
                sets.push(`${f} = ?`);
                vals.push(f === 'image_urls' ? JSON.stringify(body[f]) : body[f]);
            }
        }
        if (!sets.length)
            return res.status(400).json({ error: 'Нет данных для обновления' });

        vals.push(req.params.id);
        await db.query(`UPDATE listings SET ${sets.join(', ')} WHERE id = ?`, vals);

        const [[updated]] = await db.query(`
            SELECT l.*, u.name AS owner_name, u.avatar_url AS owner_avatar,
                   u.bio AS owner_bio, u.phone AS owner_phone,
                   COALESCE(AVG(r.rating), 0) AS avg_rating,
                   COUNT(DISTINCT r.id) AS review_count,
                   COUNT(DISTINCT rm.id) AS roommate_count
            FROM listings l JOIN users u ON l.owner_id = u.id
            LEFT JOIN reviews r ON r.listing_id = l.id
            LEFT JOIN roommates rm ON rm.listing_id = l.id
            WHERE l.id = ?
            GROUP BY l.id
        `, [req.params.id]);

        res.json({ message: 'Объявление обновлено', listing: formatListing(updated) });
    } catch (err) {
        console.error('listing PUT error:', err);
        res.status(500).json({ error: 'Ошибка обновления' });
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM listings WHERE id = ? AND owner_id = ?',
            [req.params.id, req.session.userId]
        );
        if (!result.affectedRows)
            return res.status(404).json({ error: 'Не найдено или не твоё объявление' });
        res.json({ message: 'Объявление удалено' });
    } catch (err) {
        console.error('listing DELETE error:', err);
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});


router.post('/:id/join', auth, async (req, res) => {
    try {
        await db.query(
            'INSERT IGNORE INTO roommates (listing_id, user_id) VALUES (?, ?)',
            [req.params.id, req.session.userId]
        );
        res.json({ message: 'Ты добавлен как жилец' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});


router.delete('/:id/join', auth, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM roommates WHERE listing_id = ? AND user_id = ?',
            [req.params.id, req.session.userId]
        );
        res.json({ message: 'Убран из жильцов' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;