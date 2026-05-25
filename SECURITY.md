# Безопасность RentMate

**Проект:** RentMate — сайт аренды жилья  
**Инженер:** Календерова Айтурган
**Роль:** DevSecOps Engineer  

---

## Реализованные меры защиты

### Аутентификация
- Хеширование паролей через bcrypt (salt rounds: 10)
- Сессионная аутентификация через express-session + MySQL store
- Автоматическое истечение сессий через 7 дней
- Пароли никогда не возвращаются в ответах API (функция safeUser)

### Защита от атак
- Rate limiting: 500 запросов / 15 мин на всё API
- Rate limiting: 20 попыток / 15 мин на /login и /register (защита от брутфорса)
- Защита от SQL-инъекций через параметризованные запросы (?)
- CORS — разрешены только доверенные домены
- Helmet.js — автоматические заголовки безопасности (CSP, XSS protection и др.)

### Безопасность данных
- Все секреты через переменные окружения (.env)
- .env никогда не попадает в GitHub (.gitignore)
- Переменные окружения хранятся в Railway Variables
- Маскировка чувствительных данных в ответах API

---

## Security Audit — npm audit

**Дата:** 25 мая 2026  
**Инструмент:** npm audit  

### Обнаружено:
- Пакет: vite <=6.4.1
- Severity: HIGH
- Уязвимости: Path Traversal, обход server.fs, чтение файлов через WebSocket

### Действия:
- Выполнена команда: npm audit fix --force
- Установлена безопасная версия: vite@6.4.2

### Результат после исправления:
found 0 vulnerabilities ✅

---

## Деплой и инфраструктура

- Фронтенд: https://wholesome-eagerness-production-dc88.up.railway.app
- Бэкенд: https://rent-mate-production.up.railway.app
- База данных MySQL размещена на Railway
- Все секреты хранятся в Railway Variables, не в коде
- Auto-deploy настроен через GitHub — каждый push в main обновляет сайт автоматически

- Проект задеплоен на Railway
- Бэкенд: https://rent-mate-production.up.railway.app/
- Фронтенд: https://wholesome-eagerness-production-dc88.up.railway.app/
- База данных MySQL размещена на Railway
- Auto-deploy настроен через GitHub (каждый push в main)
