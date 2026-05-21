const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const [favorites] = await db.query(`
      SELECT l.*, f.created_at AS saved_at, f.saved_price,
             u.name AS owner_name,
             COALESCE(AVG(r.rating), 0) AS avg_rating
      FROM favorites f
      JOIN listings l ON f.listing_id = l.id
      JOIN users u ON l.owner_id = u.id
      LEFT JOIN reviews r ON r.listing_id = l.id
      WHERE f.user_id = ? AND l.is_active = TRUE
      GROUP BY l.id, f.created_at, f.saved_price
      ORDER BY f.created_at DESC
    `, [req.session.userId]);
        res.json({ favorites });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка получения избранного' });
    }
});

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
        res.status(500).json({ error: 'Ошибка' });
    }
});

router.delete('/:listingId', auth, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM favorites WHERE user_id = ? AND listing_id = ?',
            [req.session.userId, req.params.listingId]
        );
        res.json({ message: 'Удалено из избранного' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;
