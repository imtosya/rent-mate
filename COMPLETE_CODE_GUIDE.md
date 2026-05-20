# 🏠 RoomMate Platform - Полный код проекта

## 📦 package.json

```json
{
  "name": "roommate-platform",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.487.0",
    "motion": "^12.23.24",
    "tailwind-merge": "^3.2.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.7.0",
    "@tailwindcss/vite": "^4.1.12",
    "tailwindcss": "^4.1.12",
    "typescript": "^5.5.3",
    "vite": "^6.3.5"
  }
}
```

## 🔧 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

## 📝 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

## 🌐 index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RoomMate - Find Your Perfect Home</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## 🎨 src/main.tsx

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './styles/theme.css'
import './styles/fonts.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## 💎 src/styles/fonts.css

```css
/* Добавьте сюда импорты шрифтов при необходимости */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 📂 Все компоненты находятся в отдельных файлах

### Структура файлов:

1. **src/app/types.ts** - TypeScript типы
2. **src/app/App.tsx** - Главный компонент
3. **src/app/components/Navbar.tsx** - Навигационная панель
4. **src/app/components/HeroSection.tsx** - Hero секция с поиском
5. **src/app/components/PropertyCard.tsx** - Карточка квартиры
6. **src/app/components/PropertyDetailModal.tsx** - Модальное окно деталей
7. **src/app/components/FilterPanel.tsx** - Панель фильтров
8. **src/app/components/AIChatAssistant.tsx** - AI чат ассистент
9. **src/app/components/UserProfile.tsx** - Профиль пользователя
10. **src/app/components/ListPropertyForm.tsx** - Форма добавления квартиры
11. **src/app/components/FavoritesView.tsx** - Страница избранного
12. **src/app/components/MessagesView.tsx** - Страница сообщений
13. **src/app/components/NotificationsView.tsx** - Страница уведомлений
14. **src/styles/theme.css** - Тема с цветами

---

## 🚀 Инструкция по запуску

### Вариант 1: С нуля

1. Создайте папку проекта:
```bash
mkdir roommate-platform
cd roommate-platform
```

2. Скопируйте все файлы в соответствующие папки

3. Установите зависимости:
```bash
npm install
```

4. Запустите проект:
```bash
npm run dev
```

### Вариант 2: Быстрый старт с Vite

```bash
npm create vite@latest roommate-platform -- --template react-ts
cd roommate-platform
npm install
npm install lucide-react motion tailwind-merge clsx
npm install -D @tailwindcss/vite tailwindcss
```

Затем замените файлы на те, что указаны выше.

---

## 📋 Список всех файлов для копирования

Все файлы уже созданы в текущем проекте:

- ✅ package.json
- ✅ vite.config.ts (если нужен, создайте)
- ✅ tsconfig.json (если нужен, создайте)
- ✅ index.html (если нужен, создайте)
- ✅ src/main.tsx (если нужен, создайте)
- ✅ src/styles/theme.css
- ✅ src/styles/fonts.css (создан выше)
- ✅ src/app/types.ts
- ✅ src/app/App.tsx
- ✅ src/app/components/Navbar.tsx
- ✅ src/app/components/HeroSection.tsx
- ✅ src/app/components/PropertyCard.tsx
- ✅ src/app/components/PropertyDetailModal.tsx
- ✅ src/app/components/FilterPanel.tsx
- ✅ src/app/components/AIChatAssistant.tsx
- ✅ src/app/components/UserProfile.tsx
- ✅ src/app/components/ListPropertyForm.tsx
- ✅ src/app/components/FavoritesView.tsx
- ✅ src/app/components/MessagesView.tsx
- ✅ src/app/components/NotificationsView.tsx

---

## 🎯 Готово к работе!

После установки всех зависимостей и копирования файлов, проект полностью готов к работе в VS Code.

Используйте:
- `npm run dev` - для разработки
- `npm run build` - для сборки продакшн версии
- `npm run preview` - для предпросмотра продакшн сборки
