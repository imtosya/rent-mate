const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
    try {
        const { listing_id, rating, comment } = req.body;
        if (!listing_id || !rating) return res.status(400).json({ error: 'listing_id и rating обязательны' });
        if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Рейтинг от 1 до 5' });

        const [[listing]] = await db.query('SELECT id,owner_id,title FROM listings WHERE id=?', [listing_id]);
        if (!listing) return res.status(404).json({ error: 'Объявление не найдено' });
        if (listing.owner_id === req.session.userId)
            return res.status(400).json({ error: 'Нельзя оставить отзыв на своё объявление' });

        await db.query(`
      INSERT INTO reviews (listing_id,author_id,rating,comment) VALUES (?,?,?,?)
      ON DUPLICATE KEY UPDATE rating=VALUES(rating), comment=VALUES(comment)
    `, [listing_id, req.session.userId, rating, comment||null]);

        await db.query('INSERT INTO notifications (user_id,type,title,body,link) VALUES (?,?,?,?,?)',
            [listing.owner_id, 'new_review', `Новый отзыв на "${listing.title}"`,
                `Оценка: ${rating}/5`, `/listings/${listing_id}`]);

        res.status(201).json({ message: 'Отзыв добавлен!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка добавления отзыва' });
    }
});

router.get('/listing/:listingId', async (req, res) => {
    try {
        const [reviews] = await db.query(`
      SELECT r.*, u.name AS author_name, u.avatar_url AS author_avatar
      FROM reviews r JOIN users u ON r.author_id=u.id
      WHERE r.listing_id=? ORDER BY r.created_at DESC
    `, [req.params.listingId]);
        res.json({ reviews });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM reviews WHERE id=? AND author_id=?',
            [req.params.id, req.session.userId]);
        if (!result.affectedRows) return res.status(404).json({ error: 'Отзыв не найден или не твой' });
        res.json({ message: 'Отзыв удалён' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;
