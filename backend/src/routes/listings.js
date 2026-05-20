const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const {
            city, type, minPrice, maxPrice, rooms,
            wifi, petFriendly, genderPref, search,
            sort = 'newest',
            limit = 20,
            offset = 0
        } = req.query;

        let sql = `
      SELECT
        l.*,
        u.name  AS owner_name,
        u.avatar_url AS owner_avatar,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.id)       AS review_count,
        COUNT(DISTINCT rm.id)      AS roommate_count
      FROM listings l
      JOIN users u ON l.owner_id = u.id
      LEFT JOIN reviews r   ON r.listing_id  = l.id
      LEFT JOIN roommates rm ON rm.listing_id = l.id
      WHERE l.is_active = TRUE
    `;
        const params = [];

        if (city) {
            sql += ' AND l.city LIKE ?';
            params.push(`%${city}%`);
        }
        if (type) {
            sql += ' AND l.listing_type = ?';
            params.push(type);
        }
        if (minPrice) {
            sql += ' AND l.price >= ?';
            params.push(Number(minPrice));
        }
        if (maxPrice) {
            sql += ' AND l.price <= ?';
            params.push(Number(maxPrice));
        }
        if (rooms) {
            sql += ' AND l.rooms = ?';
            params.push(Number(rooms));
        }
        if (wifi === 'true') {
            sql += ' AND l.wifi = TRUE';
        }
        if (petFriendly === 'true') {
            sql += ' AND l.pet_friendly = TRUE';
        }
        if (genderPref) {
            sql += ' AND l.gender_pref = ?';
            params.push(genderPref);
        }
        if (search) {
            sql += ' AND (l.title LIKE ? OR l.description LIKE ? OR l.address LIKE ?)';
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        sql += ' GROUP BY l.id';

        const sortMap = {
            newest:    'l.created_at DESC',
            oldest:    'l.created_at ASC',
            price_asc: 'l.price ASC',
            price_desc:'l.price DESC',
            rating:    'avg_rating DESC',
        };
        sql += ` ORDER BY ${sortMap[sort] || sortMap.newest}`;

        sql += ' LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(sql, params);

        let countSql = 'SELECT COUNT(DISTINCT l.id) AS total FROM listings l WHERE l.is_active = TRUE';
        const countParams = [];
        if (city) { countSql += ' AND l.city LIKE ?'; countParams.push(`%${city}%`); }
        if (type) { countSql += ' AND l.listing_type = ?'; countParams.push(type); }
        if (minPrice) { countSql += ' AND l.price >= ?'; countParams.push(Number(minPrice)); }
        if (maxPrice) { countSql += ' AND l.price <= ?'; countParams.push(Number(maxPrice)); }
        const [[{ total }]] = await db.query(countSql, countParams);

        res.json({
            listings: rows,
            pagination: {
                total,
                limit: Number(limit),
                offset: Number(offset),
                hasMore: Number(offset) + rows.length < total
            }
        });
    } catch (err) {
        console.error('listings list error:', err);
        res.status(500).json({ error: 'Ошибка получения объявлений' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

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
    `, [id]);

        if (!listing)
            return res.status(404).json({ error: 'Объявление не найдено' });

        const [roommates] = await db.query(`
      SELECT u.id, u.name, u.avatar_url, u.bio, rm.joined_at
      FROM roommates rm
      JOIN users u ON rm.user_id = u.id
      WHERE rm.listing_id = ?
    `, [id]);

        const [reviews] = await db.query(`
      SELECT r.*, u.name AS author_name, u.avatar_url AS author_avatar
      FROM reviews r
      JOIN users u ON r.author_id = u.id
      WHERE r.listing_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

        res.json({ ...listing, roommates, reviews });
    } catch (err) {
        console.error('listing detail error:', err);
        res.status(500).json({ error: 'Ошибка получения объявления' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const {
            title, description, price,
            city = 'Бишкек', district, address,
            rooms = 1, floor, total_floors, area_sqm,
            listing_type = 'аренда',
            pet_friendly = false,
            gender_pref = 'любой',
            wifi = false,
            parking = false,
            image_urls = []
        } = req.body;

        if (!title || !price)
            return res.status(400).json({ error: 'Заголовок и цена обязательны' });

        if (price <= 0)
            return res.status(400).json({ error: 'Цена должна быть больше 0' });

        const [result] = await db.query(`
      INSERT INTO listings
        (owner_id, title, description, price, city, district, address,
         rooms, floor, total_floors, area_sqm, listing_type,
         pet_friendly, gender_pref, wifi, parking, image_urls)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            req.user.id, title, description, price,
            city, district, address,
            rooms, floor, total_floors, area_sqm, listing_type,
            !!pet_friendly, gender_pref, !!wifi, !!parking,
            JSON.stringify(image_urls)
        ]);

        const [[listing]] = await db.query('SELECT * FROM listings WHERE id = ?', [result.insertId]);
        res.status(201).json({ message: 'Объявление создано!', listing });
    } catch (err) {
        console.error('listing create error:', err);
        res.status(500).json({ error: 'Ошибка создания объявления' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const [[listing]] = await db.query(
            'SELECT * FROM listings WHERE id = ? AND owner_id = ?',
            [id, req.user.id]
        );
        if (!listing)
            return res.status(404).json({ error: 'Объявление не найдено или не твоё' });

        const {
            title, description, price, city, district, address,
            rooms, floor, total_floors, area_sqm, listing_type,
            pet_friendly, gender_pref, wifi, parking, image_urls, is_active
        } = req.body;

        if (price && price < listing.price) {
            const [favUsers] = await db.query(
                'SELECT user_id FROM favorites WHERE listing_id = ?', [id]
            );
            for (const fav of favUsers) {
                await db.query(`
          INSERT INTO notifications (user_id, type, title, body, link) VALUES
          (?, 'price_drop', ?, ?, ?)
        `, [
                    fav.user_id,
                    `Снижение цены: ${listing.title}`,
                    `Цена снижена с ${listing.price} до ${price} сом`,
                    `/listings/${id}`
                ]);
            }
        }

        await db.query(`
      UPDATE listings SET
        title        = COALESCE(?, title),
        description  = COALESCE(?, description),
        price        = COALESCE(?, price),
        city         = COALESCE(?, city),
        district     = COALESCE(?, district),
        address      = COALESCE(?, address),
        rooms        = COALESCE(?, rooms),
        floor        = COALESCE(?, floor),
        total_floors = COALESCE(?, total_floors),
        area_sqm     = COALESCE(?, area_sqm),
        listing_type = COALESCE(?, listing_type),
        pet_friendly = COALESCE(?, pet_friendly),
        gender_pref  = COALESCE(?, gender_pref),
        wifi         = COALESCE(?, wifi),
        parking      = COALESCE(?, parking),
        image_urls   = COALESCE(?, image_urls),
        is_active    = COALESCE(?, is_active)
      WHERE id = ?
    `, [
            title, description, price, city, district, address,
            rooms, floor, total_floors, area_sqm, listing_type,
            pet_friendly != null ? !!pet_friendly : null,
            gender_pref,
            wifi != null ? !!wifi : null,
            parking != null ? !!parking : null,
            image_urls ? JSON.stringify(image_urls) : null,
            is_active != null ? !!is_active : null,
            id
        ]);

        const [[updated]] = await db.query('SELECT * FROM listings WHERE id = ?', [id]);
        res.json({ message: 'Объявление обновлено', listing: updated });
    } catch (err) {
        console.error('listing update error:', err);
        res.status(500).json({ error: 'Ошибка обновления объявления' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM listings WHERE id = ? AND owner_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Объявление не найдено или не твоё' });
        res.json({ message: 'Объявление удалено' });
    } catch (err) {
        console.error('listing delete error:', err);
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});

router.post('/:id/join', auth, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(
            'INSERT IGNORE INTO roommates (listing_id, user_id) VALUES (?, ?)',
            [id, req.user.id]
        );
        res.json({ message: 'Ты добавлен как жилец' });
    } catch (err) {
        console.error('join error:', err);
        res.status(500).json({ error: 'Ошибка' });
    }
});

router.delete('/:id/join', auth, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM roommates WHERE listing_id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Ты убран из жильцов' });
    } catch (err) {
        console.error('leave error:', err);
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;
