require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const session    = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path       = require('path');
const fs         = require('fs');

const app = express();

// ── Безопасность ─────────────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3001',
];
app.use(cors({
    origin: (origin, callback) => {
        // Разрешаем запросы без origin (curl, Postman) и из списка
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,   // ВАЖНО: cookie передаётся только при credentials: true
}));

// ── Парсинг тела запроса ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Сессии в MySQL ─────────────────────────────────────────────────────────────
const sessionStore = new MySQLStore({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'rentmate',
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: { session_id: 'session_id', expires: 'expires', data: 'data' },
    },
});

const maxAgeDays = parseInt(process.env.SESSION_MAX_AGE_DAYS) || 7;

app.use(session({
    name:              'rentmate.sid',
    secret:            process.env.SESSION_SECRET || 'rentmate-dev-secret-change-in-prod',
    store:             sessionStore,
    resave:            false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge:   maxAgeDays * 24 * 60 * 60 * 1000,
    },
}));

// ── Rate limiting ──────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: 'Слишком много запросов. Попробуй через 15 минут.' }
}));
app.use(['/api/auth/login', '/api/auth/register'], rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Слишком много попыток входа. Попробуй через 15 минут.' }
}));

// ── Статика загрузок ──────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// ── Маршруты ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/listings',      require('./routes/listings'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/favorites',     require('./routes/favorites'));
app.use('/api/profile',       require('./routes/profile'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status:      'ok',
        project:     'RentMate',
        auth:        'express-session (cookie-based)',
        time:        new Date().toISOString(),
        env:         process.env.NODE_ENV || 'development',
        sessionUser: req.session.userId || null,
    });
});

app.get('/', (req, res) => {
    res.json({
        message:  '🏠 RentMate API работает!',
        version:  '1.0.0',
        endpoints: {
            'POST /api/auth/register':         'Регистрация',
            'POST /api/auth/login':            'Вход',
            'POST /api/auth/logout':           'Выход',
            'GET  /api/auth/me':               'Текущий пользователь',
            'PUT  /api/auth/profile':          'Обновить профиль',
            'GET  /api/listings':              'Список объявлений',
            'GET  /api/listings/:id':          'Одно объявление',
            'POST /api/listings':              'Создать объявление',
            'PUT  /api/listings/:id':          'Редактировать объявление',
            'DELETE /api/listings/:id':        'Удалить объявление',
            'POST /api/listings/:id/join':     'Стать жильцом',
            'DELETE /api/listings/:id/join':   'Покинуть жильцов',
            'GET  /api/reviews/listing/:id':   'Отзывы объявления',
            'POST /api/reviews':               'Добавить отзыв',
            'GET  /api/messages/conversations':'Диалоги',
            'GET  /api/messages/:userId':      'Переписка',
            'POST /api/messages':              'Отправить сообщение',
            'GET  /api/notifications':         'Уведомления',
            'GET  /api/notifications/unread-count': 'Количество непрочитанных',
            'PUT  /api/notifications/read-all':'Прочитать все уведомления',
            'PUT  /api/notifications/read/:id':'Прочитать уведомление',
            'GET  /api/favorites':             'Избранное',
            'GET  /api/favorites/ids':         'ID избранных',
            'POST /api/favorites':             'Добавить в избранное',
            'DELETE /api/favorites/:id':       'Удалить из избранного',
            'GET  /api/profile':               'Мой профиль',
            'GET  /api/profile/:userId':       'Профиль пользователя',
        }
    });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Маршрут ${req.method} ${req.path} не найден` });
});

// ── Глобальный обработчик ошибок ─────────────────────────────────────────────
app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error:  'Внутренняя ошибка сервера',
        detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ── Запуск ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🏠 RentMate Backend запущен!`);
    console.log(`   Порт:  ${PORT}`);
    console.log(`   URL:   http://localhost:${PORT}`);
    console.log(`   Auth:  express-session + MySQL`);
    console.log(`   Env:   ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;