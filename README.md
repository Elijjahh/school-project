# School project

Есть два способа собрать проект: в режиме разработки и для прода

> Перед запуском приложения нужно создать .env файл. Пример его содержания можно найти в .env.example

## Важно: Хранение файлов (MinIO/S3)

Для загрузки и хранения файлов (например, аватарок пользователей) используется S3-совместимое хранилище MinIO, которое поднимается вместе с проектом через Docker Compose.

- В режиме разработки и продакшене файлы будут храниться в MinIO (S3 совместимое хранилище).
- Для доступа к файлам и управления бакетами доступна web-консоль MinIO: http://localhost:9001 (логин/пароль по умолчанию: minioadmin/minioadmin)
- Все загруженные файлы попадают в бакет `uploads` (можно изменить через переменные окружения).

> После первого запуска MinIO, зайдите в web-консоль и создайте бакет с именем, указанным в S3_BUCKET (по умолчанию uploads).

## В режиме разработки

### Поднять БД и MinIO с помощью [Docker](https://www.docker.com/)

```bash
# Запустит БД на localhost:5432
# MinIO API на localhost:9000, web-консоль на localhost:9001
docker compose -f docker-compose.dev.yml up --build -d --remove-orphans
```

### Настройка

Установка библиотек:

```bash
# npm
npm install

# ИЛИ

# bun
bun install
```

## Работа с базой данных

Для применения уже существующих миграций

```bash
# npm
npm run db:migrate

# ИЛИ

# bun
bun db:migrate
```

Для создания миграций

```bash
# npm
npm run db:generate

# ИЛИ

# bun
bun db:generate
```

> Обязательно нужно создать миграции перед добавлением изменений БД в репозиторий

Для прототипирования можно сразу запушить изменения из схемы напрямую в БД (без создания миграций).

```bash
# npm
npm run db:push

# ИЛИ

# bun
bun db:push
```

### Запуск приложения

Запустить приложение в режиме разработки на `http://localhost:3000`:

```bash
# npm
npm run dev

# ИЛИ

# bun
bun dev
```

## Для прода

### Поднимет все контейнеры для прода с помощью [Docker](https://www.docker.com/)

Запустит приложение на `http://localhost:3001`

```bash
docker compose up --build -d --remove-orphans
```

## Файловое хранилище: доступ и troubleshooting

- Все загруженные файлы доступны по ссылкам вида: `http://localhost:9000/uploads/имя_файла`
- Если файлы не доступны извне, проверьте политику доступа бакета в MinIO (разрешите public read для бакета uploads)
- Для продакшена настройте переменные окружения S3_PUBLIC_URL и S3_BUCKET согласно вашему хранилищу

## Полезные ссылки

[Сайт Docker](https://www.docker.com/)

[Документация Nuxt](https://nuxt.com/docs/getting-started/introduction)

### Backend

[Документация Nitro](https://nitro.unjs.io/guide)

[Документация Drizzle](https://orm.drizzle.team)

### Frontend

[Документация Vue](https://vuejs.org/guide/introduction.html)

[Документация Pinia](https://pinia.vuejs.org/introduction.html)

[Документация PrimeVue](https://primevue.org/introduction/)

[Документация VueUse](https://vueuse.org/guide/)

[Документация VeeValidate](https://vee-validate.logaretm.com/v4/guide/overview/)
