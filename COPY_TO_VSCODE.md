# 📋 Инструкция: Как скопировать проект в VS Code

## 🎯 Быстрая инструкция

Все файлы уже готовы! Просто скопируйте всю папку проекта в VS Code.

### Вариант 1: Копирование всей папки (РЕКОМЕНДУЕТСЯ)

1. **Скопируйте всю папку** `/workspaces/default/code` в любое место на вашем компьютере
2. Переименуйте папку в `roommate-platform` (или любое другое имя)
3. Откройте эту папку в VS Code: `File → Open Folder...`
4. Откройте терминал в VS Code: `Terminal → New Terminal`
5. Установите зависимости:
   ```bash
   pnpm install
   # или
   npm install
   ```
6. Запустите проект:
   ```bash
   pnpm dev
   # или
   npm run dev
   ```

### Вариант 2: Создание проекта с нуля

Если хотите создать проект с нуля, следуйте этим шагам:

1. **Создайте новую папку для проекта:**
   ```bash
   mkdir roommate-platform
   cd roommate-platform
   ```

2. **Скопируйте файлы в следующем порядке:**

   📦 **Корень проекта:**
   - `package.json`
   - `vite.config.ts`
   - `tsconfig.json`
   - `.gitignore`
   - `README.md`

   📁 **src/main.tsx**

   📁 **src/styles/**
   - `theme.css`
   - `fonts.css`

   📁 **src/app/**
   - `types.ts`
   - `App.tsx`

   📁 **src/app/components/**
   - `Navbar.tsx`
   - `HeroSection.tsx`
   - `PropertyCard.tsx`
   - `PropertyDetailModal.tsx`
   - `FilterPanel.tsx`
   - `AIChatAssistant.tsx`
   - `UserProfile.tsx`
   - `ListPropertyForm.tsx`
   - `FavoritesView.tsx`
   - `MessagesView.tsx`
   - `NotificationsView.tsx`

3. **Установите зависимости:**
   ```bash
   npm install
   ```

4. **Запустите проект:**
   ```bash
   npm run dev
   ```

---

## 📂 Полная структура проекта

```
roommate-platform/
├── src/
│   ├── main.tsx                     ✅ Точка входа
│   ├── app/
│   │   ├── types.ts                 ✅ TypeScript типы
│   │   ├── App.tsx                  ✅ Главный компонент
│   │   └── components/
│   │       ├── Navbar.tsx           ✅ Навигация
│   │       ├── HeroSection.tsx      ✅ Hero секция
│   │       ├── PropertyCard.tsx     ✅ Карточка квартиры
│   │       ├── PropertyDetailModal.tsx  ✅ Детали
│   │       ├── FilterPanel.tsx      ✅ Фильтры
│   │       ├── AIChatAssistant.tsx  ✅ AI чат
│   │       ├── UserProfile.tsx      ✅ Профиль
│   │       ├── ListPropertyForm.tsx ✅ Форма добавления
│   │       ├── FavoritesView.tsx    ✅ Избранное
│   │       ├── MessagesView.tsx     ✅ Сообщения
│   │       └── NotificationsView.tsx ✅ Уведомления
│   └── styles/
│       ├── theme.css                ✅ Тема (темно-зеленая)
│       └── fonts.css                ✅ Шрифты
├── package.json                     ✅ Зависимости
├── vite.config.ts                   ✅ Конфиг Vite
├── tsconfig.json                    ✅ Конфиг TypeScript
├── .gitignore                       ✅ Git ignore
└── README.md                        ✅ Документация
```

---

## ✅ Проверка перед запуском

Убедитесь, что у вас установлено:

- ✅ **Node.js** версии 18 или выше
- ✅ **npm** или **pnpm**

Проверить версии:
```bash
node --version  # должно быть v18 или выше
npm --version   # любая актуальная версия
```

---

## 🎨 Что уже работает

После запуска проекта (`npm run dev`) вы получите:

✅ **Главная страница** с Hero секцией и поиском  
✅ **Карточки квартир** с фото, ценой, рейтингом  
✅ **Работающий поиск** по названию и локации  
✅ **Фильтры** (цена, комнаты, рейтинг, тип, питомцы, пол)  
✅ **Детальные страницы** каждой квартиры с галереей  
✅ **AI чат-ассистент** с готовыми ответами  
✅ **Избранное** - сохранение понравившихся квартир  
✅ **Профиль пользователя** с историей аренды  
✅ **Сообщения и уведомления**  
✅ **Форма добавления** новых квартир  
✅ **Полностью responsive** дизайн  
✅ **Премиум темно-зеленый** дизайн  
✅ **Плавные анимации** и переходы  

---

## 🚀 Команды для работы

```bash
# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр продакшен сборки
npm run preview
```

---

## 💡 Советы для работы в VS Code

### Рекомендуемые расширения:

1. **ES7+ React/Redux/React-Native snippets** - сниппеты для React
2. **Tailwind CSS IntelliSense** - автодополнение для Tailwind
3. **TypeScript Vue Plugin (Volar)** - поддержка TypeScript
4. **Prettier - Code formatter** - форматирование кода
5. **ESLint** - линтинг

### Горячие клавиши:

- `Ctrl + ~` - открыть/закрыть терминал
- `Ctrl + P` - быстрый поиск файлов
- `Ctrl + Shift + P` - command palette
- `Alt + Shift + F` - форматировать код

---

## 🔧 Что делать при ошибках

### Ошибка: "Cannot find module"
```bash
# Удалите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
```

### Ошибка: "Port already in use"
```bash
# Vite попробует использовать другой порт автоматически
# Или вы можете указать порт вручную в vite.config.ts
```

### Ошибка с Tailwind CSS
```bash
# Убедитесь, что установлен @tailwindcss/vite
npm install -D @tailwindcss/vite tailwindcss
```

---

## 🎯 Готово!

После выполнения всех шагов ваш проект будет полностью готов к работе в VS Code!

Откройте браузер и перейдите по адресу: **http://localhost:5173**

---

**Приятной работы! 🚀**
