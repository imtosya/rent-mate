const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

// Форматируем уведомление в тип Notification фронтенда
function formatNotification(row) {
    // type из БД: new_message | new_review | price_drop | escalated | status_change
    // type на фронтенде: 'message' | 'review' | 'favorite' | 'system' | 'price_drop' | 'new_listing'
    const typeMap = {
        new_message:   'message',
        escalated:     'message',
        new_review:    'review',
        price_drop:    'price_drop',
        status_change: 'system',
        new_listing:   'new_listing',
    };

    // Извлекаем propertyId и userId из link (например /listings/5 или /messages/3)
    let propertyId, userId, targetType, targetId;
    if (row.link) {
        const listingMatch = row.link.match(/\/listings\/(\d+)/);
        const messageMatch = row.link.match(/\/messages\/(\d+)/);
        if (listingMatch) {
            propertyId = listingMatch[1];
            targetType = 'property';
            targetId   = listingMatch[1];
        }
        if (messageMatch) {
            userId     = messageMatch[1];
            targetType = 'chat';
            targetId   = messageMatch[1];
        }
    }

    return {
        id:         String(row.id),
        title:      row.title,
        message:    row.body || '',
        timestamp:  new Date(row.created_at).toLocaleString('ru-RU'),
        read:       !!row.is_read,
        type:       typeMap[row.type] || 'system',
        targetType: targetType,
        targetId:   targetId,
        propertyId: propertyId,
        userId:     userId,
        link:       row.link || null,
        created_at: row.created_at,
    };
}

// GET /api/notifications
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        `, [req.session.userId]);

        res.json({ notifications: rows.map(formatNotification) });
    } catch (err) {
        console.error('notifications GET error:', err);
        res.status(500).json({ error: 'Ошибка получения уведомлений' });
    }
});

// GET /api/notifications/unread-count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const [[{ count }]] = await db.query(
            'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [req.session.userId]
        );
        res.json({ count: Number(count) });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// PUT /api/notifications/read-all
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

// PUT /api/notifications/read/:id
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

module.exports = router;