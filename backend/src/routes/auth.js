const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db     = require('../config/db');
const auth   = require('../middleware/auth');

// Преобразует запись из БД в формат, который ожидает фронтенд
function formatUser(user) {
    return {
        id:         String(user.id),
        name:       user.name,
        email:      user.email,
        phone:      user.phone  || '',
        avatar:     user.avatar_url || '',
        bio:        user.bio    || '',
        is_landlord: !!user.is_landlord,
        verified:   true,   // считаем всех зарегистрированных верифицированными
        joinDate:   user.created_at
            ? new Date(user.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
            : '',
        rating:     0,      // рейтинг считаем по отзывам отдельно
        created_at: user.created_at,
    };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone = '', is_landlord = false } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ error: 'Заполни имя, email и пароль' });

        if (password.length < 6)
            return res.status(400).json({ error: 'Пароль минимум 6 символов' });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            return res.status(400).json({ error: 'Неверный формат email' });

        const [[existing]] = await db.query(
            'SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]
        );
        if (existing)
            return res.status(400).json({ error: 'Этот email уже зарегистрирован' });

        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, phone, is_landlord) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), email.toLowerCase().trim(), password_hash, phone.trim(), !!is_landlord]
        );

        const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);

        req.session.userId    = user.id;
        req.session.userEmail = user.email;

        res.status(201).json({
            message: 'Аккаунт создан!',
            user: formatUser(user)
        });
    } catch (err) {
        console.error('register error:', err);
        res.status(500).json({ error: 'Ошибка сервера при регистрации' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: 'Введи email и пароль' });

        const [[user]] = await db.query(
            'SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]
        );

        if (!user)
            return res.status(401).json({ error: 'Пользователь не найден' });

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok)
            return res.status(401).json({ error: 'Неверный пароль' });

        req.session.userId    = user.id;
        req.session.userEmail = user.email;

        res.json({
            message: 'Вход выполнен!',
            user: formatUser(user)
        });
    } catch (err) {
        console.error('login error:', err);
        res.status(500).json({ error: 'Ошибка сервера при входе' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        res.clearCookie('rentmate.sid');
        if (err) {
            console.error('logout error:', err);
            return res.status(500).json({ error: 'Ошибка при выходе' });
        }
        res.json({ message: 'Вышел из аккаунта' });
    });
});

// GET /api/auth/me  — текущий пользователь по cookie
router.get('/me', auth, async (req, res) => {
    try {
        const [[user]] = await db.query(
            'SELECT * FROM users WHERE id = ?', [req.session.userId]
        );
        if (!user)
            return res.status(404).json({ error: 'Пользователь не найден' });

        res.json({ user: formatUser(user) });
    } catch (err) {
        console.error('me error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// PUT /api/auth/profile  — обновление профиля текущего пользователя
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, bio, phone, avatar_url } = req.body;

        await db.query(
            `UPDATE users SET
                              name       = COALESCE(?, name),
                              bio        = COALESCE(?, bio),
                              phone      = COALESCE(?, phone),
                              avatar_url = COALESCE(?, avatar_url)
             WHERE id = ?`,
            [name || null, bio || null, phone || null, avatar_url || null, req.session.userId]
        );

        const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [req.session.userId]);
        res.json({ message: 'Профиль обновлён', user: formatUser(user) });
    } catch (err) {
        console.error('profile update error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;
module.exports.formatUser = formatUser;