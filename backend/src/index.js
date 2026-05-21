require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const session      = require('express-session');
const MySQLStore   = require('connect-mysql-session')(session);
const path         = require('path');
const fs           = require('fs');

const app = express();


app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));


const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3001',
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


const sessionStore = new MySQLStore({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'rentmate',

    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires:    'expires',
            data:       'data',
        },
    },
});

const maxAgeDays = parseInt(process.env.SESSION_MAX_AGE_DAYS) || 7;

app.use(session({
    name:   'rentmate.sid',
    secret: process.env.SESSION_SECRET || 'rentmate-dev-secret-change-in-prod',
    store:  sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   maxAgeDays * 24 * 60 * 60 * 1000,
    },
}));


app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: 'Слишком много запросов. Попробуй через 15 минут.' }
}));


app.use(['/api/auth/login', '/api/auth/register'], rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Слишком много попыток. Попробуй через 15 минут.' }
}));


const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));


app.use('/api/auth',          require('./routes/auth'));
app.use('/api/listings',      require('./routes/listings'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/favorites',     require('./routes/favorites'));
app.use('/api/ai',            require('./routes/ai'));
app.use('/api/profile',       require('./routes/profile'));


app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        project: 'RentMate',
        auth: 'express-session (cookie-based, NOT JWT)',
        time: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        sessionUser: req.session.userId || null,
    });
});


app.get('/', (req, res) => {
    res.json({
        message: '🏠 RentMate API работает!',
        version: '1.0.0',
        auth: 'Sessions (express-session + MySQL store)',
        endpoints: {
            'POST /api/auth/register':  'Регистрация → создаёт сессию',
            'POST /api/auth/login':     'Вход → создаёт сессию, ставит cookie',
            'POST /api/auth/logout':    'Выход → УДАЛЯЕТ сессию с сервера',
            'GET  /api/auth/me':        'Текущий пользователь по cookie',
            'GET  /api/listings':       'Список объявлений с фильтрами',
            'GET  /api/listings/:id':   'Одно объявление + жильцы + отзывы',
            'POST /api/listings':       'Создать объявление (нужна сессия)',
            'PUT  /api/listings/:id':   'Редактировать своё объявление',
            'POST /api/reviews':        'Добавить отзыв',
            'GET  /api/messages/conversations': 'Список диалогов',
            'GET  /api/messages/:userId':       'Переписка с пользователем',
            'POST /api/messages':       'Отправить сообщение',
            'GET  /api/notifications':  'Уведомления',
            'GET  /api/favorites':      'Избранное',
            'POST /api/ai/chat':        'AI-ассистент квартиры',
            'POST /api/ai/atlas':       'ATLAS ментор команды',
            'GET  /api/profile':        'Мой профиль + объявления + отзывы',
        }
    });
});


app.use((req, res) => {
    res.status(404).json({ error: `Маршрут ${req.method} ${req.path} не найден` });
});


app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Внутренняя ошибка сервера',
        detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🏠 RentMate Backend запущен!`);
    console.log(`   Порт:  ${PORT}`);
    console.log(`   URL:   http://localhost:${PORT}`);
    console.log(`   Auth:  express-session + MySQL (не JWT!)`);
    console.log(`   Env:   ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
