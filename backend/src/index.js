require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const session    = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path       = require('path');
const fs         = require('fs');
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const { getAIResponse } = require('./ai');

const app = express();
app.set('trust proxy', 1);

// ── Безопасность ─────────────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3001',
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,
}));

// ── Парсинг тела запроса ──────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
        domain:   process.env.SESSION_DOMAIN || undefined,
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

// ── Multer для загрузки файлов ────────────────────────────────────────────────
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'rentmate',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Только изображения'));
    }
});

// ── Маршруты ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/listings',      require('./routes/listings'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/favorites',     require('./routes/favorites'));
app.use('/api/profile',       require('./routes/profile'));

// ── Загрузка файлов ───────────────────────────────────────────────────────────
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
    const url = req.file.path;
    res.json({ url });
});

// ── AI Assistant ─────────────────────────────────────────────────────────────
app.post('/api/ai/respond', async (req, res) => {
    const { message } = req.body;
    try {
        const result = await getAIResponse(message);
        res.json(result);
    } catch (e) {
        console.error('AI Error:', e);
        res.status(500).json({ error: 'AI временно недоступен' });
    }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status:      'ok',
        project:     'RentMate',
        time:        new Date().toISOString(),
        env:         process.env.NODE_ENV || 'development',
        sessionUser: req.session.userId || null,
    });
});

app.get('/', (req, res) => {
    res.json({ message: '🏠 RentMate API работает!' });
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