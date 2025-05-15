# Структура проекта

## Основные директории и файлы

```
/корень-проекта
  ├── .git
  ├── .nuxt
  ├── assets/
  ├── components/
  ├── context/
  ├── drizzle/
  ├── layouts/
  ├── lib/
  ├── middleware/
  ├── node_modules/
  ├── pages/
  ├── public/
  ├── server/
  ├── stores/
  ├── .dockerignore
  ├── .env*
  ├── .gitignore
  ├── .prettierrc.json
  ├── app.vue
  ├── auth.d.ts
  ├── bun.lockb
  ├── components.json
  ├── docker-compose*
  ├── Dockerfile
  ├── drizzle.config.ts
  ├── eslint.config.mjs
  ├── nuxt.config.ts
  ├── package.json
  ├── README.md
  ├── tailwind.config.ts
  ├── tsconfig.json
  ├── ...
```

## Описание директорий и файлов

- **.git/** — служебные файлы git
- **.nuxt/** — сгенерированные Nuxt файлы (не редактировать вручную)
- **assets/** — стили (css, scss), изображения, шрифты
- **components/** — Vue-компоненты, используемые в приложении
- **context/** — документация и справочная информация о проекте
- **drizzle/** — миграции, схема БД, файлы Drizzle ORM
- **layouts/** — layout-файлы для Nuxt
- **lib/** — автосгенерированные утилиты и вспомогательные функции
- **middleware/** — middleware для Nuxt
- **node_modules/** — установленные npm-пакеты
- **pages/** — страницы приложения (Nuxt routing)
- **public/** — статические файлы, доступные напрямую
- **server/** — серверная логика (эндпоинты, middleware, utils)
  - **server/api/** — API-эндпоинты
  - **server/middleware/** — серверные middleware
  - **server/utils/** — серверные утилиты
- **stores/** — Pinia-сторы (глобальное состояние)
- **.dockerignore** — файлы, игнорируемые Docker
- **.env\*** — переменные окружения
- **.gitignore** — файлы, игнорируемые git
- **.prettierrc.json** — настройки форматирования Prettier
- **app.vue** — корневой компонент приложения
- **auth.d.ts** — глобальные типы для авторизации
- **bun.lockb** — lock-файл для bun
- **components.json** — конфиг shadcn компонентов
- **docker-compose\*** — конфиги для docker-compose
- **Dockerfile** — конфиг Docker
- **drizzle.config.ts** — конфиг Drizzle ORM
- **eslint.config.mjs** — конфиг eslint
- **nuxt.config.ts** — основной конфиг Nuxt
- **package.json** — зависимости и скрипты npm
- **README.md** — основная документация проекта
- **tailwind.config.ts** — конфиг Tailwind CSS
- **tsconfig.json** — конфиг TypeScript

## Особенности структуры

- Все бизнес-логика и работа с данными вынесены в server/ и drizzle/
- Для глобального состояния используется Pinia (stores/)
- Для стилей используется Tailwind CSS (assets/, tailwind.config.ts)
- Документация и справка по проекту — в папке context/
- Компоненты переиспользуются через папку components/
- Layout'ы и middleware разделены по назначению (layouts/, middleware/, server/middleware/)
- Конфиги вынесены в корень проекта

## Подробная структура проекта с описаниями и связями

```
/ (корень проекта)
  |-- .gitignore                # Список файлов и папок, игнорируемых git (служебный)
  |-- .dockerignore             # Список файлов и папок, игнорируемых Docker (служебный)
  |-- .prettierrc.json          # Конфиг Prettier для автоформатирования кода
  |-- app.vue                   # Корневой Vue-компонент, точка входа UI, подключает layout
  |-- auth.d.ts                 # Глобальные типы для авторизации, используются в серверных и клиентских файлах
  |-- bun.lockb                 # Lock-файл для bun (служебный, автогенерируется)
  |-- components.json           # Конфиг shadcn компонентов для UI-библиотеки
  |-- docker-compose.yml        # Docker Compose конфиг для запуска всех сервисов (продакшн)
  |-- docker-compose.dev.yml    # Docker Compose конфиг для разработки
  |-- Dockerfile                # Dockerfile для сборки контейнера приложения
  |-- drizzle.config.ts         # Конфиг Drizzle ORM для работы с БД
  |-- eslint.config.mjs         # Конфиг eslint для линтинга кода
  |-- nuxt.config.ts            # Главный конфиг Nuxt, управляет поведением приложения
  |-- package.json              # Список зависимостей, npm-скрипты, метаинформация
  |-- README.md                 # Основная документация: описание, запуск, структура
  |-- tailwind.config.js        # Конфиг Tailwind CSS для кастомизации стилей
  |-- tsconfig.json             # Конфиг TypeScript для типизации всего проекта

  |-- assets/                   # Статические ресурсы: стили, изображения, шрифты
      |-- css/
          |-- main.css          # Основные CSS-стили проекта, подключаются глобально
      |-- scss/
          |-- main.scss         # Основные SCSS-стили, альтернатива main.css
      |-- images/
          |-- logo-img.svg      # SVG-логотип проекта, используется в UI

  |-- components/               # Переиспользуемые Vue-компоненты для UI
      |-- AppFooter.vue         # Футер приложения, подключается в layout
      |-- AppHeader.vue         # Хедер приложения, подключается в layout
      |-- AuthFormLayout.vue    # Лейаут для форм авторизации, используется на страницах login/register
      |-- CourseCard.vue        # Карточка курса, используется в списках курсов
      |-- CourseEditForm.vue    # Форма редактирования курса, используется на страницах преподавателя
      |-- CourseImageUpload.vue # Компонент загрузки изображения курса
      |-- CourseList.vue        # Список курсов, используется на главной и в профиле
      |-- FormInput.vue         # Универсальный input-компонент для форм
      |-- LessonCreateForm.vue  # Форма создания урока, используется в кабинете преподавателя
      |-- LessonEditForm.vue    # Форма редактирования урока
      |-- ModuleCreateForm.vue  # Форма создания модуля курса
      |-- ModuleEditForm.vue    # Форма редактирования модуля курса
      |-- ProfileHeader.vue     # Хедер профиля пользователя
      |-- StatsCard.vue         # Карточка статистики, используется в dashboard
      |-- UI/                   # Базовые UI-компоненты (кнопки, инпуты, табы и др.)
          |-- Avatar/           # Компоненты для отображения аватара пользователя
              |-- Fallback.vue  # Заглушка для аватара, если нет изображения
              |-- Image.vue     # Компонент для отображения изображения аватара
              |-- index.vue     # Основной компонент аватара
          |-- Badge/
              |-- index.vue     # Бейджи для UI (например, статус)
          |-- Button/
              |-- index.vue     # Кнопка для UI
          |-- Card/
              |-- Action.vue    # Кнопка-действие внутри карточки
              |-- Content.vue   # Контент карточки
              |-- Description.vue # Описание карточки
              |-- Footer.vue    # Футер карточки
              |-- Header.vue    # Хедер карточки
              |-- index.vue     # Основной компонент карточки
              |-- Title.vue     # Заголовок карточки
          |-- Input/
              |-- index.vue     # Базовый input-компонент
          |-- Select/
              |-- Content.vue   # Контент выпадающего списка
              |-- Group.vue     # Группировка элементов select
              |-- index.vue     # Основной компонент select
              |-- Item.vue      # Элемент select
              |-- ItemText.vue  # Текст элемента select
              |-- Label.vue     # Лейбл select
              |-- ScrollDownButton.vue # Кнопка прокрутки вниз
              |-- ScrollUpButton.vue   # Кнопка прокрутки вверх
              |-- Separator.vue # Разделитель в select
              |-- Trigger.vue   # Кнопка открытия select
              |-- Value.vue     # Значение select
          |-- Spinner/
              |-- index.vue     # Индикатор загрузки
          |-- Tabs/
              |-- Content.vue   # Контент таба
              |-- index.vue     # Основной компонент табов
              |-- List.vue      # Список табов
              |-- Trigger.vue   # Кнопка переключения таба
          |-- Textarea/
              |-- index.vue     # Базовый textarea-компонент

  |-- context/                  # Документация и справка по проекту
      |-- code-style.md         # Соглашения по стилю кода, линтеры
      |-- contacts.md           # Контакты и полезные ресурсы
      |-- data.md               # Описание работы с данными и моделями
      |-- overview.md           # Краткий обзор и назначение проекта
      |-- roadmap.md            # Планы на будущее, roadmap
      |-- structure.md          # Структура проекта (этот файл)

  |-- drizzle/
      |-- schema.ts             # Схема БД для Drizzle ORM, используется сервером и миграциями
      # миграции и meta-файлы не описываются (служебные)

  |-- layouts/                  # Layout-файлы для Nuxt
      |-- default.vue           # Основной layout, используется на всех страницах
      |-- profile.vue           # Layout для страниц профиля

  |-- lib/
      |-- utils.ts              # Вспомогательные функции для сервера и клиента

  |-- middleware/
      |-- auth.global.ts        # Глобальный middleware для авторизации, подключается во всём приложении

  |-- pages/                    # Nuxt-страницы приложения (маршруты)
      |-- about.vue             # Страница "О проекте"
      |-- become-instructor.vue # Страница заявки на роль преподавателя
      |-- index.vue             # Главная страница
      |-- login.vue             # Страница входа
      |-- register.vue          # Страница регистрации
      |-- app/
          |-- profile.vue       # Страница профиля пользователя
          |-- teacher.vue       # Страница преподавателя
          |-- profile/
              |-- courses.vue   # Курсы пользователя
              |-- index.vue     # Главная страница профиля
              |-- instructors.vue # Список преподавателей
              |-- settings.vue  # Настройки профиля
              |-- wishlist.vue  # Список желаемого пользователя
          |-- teacher/
              |-- dashboard.vue # Дашборд преподавателя
              |-- index.vue     # Главная страница кабинета преподавателя
              |-- settings.vue  # Настройки преподавателя
              |-- courses/
                  |-- index.vue # Список курсов преподавателя
                  |-- new.vue   # Создание нового курса
                  |-- [id]/
                      |-- edit.vue # Редактирование курса
                      |-- modules/
                          |-- new.vue # Создание нового модуля
                          |-- [moduleId]/
                              |-- edit.vue # Редактирование модуля
                              |-- lessons/
                                  |-- new.vue # Создание нового урока
                                  |-- [lessonId]/
                                      |-- edit.vue # Редактирование урока
          |-- courses/
              |-- [id].vue      # Страница курса (детали)
              |-- index.vue     # Список всех курсов
          |-- profile.vue       # Дублирует profile/index.vue (роутинг)

  |-- public/                   # Статические файлы, доступны напрямую
      |-- favicon.ico           # Иконка сайта
      |-- hero-image.svg        # Иллюстрация на главной
      |-- robots.txt            # robots.txt для поисковых систем

  |-- server/                   # Серверная логика и API
      |-- tsconfig.json         # TypeScript конфиг для server
      |-- api/
          |-- seed.post.ts      # Скрипт для сидирования базы (наполнение тестовыми данными)
          |-- categories/
              |-- index.get.ts  # Получение списка категорий курсов
          |-- storage/
              |-- upload.post.ts # Загрузка файлов в хранилище
          |-- wishlist/
              |-- index.get.ts  # Получение wishlist пользователя
              |-- index.post.ts # Добавление в wishlist
              |-- [courseId]/
                  |-- index.delete.ts # Удаление курса из wishlist
          |-- auth/
              |-- login.post.ts # Эндпоинт логина
              |-- register.post.ts # Эндпоинт регистрации
              |-- users/
                  |-- index.get.ts # Получение пользователей
                  |-- index.post.ts # Создание пользователя
                  |-- [userId]/
                      |-- courses.get.ts # Курсы пользователя
                      |-- dashboard-stats.get.ts # Статистика для dashboard
                      |-- index.delete.ts # Удаление пользователя
                      |-- index.get.ts # Получение пользователя
                      |-- index.patch.ts # Обновление пользователя
                      |-- stats.get.ts # Получение статистики пользователя
                      |-- teaching-courses.get.ts # Курсы, которые ведёт преподаватель
          |-- modules/
              |-- index.get.ts  # Получение модулей
              |-- index.post.ts # Создание модуля
              |-- [moduleId]/
                  |-- index.delete.ts # Удаление модуля
                  |-- index.get.ts # Получение модуля
                  |-- index.patch.ts # Обновление модуля
          |-- tests/
              |-- index.get.ts  # Получение тестов
              |-- index.post.ts # Создание теста
              |-- [testId]/
                  |-- index.delete.ts # Удаление теста
                  |-- index.get.ts # Получение теста
          |-- lessons/
              |-- index.get.ts  # Получение уроков
              |-- index.post.ts # Создание урока
              |-- [lessonId]/
                  |-- index.delete.ts # Удаление урока
                  |-- index.get.ts # Получение урока
                  |-- index.patch.ts # Обновление урока
          |-- courses/
              |-- index.get.ts  # Получение курсов
              |-- index.post.ts # Создание курса
              |-- [courseId]/
                  |-- index.delete.ts # Удаление курса
                  |-- index.get.ts # Получение курса
                  |-- index.patch.ts # Обновление курса
                  |-- participate.post.ts # Участие в курсе
                  |-- wishlist.delete.ts # Удаление из wishlist
                  |-- wishlist.post.ts # Добавление в wishlist
      |-- middleware/
          |-- 01.auth.ts         # Middleware для авторизации, используется во всех защищённых эндпоинтах
      |-- utils/
          |-- drizzle.ts         # Утилиты для работы с Drizzle ORM
          |-- zod.ts             # Утилиты для валидации через Zod

  |-- stores/
      |-- wishlist.ts            # Pinia store для wishlist, используется в profile/wishlist.vue
```

Если появятся новые важные файлы или директории, их также стоит добавить в эту структуру для поддержания актуальности.

## Основные файлы и директории проекта (таблица)

| Путь/Файл                        | Назначение/Содержимое                 | Связи/Примечания                             |
| -------------------------------- | ------------------------------------- | -------------------------------------------- |
| **app.vue**                      | Корневой компонент приложения         | Загружает layout и страницы                  |
| **auth.d.ts**                    | Глобальные типы для авторизации       | Используется в серверных и клиентских файлах |
| **components.json**              | Конфиг shadcn компонентов             | Для UI-библиотеки                            |
| **docker-compose.yml**           | Docker Compose конфиг                 | Для локального и продакшн запуска            |
| **drizzle.config.ts**            | Конфиг Drizzle ORM                    | Для работы с БД                              |
| **eslint.config.mjs**            | Конфиг eslint                         | Линтинг кода                                 |
| **nuxt.config.ts**               | Основной конфиг Nuxt                  | Управляет поведением приложения              |
| **package.json**                 | Зависимости и npm-скрипты             | Запуск, сборка, тесты                        |
| **README.md**                    | Основная документация проекта         | Описание, запуск, структура                  |
| **tailwind.config.js**           | Конфиг Tailwind CSS                   | Для кастомизации стилей                      |
| **tsconfig.json**                | Конфиг TypeScript                     | Типизация всего проекта                      |
| **assets/**                      | Стили, изображения, шрифты            | Используются во всём приложении              |
| **components/**                  | Переиспользуемые Vue-компоненты       | Используются на страницах и в layout'ах      |
| **context/**                     | Документация и справка по проекту     | Для навигации и LLM-контекста                |
| **drizzle/schema.ts**            | Схема БД для Drizzle ORM              | Используется сервером и миграциями           |
| **layouts/**                     | Layout-файлы для Nuxt                 | Определяют структуру страниц                 |
| **lib/utils.ts**                 | Вспомогательные функции               | Для серверных и клиентских задач             |
| **middleware/auth.global.ts**    | Глобальный middleware для авторизации | Для Nuxt маршрутов                           |
| **pages/**                       | Страницы приложения                   | Nuxt routing, основная навигация             |
| **public/**                      | Статические файлы                     | favicon, изображения, robots.txt             |
| **server/api/**                  | Серверные эндпоинты (REST API)        | Для работы с данными, авторизацией и т.д.    |
| **server/middleware/01.auth.ts** | Middleware для авторизации            | Используется в API                           |
| **server/utils/**                | Утилиты для сервера                   | Работа с Drizzle, Zod и др.                  |
| **stores/wishlist.ts**           | Pinia store для wishlist              | Используется в profile/wishlist.vue          |

## Служебные и автогенерируемые файлы/директории

- **node_modules/** — директория с установленными зависимостями, не редактируется вручную
- **.nuxt/** — автогенерируемые файлы Nuxt, не редактируются вручную
- **.output/** — сборка Nuxt, не редактируется вручную
- **.qodo/** — служебная директория, не редактируется вручную
- **drizzle/meta/** — служебные файлы Drizzle ORM, не редактируются вручную
- **drizzle/000\*.sql** — миграции БД, автогенерируются
- **.DS_Store** — системные файлы macOS, не используются в проекте
- **bun.lockb** — lock-файл для bun, автогенерируется

Если потребуется добавить новые файлы или обновить описания — просто сообщи!

```

```
