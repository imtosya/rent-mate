const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const [notifications] = await db.query(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.session.userId]);
        res.json({ notifications });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка получения уведомлений' });
    }
});

router.get('/unread-count', auth, async (req, res) => {
    try {
        const [[{ count }]] = await db.query(
            'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [req.session.userId]
        );
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

router.put('/read/:id', auth, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [req.params.id, req.session.userId]
        );
        res.json({ message: 'Прочитано' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

router.put('/read-all', auth, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
            [req.session.userId]
        );
        res.json({ message: 'Все уведомления прочитаны' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;
