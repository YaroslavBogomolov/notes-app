FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY backend/package*.json ./backend/

# Устанавливаем зависимости
WORKDIR /app/backend
RUN npm ci --only=production

# Копируем весь код бэкенда и фронтенда
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Открываем порт
EXPOSE 3000

# Запускаем сервер
WORKDIR /app/backend
CMD ["node", "src/server.js"]
