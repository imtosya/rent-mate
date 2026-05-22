require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function init() {
    const conn = await mysql.createConnection({
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT) || 3306,
        user:     process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true,
        charset: 'utf8mb4',
    });

    console.log('Инициализация базы данных RentMate...\n');

    const dbName = process.env.DB_NAME || 'rentmate';

    const sql = `
    CREATE DATABASE IF NOT EXISTS \`${dbName}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    USE \`${dbName}\`;

    CREATE TABLE IF NOT EXISTS users (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(100)  NOT NULL,
      email         VARCHAR(150)  UNIQUE NOT NULL,
      password_hash VARCHAR(255)  NOT NULL,
      avatar_url    VARCHAR(500)  DEFAULT NULL,
      bio           TEXT          DEFAULT NULL,
      phone         VARCHAR(30)   DEFAULT NULL,
      is_landlord   BOOLEAN       DEFAULT FALSE,
      created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS listings (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      owner_id       INT           NOT NULL,
      title          VARCHAR(200)  NOT NULL,
      description    TEXT,
      price          DECIMAL(10,2) NOT NULL,
      city           VARCHAR(100)  DEFAULT 'Бишкек',
      district       VARCHAR(100)  DEFAULT NULL,
      address        VARCHAR(255),
      rooms          INT           DEFAULT 1,
      floor          INT           DEFAULT NULL,
      total_floors   INT           DEFAULT NULL,
      area_sqm       DECIMAL(6,1)  DEFAULT NULL,
      listing_type   ENUM('аренда','подселение','субаренда') DEFAULT 'аренда',
      pet_friendly   BOOLEAN       DEFAULT FALSE,
      gender_pref    ENUM('любой','только мужчины','только женщины') DEFAULT 'любой',
      wifi           BOOLEAN       DEFAULT FALSE,
      parking        BOOLEAN       DEFAULT FALSE,
      image_urls     JSON          DEFAULT NULL,
      is_active      BOOLEAN       DEFAULT TRUE,
      created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_city (city),
      INDEX idx_type (listing_type),
      INDEX idx_price (price),
      INDEX idx_owner (owner_id),
      INDEX idx_active (is_active)
    );

    CREATE TABLE IF NOT EXISTS roommates (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      listing_id  INT NOT NULL,
      user_id     INT NOT NULL,
      joined_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_roommate (listing_id, user_id),
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      listing_id  INT NOT NULL,
      author_id   INT NOT NULL,
      rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment     TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY one_review_per_user (listing_id, author_id),
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id)  REFERENCES users(id)    ON DELETE CASCADE,
      INDEX idx_listing (listing_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      sender_id    INT  NOT NULL,
      receiver_id  INT  NOT NULL,
      listing_id   INT  DEFAULT NULL,
      content      TEXT NOT NULL,
      is_read      BOOLEAN DEFAULT FALSE,
      is_escalated BOOLEAN DEFAULT FALSE,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id)   REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (listing_id)  REFERENCES listings(id) ON DELETE SET NULL,
      INDEX idx_sender   (sender_id),
      INDEX idx_receiver (receiver_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT          NOT NULL,
      type        VARCHAR(50)  NOT NULL,
      title       VARCHAR(200) NOT NULL,
      body        TEXT,
      link        VARCHAR(500) DEFAULT NULL,
      is_read     BOOLEAN      DEFAULT FALSE,
      created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user (user_id),
      INDEX idx_read (is_read)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NOT NULL,
      listing_id  INT NOT NULL,
      saved_price DECIMAL(10,2) DEFAULT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_favorite (user_id, listing_id),
      FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    );
    `;

    try {
        await conn.query(sql);
        console.log('✅ Таблицы созданы: users, listings, roommates, reviews, messages, notifications, favorites');

        // Создаём тестовых пользователей с реальными хешами паролей
        const hash = await bcrypt.hash('test123', 10);

        await conn.query(`USE \`${dbName}\``);

        await conn.query(`
            INSERT IGNORE INTO users (id, name, email, password_hash, bio, phone, is_landlord) VALUES
            (1, 'Айгуль Матова',    'aigul@test.com',  ?, 'Студентка АУЦА, ищу соседа',       '+996 700 111 111', FALSE),
            (2, 'Бакыт Осмонов',    'bakyt@test.com',  ?, 'Сдаю квартиры в Бишкеке',          '+996 700 222 222', TRUE),
            (3, 'Зарина Токтосун',  'zarina@test.com', ?, 'Ищу квартиру у КГТУ',              '+996 700 333 333', FALSE)
        `, [hash, hash, hash]);

        await conn.query(`
            INSERT IGNORE INTO listings
              (id, owner_id, title, description, price, city, district, address, rooms, area_sqm, listing_type, wifi, parking, pet_friendly, gender_pref, image_urls)
            VALUES
            (1, 2, '1-комнатная квартира у ЦУМа',
             'Уютная квартира в центре Бишкека. Рядом транспорт, магазины, АУЦА. Тихий двор. Включает интернет и коммуналку.',
             18000, 'Бишкек', 'Свердловский', 'ул. Киевская 77, кв. 12', 1, 42.5, 'аренда', TRUE, FALSE, FALSE, 'любой',
             '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]'),

            (2, 2, 'Подселение: ищем девушку',
             'Комната в 2-комнатной квартире. Живёт одна девушка-студентка. Рядом КГТУ и парк Горького. Все удобства.',
             9500,  'Бишкек', 'Октябрьский', 'ул. Токтогула 123', 2, 65.0, 'подселение', TRUE, TRUE, FALSE, 'только женщины',
             '["https://images.unsplash.com/photo-1616486232086-81d47190669a?w=800"]'),

            (3, 2, '2-комнатная квартира, пр. Манаса',
             'Светлая квартира с видом на горы. 5 минут до Ошского рынка. Мебель, техника, скоростной интернет.',
             25000, 'Бишкек', 'Первомайский', 'пр. Манаса 45', 2, 58.0, 'аренда', TRUE, FALSE, TRUE, 'любой',
             '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800","https://images.unsplash.com/photo-1653972233597-05822baa3c4e?w=800"]')
        `);

        await conn.query(`INSERT IGNORE INTO roommates (listing_id, user_id) VALUES (2, 1)`);

        console.log('\n✅ Тестовые данные добавлены:');
        console.log('   3 пользователя (пароль для всех: test123)');
        console.log('   3 объявления');
        console.log('\n🚀 База готова! Запускай: npm run dev\n');
    } catch (err) {
        console.error('❌ Ошибка:', err.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

init();