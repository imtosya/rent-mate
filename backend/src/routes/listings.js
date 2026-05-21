const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const { city, type, minPrice, maxPrice, rooms, wifi, petFriendly, search, sort='newest', limit=20, offset=0 } = req.query;
        let sql = `
            SELECT l.*, u.name AS owner_name, u.avatar_url AS owner_avatar,
                   COALESCE(AVG(r.rating),0) AS avg_rating,
                   COUNT(DISTINCT r.id) AS review_count,
                   COUNT(DISTINCT rm.id) AS roommate_count
            FROM listings l
                     JOIN users u ON l.owner_id = u.id
                     LEFT JOIN reviews r   ON r.listing_id  = l.id
                     LEFT JOIN roommates rm ON rm.listing_id = l.id
            WHERE l.is_active = TRUE
        `;
        const params = [];
        if (city)     { sql += ' AND l.city LIKE ?';          params.push(`%${city}%`); }
        if (type)     { sql += ' AND l.listing_type = ?';     params.push(type); }
        if (minPrice) { sql += ' AND l.price >= ?';           params.push(+minPrice); }
        if (maxPrice) { sql += ' AND l.price <= ?';           params.push(+maxPrice); }
        if (rooms)    { sql += ' AND l.rooms = ?';            params.push(+rooms); }
        if (wifi === 'true')        sql += ' AND l.wifi = TRUE';
        if (petFriendly === 'true') sql += ' AND l.pet_friendly = TRUE';
        if (search) {
            sql += ' AND (l.title LIKE ? OR l.description LIKE ? OR l.address LIKE ?)';
            const s = `%${search}%`; params.push(s, s, s);
        }
        sql += ' GROUP BY l.id';
        const sortMap = { newest:'l.created_at DESC', price_asc:'l.price ASC', price_desc:'l.price DESC', rating:'avg_rating DESC' };
        sql += ` ORDER BY ${sortMap[sort] || sortMap.newest} LIMIT ? OFFSET ?`;
        params.push(+limit, +offset);

        const [rows] = await db.query(sql, params);
        const [[{ total }]] = await db.query('SELECT COUNT(DISTINCT id) AS total FROM listings WHERE is_active=TRUE');
        res.json({ listings: rows, pagination: { total, limit: +limit, offset: +offset } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения объявлений' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [[listing]] = await db.query(`
      SELECT l.*, u.name AS owner_name, u.avatar_url AS owner_avatar,
        u.bio AS owner_bio, u.phone AS owner_phone,
        COALESCE(AVG(r.rating),0) AS avg_rating, COUNT(DISTINCT r.id) AS review_count
      FROM listings l JOIN users u ON l.owner_id=u.id
      LEFT JOIN reviews r ON r.listing_id=l.id
      WHERE l.id=? AND l.is_active=TRUE GROUP BY l.id
    `, [req.params.id]);
        if (!listing) return res.status(404).json({ error: 'Объявление не найдено' });

        const [roommates] = await db.query(`
            SELECT u.id, u.name, u.avatar_url, rm.joined_at
            FROM roommates rm JOIN users u ON rm.user_id=u.id WHERE rm.listing_id=?
        `, [req.params.id]);

        const [reviews] = await db.query(`
            SELECT r.*, u.name AS author_name, u.avatar_url AS author_avatar
            FROM reviews r JOIN users u ON r.author_id=u.id
            WHERE r.listing_id=? ORDER BY r.created_at DESC
        `, [req.params.id]);

        res.json({ ...listing, roommates, reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения объявления' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const {
            title, description, price, city='Бишкек', district, address,
            rooms=1, floor, total_floors, area_sqm, listing_type='аренда',
            pet_friendly=false, gender_pref='любой', wifi=false, parking=false, image_urls=[]
        } = req.body;

        if (!title || !price) return res.status(400).json({ error: 'Заголовок и цена обязательны' });
        if (price <= 0)        return res.status(400).json({ error: 'Цена должна быть > 0' });


        const [result] = await db.query(`
            INSERT INTO listings
            (owner_id,title,description,price,city,district,address,rooms,floor,total_floors,area_sqm,
             listing_type,pet_friendly,gender_pref,wifi,parking,image_urls)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [
            req.session.userId, title, description||null, +price, city, district||null, address||null,
            +rooms, floor||null, total_floors||null, area_sqm||null, listing_type,
            !!pet_friendly, gender_pref, !!wifi, !!parking, JSON.stringify(image_urls)
        ]);

        const [[listing]] = await db.query('SELECT * FROM listings WHERE id=?', [result.insertId]);
        res.status(201).json({ message: 'Объявление создано!', listing });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка создания объявления' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const [[listing]] = await db.query(
            'SELECT * FROM listings WHERE id=? AND owner_id=?',
            [req.params.id, req.session.userId]  // сессия, не JWT
        );
        if (!listing) return res.status(404).json({ error: 'Не найдено или не твоё' });

        const { price } = req.body;
        if (price && +price < listing.price) {
            const [favUsers] = await db.query('SELECT user_id FROM favorites WHERE listing_id=?', [req.params.id]);
            for (const f of favUsers) {
                await db.query(
                    'INSERT INTO notifications (user_id,type,title,body,link) VALUES (?,?,?,?,?)',
                    [f.user_id, 'price_drop', `Снижение цены: ${listing.title}`,
                        `Цена снижена с ${listing.price} до ${price} сом`, `/listings/${req.params.id}`]
                );
            }
        }

        const allowed = ['title','description','price','city','district','address','rooms','floor',
            'total_floors','area_sqm','listing_type','pet_friendly','gender_pref',
            'wifi','parking','image_urls','is_active'];
        const sets = []; const vals = [];
        for (const f of allowed) {
            if (req.body[f] !== undefined) {
                sets.push(`${f}=?`);
                vals.push(f === 'image_urls' ? JSON.stringify(req.body[f]) : req.body[f]);
            }
        }
        if (!sets.length) return res.status(400).json({ error: 'Нет данных для обновления' });
        vals.push(req.params.id);
        await db.query(`UPDATE listings SET ${sets.join(',')} WHERE id=?`, vals);

        const [[updated]] = await db.query('SELECT * FROM listings WHERE id=?', [req.params.id]);
        res.json({ message: 'Объявление обновлено', listing: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка обновления' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM listings WHERE id=? AND owner_id=?',
            [req.params.id, req.session.userId]
        );
        if (!result.affectedRows) return res.status(404).json({ error: 'Не найдено или не твоё' });
        res.json({ message: 'Объявление удалено' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});

router.post('/:id/join', auth, async (req, res) => {
    try {
        await db.query('INSERT IGNORE INTO roommates (listing_id,user_id) VALUES (?,?)',
            [req.params.id, req.session.userId]);
        res.json({ message: 'Ты добавлен как жилец' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

router.delete('/:id/join', auth, async (req, res) => {
    try {
        await db.query('DELETE FROM roommates WHERE listing_id=? AND user_id=?',
            [req.params.id, req.session.userId]);
        res.json({ message: 'Убран из жильцов' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;
