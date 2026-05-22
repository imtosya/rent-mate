const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');
const { formatListing } = require('./listings');

// GET /api/favorites
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT l.*, f.created_at AS saved_at, f.saved_price,
                   u.name AS owner_name, u.avatar_url AS owner_avatar,
                   u.bio AS owner_bio, u.phone AS owner_phone,
                   COALESCE(AVG(r.rating), 0) AS avg_rating,
                   COUNT(DISTINCT r.id) AS review_count,
                   0 AS roommate_count
            FROM favorites f
            JOIN listings l  ON f.listing_id = l.id
            JOIN users u     ON l.owner_id   = u.id
            LEFT JOIN reviews r ON r.listing_id = l.id
            WHERE f.user_id = ? AND l.is_active = TRUE
            GROUP BY l.id, f.created_at, f.saved_price
            ORDER BY f.created_at DESC
        `, [req.session.userId]);

        const favorites = rows.map(row => ({
            ...formatListing(row),
            saved_at:    row.saved_at,
            saved_price: row.saved_price ? Number(row.saved_price) : null,
            price_drop:  row.saved_price && Number(row.price) < Number(row.saved_price)
                ? Number(row.saved_price) - Number(row.price)
                : 0,
        }));

        res.json({ favorites });
    } catch (err) {
        console.error('favorites GET error:', err);
        res.status(500).json({ error: 'Ошибка получения избранного' });
    }
});

// POST /api/favorites
router.post('/', auth, async (req, res) => {
    try {
        const { listing_id } = req.body;
        if (!listing_id)
            return res.status(400).json({ error: 'listing_id обязателен' });

        const [[listing]] = await db.query('SELECT price FROM listings WHERE id = ?', [listing_id]);
        if (!listing)
            return res.status(404).json({ error: 'Объявление не найдено' });

        await db.query(
            'INSERT IGNORE INTO favorites (user_id, listing_id, saved_price) VALUES (?, ?, ?)',
            [req.session.userId, listing_id, listing.price]
        );
        res.json({ message: 'Добавлено в избранное' });
    } catch (err) {
        console.error('favorites POST error:', err);
        res.status(500).json({ error: 'Ошибка' });
    }
});

// DELETE /api/favorites/:listingId
router.delete('/:listingId', auth, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM favorites WHERE user_id = ? AND listing_id = ?',
            [req.session.userId, req.params.listingId]
        );
        res.json({ message: 'Удалено из избранного' });
    } catch (err) {
        console.error('favorites DELETE error:', err);
        res.status(500).json({ error: 'Ошибка' });
    }
});

// GET /api/favorites/ids  — список id избранных объявлений текущего пользователя
// Используется при загрузке страницы чтобы отметить сердечки
router.get('/ids', auth, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT listing_id FROM favorites WHERE user_id = ?',
            [req.session.userId]
        );
        res.json({ ids: rows.map(r => String(r.listing_id)) });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;