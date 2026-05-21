const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

router.get('/conversations', auth, async (req, res) => {
    try {
        const me = req.session.userId;
        const [rows] = await db.query(`
      SELECT m.*,
        CASE WHEN m.sender_id=? THEN m.receiver_id ELSE m.sender_id END AS other_id,
        u.name AS other_name, u.avatar_url AS other_avatar,
        l.title AS listing_title
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id=? THEN m.receiver_id ELSE m.sender_id END
      LEFT JOIN listings l ON m.listing_id = l.id
      WHERE m.id IN (
        SELECT MAX(id) FROM messages
        WHERE sender_id=? OR receiver_id=?
        GROUP BY LEAST(sender_id,receiver_id), GREATEST(sender_id,receiver_id)
      )
      ORDER BY m.created_at DESC
    `, [me, me, me, me]);
        res.json({ conversations: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения диалогов' });
    }
});

router.get('/:userId', auth, async (req, res) => {
    try {
        const me    = req.session.userId;
        const other = +req.params.userId;
        const [messages] = await db.query(`
      SELECT m.*, s.name AS sender_name, s.avatar_url AS sender_avatar, l.title AS listing_title
      FROM messages m JOIN users s ON m.sender_id=s.id
      LEFT JOIN listings l ON m.listing_id=l.id
      WHERE (m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?)
      ORDER BY m.created_at ASC
    `, [me, other, other, me]);

        await db.query('UPDATE messages SET is_read=TRUE WHERE sender_id=? AND receiver_id=? AND is_read=FALSE',
            [other, me]);
        res.json({ messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения сообщений' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { receiver_id, content, listing_id, is_escalated=false } = req.body;
        if (!receiver_id || !content?.trim()) return res.status(400).json({ error: 'receiver_id и content обязательны' });
        if (+receiver_id === req.session.userId) return res.status(400).json({ error: 'Нельзя писать самому себе' });

        const [[receiver]] = await db.query('SELECT id,name FROM users WHERE id=?', [receiver_id]);
        if (!receiver) return res.status(404).json({ error: 'Получатель не найден' });

        const [[sender]] = await db.query('SELECT name FROM users WHERE id=?', [req.session.userId]);

        const [result] = await db.query(
            'INSERT INTO messages (sender_id,receiver_id,listing_id,content,is_escalated) VALUES (?,?,?,?,?)',
            [req.session.userId, receiver_id, listing_id||null, content.trim(), !!is_escalated]
        );

        await db.query('INSERT INTO notifications (user_id,type,title,body,link) VALUES (?,?,?,?,?)',
            [receiver_id,
                is_escalated ? 'escalated' : 'new_message',
                is_escalated ? 'Вопрос через AI-ассистент' : `Новое сообщение от ${sender.name}`,
                content.length > 80 ? content.slice(0,80)+'...' : content,
                `/messages/${req.session.userId}`]
        );

        const [[message]] = await db.query('SELECT * FROM messages WHERE id=?', [result.insertId]);
        res.status(201).json({ message: 'Отправлено!', data: message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка отправки сообщения' });
    }
});

module.exports = router;
