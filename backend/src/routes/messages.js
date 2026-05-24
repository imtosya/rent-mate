const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');


router.get('/conversations', auth, async (req, res) => {
    try {
        const me = req.session.userId;


        const [rows] = await db.query(`
            SELECT
                m.id, m.content, m.created_at, m.is_read, m.sender_id, m.receiver_id, m.listing_id,
                CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AS other_id,
                u.name AS other_name, u.avatar_url AS other_avatar,
                l.title AS listing_title, l.id AS listing_id_fk,
                (SELECT COUNT(*) FROM messages unread
                 WHERE unread.receiver_id = ?
                   AND unread.sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
                   AND unread.is_read = FALSE) AS unread_count
            FROM messages m
                     JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
                     LEFT JOIN listings l ON m.listing_id = l.id
            WHERE m.id IN (
                SELECT MAX(id) FROM messages
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
            )
            ORDER BY m.created_at DESC
        `, [me, me, me, me, me, me]);


        const conversations = rows.map(row => ({
            id:           `conv_${Math.min(me, row.other_id)}_${Math.max(me, row.other_id)}`,
            participants: [String(me), String(row.other_id)],
            propertyId:   row.listing_id ? String(row.listing_id) : undefined,
            unreadCount:  Number(row.unread_count),
            otherUser: {
                id:     String(row.other_id),
                name:   row.other_name,
                avatar: row.other_avatar || '',
            },
            listing_title: row.listing_title || null,
            lastMessage: {
                id:             String(row.id),
                conversationId: `conv_${Math.min(me, row.other_id)}_${Math.max(me, row.other_id)}`,
                senderId:       String(row.sender_id),
                receiverId:     String(row.receiver_id),
                text:           row.content,
                timestamp:      row.created_at,
                read:           !!row.is_read,
                propertyId:     row.listing_id ? String(row.listing_id) : undefined,
            }
        }));

        res.json({ conversations });
    } catch (err) {
        console.error('conversations error:', err);
        res.status(500).json({ error: 'Ошибка получения диалогов' });
    }
});


router.get('/:userId', auth, async (req, res) => {
    try {
        const me    = req.session.userId;
        const other = +req.params.userId;

        const [rows] = await db.query(`
            SELECT m.*, s.name AS sender_name, s.avatar_url AS sender_avatar,
                   l.title AS listing_title
            FROM messages m
                     JOIN users s ON m.sender_id = s.id
                     LEFT JOIN listings l ON m.listing_id = l.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?)
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `, [me, other, other, me]);


        await db.query(
            'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
            [other, me]
        );

        const convId = `conv_${Math.min(me, other)}_${Math.max(me, other)}`;

        const messages = rows.map(row => ({
            id:             String(row.id),
            conversationId: convId,
            senderId:       String(row.sender_id),
            receiverId:     String(row.receiver_id),
            text:           row.content,
            timestamp:      row.created_at,
            read:           !!row.is_read,
            propertyId:     row.listing_id ? String(row.listing_id) : undefined,
            sender_name:    row.sender_name,
            sender_avatar:  row.sender_avatar || '',
            listing_title:  row.listing_title || null,
        }));

        res.json({ messages });
    } catch (err) {
        console.error('messages GET error:', err);
        res.status(500).json({ error: 'Ошибка получения сообщений' });
    }
});


router.post('/', auth, async (req, res) => {
    try {
        const { receiver_id, content, listing_id, is_escalated = false } = req.body;

        if (!receiver_id || !content?.trim())
            return res.status(400).json({ error: 'receiver_id и content обязательны' });
        if (+receiver_id === req.session.userId)
            return res.status(400).json({ error: 'Нельзя писать самому себе' });

        const [[receiver]] = await db.query('SELECT id, name FROM users WHERE id = ?', [receiver_id]);
        if (!receiver)
            return res.status(404).json({ error: 'Получатель не найден' });

        const [[sender]] = await db.query('SELECT name FROM users WHERE id = ?', [req.session.userId]);

        const [result] = await db.query(
            'INSERT INTO messages (sender_id, receiver_id, listing_id, content, is_escalated) VALUES (?, ?, ?, ?, ?)',
            [req.session.userId, +receiver_id, listing_id || null, content.trim(), !!is_escalated]
        );

        await db.query(
            'INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)',
            [+receiver_id,
                is_escalated ? 'escalated' : 'new_message',
                is_escalated ? 'Вопрос через AI-ассистент' : `Новое сообщение от ${sender.name}`,
                content.length > 80 ? content.slice(0, 80) + '...' : content,
                `/messages/${req.session.userId}`]
        );

        const me = req.session.userId;
        const other = +receiver_id;
        const convId = `conv_${Math.min(me, other)}_${Math.max(me, other)}`;

        res.status(201).json({
            message: 'Отправлено!',
            data: {
                id:             String(result.insertId),
                conversationId: convId,
                senderId:       String(me),
                receiverId:     String(other),
                text:           content.trim(),
                timestamp:      new Date().toISOString(),
                read:           false,
                propertyId:     listing_id ? String(listing_id) : undefined,
            }
        });
    } catch (err) {
        console.error('messages POST error:', err);
        res.status(500).json({ error: 'Ошибка отправки сообщения' });
    }
});

module.exports = router;