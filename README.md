# Notes App

Простое веб-приложение для заметок. Можно добавлять, смотреть и удалять заметки.

## Что умеет

- Показывать все заметки
- Добавлять новую заметку
- Удалять заметку
- Проверять работает ли сервер

Внутри есть API:
- `GET /api/notes` – получить все заметки
- `POST /api/notes` – создать заметку
- `DELETE /api/notes/:id` – удалить заметку
- `GET /health` – проверка работы сервера

## Что использовано

- Node.js и Express – для сервера
- PostgreSQL – для хранения данных
- Docker и Docker Compose – для запуска в контейнерах
- GitHub Actions – для автоматических проверок и деплоя
- Railway – хостинг для бэкенда
- GitHub Pages – хостинг для фронтенда

## Как запустить локально

1. Перейдите в папку `backend`:
   ```
   cd backend
   ```

2. Установите зависимости:
   ```
   npm install
   ```

3. Создайте файл `.env` внутри `backend` и добавьте:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/notesdb
   PORT=3000
   NODE_ENV=development
   ```

4. Запустите PostgreSQL через Docker:
   ```
   docker run --name notes-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=notesdb -p 5432:5432 -d postgres:15-alpine
   ```

5. Запустите сервер:
   ```
   npm start
   ```

6. Откройте в браузере: http://localhost:3000

## Как запустить через Docker

Если хотите поднять всё в контейнерах, выполните в корне проекта:

```
docker-compose up --build
```

После этого сайт будет доступен по адресу: http://localhost:3000

## Как работает автоматизация

**Проверки при Pull Request**  
Когда вы создаёте Pull Request в ветку `main`, GitHub Actions автоматически запускает:
- Проверку стиля кода (линтер)
- Тесты (проверяют, что API работает)
- Сборку Docker-образа

Если что-то не проходит, Pull Request нельзя смержить.

**Деплой после мержа**  
Когда Pull Request слит в `main`, автоматически:
- Бэкенд загружается на Railway
- Фронтенд загружается на GitHub Pages

Всё это происходит без вашего участия.

## Переменные окружения

Для работы приложения нужны следующие настройки:

| Название | Для чего | Пример |
|----------|----------|--------|
| `DATABASE_URL` | Подключение к базе данных | `postgresql://user:pass@host:5432/db` |
| `PORT` | Порт сервера | `3000` |
| `NODE_ENV` | Режим работы | `production` |

## Где посмотреть работающий сайт

- Основной сайт (бэкенд + фронтенд)	https://notes-app-production-038d.up.railway.app
- Фронтенд (отдельная страница): https://yaroslavbogomolov.github.io/notes-app/
- Проверка работы сервера: https://notes-app-production-038d.up.railway.app/health
