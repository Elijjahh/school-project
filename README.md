# School project

Есть два способа собрать проект: в режиме разработки и для прода

> Перед запуском приложения нужно создать .env файл. Пример его содержания можно найти в .env.example

## В режиме разработки

### Поднять БД и SMTP сервер с помощью [Docker](https://www.docker.com/)

```bash
# Запустит БД на localhost:5432
# А SMTP сервер на localhost:2525, ui для него на localhost:5050
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

### Работа с базой данных

Для применения уже существующих миграций или создания новых (Смотрите package.json, чтобы увидеть доступные скрипты)

```bash
# npm
npm run db:migrate

# ИЛИ

# bun
bun db:migrate
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
