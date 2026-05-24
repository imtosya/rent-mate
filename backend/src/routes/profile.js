const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');
const { formatUser } = require('./auth');
const { formatListing } = require('./listings');


router.get('/', auth, async (req, res) => {
    try {
        const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [req.session.userId]);
        if (!user)
            return res.status(404).json({ error: 'Пользователь не найден' });

        const [listingRows] = await db.query(`
            SELECT l.*,
                   u.name AS owner_name, u.avatar_url AS owner_avatar,
                   u.bio AS owner_bio, u.phone AS owner_phone,
                   COALESCE(AVG(r.rating), 0) AS avg_rating,
                   COUNT(DISTINCT r.id) AS review_count,
                   COUNT(DISTINCT rm.id) AS roommate_count
            FROM listings l
            JOIN users u ON l.owner_id = u.id
            LEFT JOIN reviews r  ON r.listing_id  = l.id
            LEFT JOIN roommates rm ON rm.listing_id = l.id
            WHERE l.owner_id = ?
            GROUP BY l.id
            ORDER BY l.created_at DESC
        `, [req.session.userId]);

        const [reviewRows] = await db.query(`
            SELECT r.id, r.rating, r.comment, r.created_at,
                   l.title AS listing_title, l.id AS listing_id
            FROM reviews r JOIN listings l ON r.listing_id = l.id
            WHERE r.author_id = ?
            ORDER BY r.created_at DESC
        `, [req.session.userId]);

        const [[{ unread_messages }]] = await db.query(
            'SELECT COUNT(*) AS unread_messages FROM messages WHERE receiver_id = ? AND is_read = FALSE',
            [req.session.userId]
        );

        const [[{ unread_notifications }]] = await db.query(
            'SELECT COUNT(*) AS unread_notifications FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [req.session.userId]
        );

        res.json({
            user:               formatUser(user),
            listings:           listingRows.map(formatListing),
            reviews_given:      reviewRows.map(r => ({
                id:             String(r.id),
                rating:         r.rating,
                comment:        r.comment || '',
                date:           new Date(r.created_at).toLocaleDateString('ru-RU'),
                listing_title:  r.listing_title,
                listing_id:     String(r.listing_id),
            })),
            unread_messages:     Number(unread_messages),
            unread_notifications: Number(unread_notifications),
        });
    } catch (err) {
        console.error('profile GET error:', err);
        res.status(500).json({ error: 'Ошибка получения профиля' });
    }
});


router.get('/:userId', async (req, res) => {
    try {
        const [[user]] = await db.query(
            'SELECT id, name, avatar_url, bio, phone, is_landlord, created_at FROM users WHERE id = ?',
            [req.params.userId]
        );
        if (!user)
            return res.status(404).json({ error: 'Пользователь не найден' });

        const [listingRows] = await db.query(`
            SELECT l.*,
                   u.name AS owner_name, u.avatar_url AS owner_avatar,
                   u.bio AS owner_bio, u.phone AS owner_phone,
                   COALESCE(AVG(r.rating), 0) AS avg_rating,
                   COUNT(DISTINCT r.id) AS review_count,
                   COUNT(DISTINCT rm.id) AS roommate_count
            FROM listings l
            JOIN users u ON l.owner_id = u.id
            LEFT JOIN reviews r  ON r.listing_id  = l.id
            LEFT JOIN roommates rm ON rm.listing_id = l.id
            WHERE l.owner_id = ? AND l.is_active = TRUE
            GROUP BY l.id
            ORDER BY l.created_at DESC
        `, [req.params.userId]);


        res.json({
            user: {
                id:         String(user.id),
                name:       user.name,
                avatar:     user.avatar_url || '',
                bio:        user.bio || '',
                is_landlord: !!user.is_landlord,
                verified:   true,
                joinDate:   user.created_at
                    ? new Date(user.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
                    : '',
                rating:     0,
            },
            listings: listingRows.map(formatListing),
        });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;