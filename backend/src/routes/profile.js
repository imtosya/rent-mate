const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');


router.get('/', auth, async (req, res) => {
    try {
        const [[user]] = await db.query(
            'SELECT id, name, email, avatar_url, bio, phone, is_landlord, created_at FROM users WHERE id = ?',
            [req.session.userId]
        );
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });


        const [listings] = await db.query(`
      SELECT l.*,
             COALESCE(AVG(r.rating), 0) AS avg_rating,
             COUNT(DISTINCT r.id) AS review_count
      FROM listings l
      LEFT JOIN reviews r ON r.listing_id = l.id
      WHERE l.owner_id = ?
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `, [req.session.userId]);


        const [reviews] = await db.query(`
      SELECT r.*, l.title AS listing_title, l.id AS listing_id
      FROM reviews r
      JOIN listings l ON r.listing_id = l.id
      WHERE r.author_id = ?
      ORDER BY r.created_at DESC
    `, [req.session.userId]);


        const [[{ unread_messages }]] = await db.query(
            'SELECT COUNT(*) AS unread_messages FROM messages WHERE receiver_id = ? AND is_read = FALSE',
            [req.session.userId]
        );

        res.json({ user, listings, reviews, unread_messages });
    } catch (err) {
        console.error('profile error:', err);
        res.status(500).json({ error: 'Ошибка получения профиля' });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const [[user]] = await db.query(
            'SELECT id, name, avatar_url, bio, is_landlord, created_at FROM users WHERE id = ?',
            [req.params.userId]
        );
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

        const [listings] = await db.query(`
      SELECT l.*,
             COALESCE(AVG(r.rating), 0) AS avg_rating,
             COUNT(DISTINCT r.id) AS review_count
      FROM listings l
      LEFT JOIN reviews r ON r.listing_id = l.id
      WHERE l.owner_id = ? AND l.is_active = TRUE
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `, [req.params.userId]);

        res.json({ user, listings });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;
