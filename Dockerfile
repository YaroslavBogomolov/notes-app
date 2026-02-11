FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./backend/

WORKDIR /app/backend
RUN npm ci --only=production

COPY backend/ ./

WORKDIR /app
COPY frontend/ ./frontend/

EXPOSE 3000

WORKDIR /app/backend
CMD ["node", "src/server.js"]