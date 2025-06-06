<script setup lang="ts">
import {
  BookOpen,
  Brain,
  Briefcase,
  ClipboardCheck,
  Code,
  Database,
  Globe,
  Palette,
  Server,
  Smartphone,
  TrendingUp,
  UserCircle,
  UserCog,
  Users,
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default',
});

// Fetching data from API
const { data: categoriesData } = await useFetch('/api/categories-with-stats', {
  server: false,
  default: () => ({ categories: [] }),
});

const { data: popularCoursesData } = await useFetch('/api/popular-courses', {
  server: false,
  default: () => ({ courses: [] }),
});

const { data: recentCoursesData } = await useFetch('/api/recent-courses', {
  server: false,
  default: () => ({ courses: [] }),
});

const { data: topInstructorsData } = await useFetch('/api/top-instructors', {
  server: false,
  default: () => ({ instructors: [] }),
});

// Format categories to include icons (this could be moved to the API in the future)
const categories = computed(() => {
  const iconMap = {
    Программирование: Code,
    'Веб-разработка': Globe,
    Дизайн: Palette,
    Бизнес: Briefcase,
    Маркетинг: TrendingUp,
    'Базы данных': Database,
    'Мобильная разработка': Smartphone,
    'Искусственный интеллект': Brain,
    DevOps: Server,
  };

  return (
    categoriesData.value?.categories.slice(0, 4).map((category) => ({
      ...category,
      icon: iconMap[category.name as keyof typeof iconMap],
    })) || []
  );
});

const popularCourses = computed(() => popularCoursesData.value?.courses || []);
const recentCourses = computed(() => recentCoursesData.value?.courses || []);
const topInstructors = computed(() => topInstructorsData.value?.instructors || []);
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="bg-background">
      <div class="container mx-auto px-6 py-24">
        <div class="flex flex-col items-center justify-between md:flex-row">
          <div class="mb-8 md:mb-0 md:w-1/2">
            <h1 class="mb-6 text-4xl font-bold md:text-6xl">Начните свой путь к знаниям</h1>
            <p class="text-muted-foreground mb-8 text-xl">
              Откройте для себя мир знаний с нашими экспертными курсами и интерактивным обучением.
            </p>
            <div class="space-x-4">
              <UIButton as-child>
                <NuxtLink to="/app/courses"> Смотреть курсы </NuxtLink>
              </UIButton>
              <UIButton variant="outline" as-child>
                <NuxtLink to="/register"> Начать обучение </NuxtLink>
              </UIButton>
            </div>
          </div>
          <div class="md:w-1/2">
            <img src="/hero-image.svg" alt="Иллюстрация обучения" class="mx-auto w-full max-w-lg" />
          </div>
        </div>
      </div>
    </section>

    <!-- Best Categories Section -->
    <section class="bg-muted/50 py-20">
      <div class="container mx-auto px-6">
        <h2 class="mb-16 text-center text-3xl font-bold md:text-4xl">Популярные категории</h2>
        <div class="grid gap-6 md:grid-cols-4">
          <UICard
            v-for="category in categories"
            :key="category.name"
            class="cursor-pointer p-6 transition-shadow hover:shadow-lg"
          >
            <div class="space-y-4 text-center">
              <div class="flex justify-center">
                <component :is="category.icon" class="text-primary h-12 w-12" />
              </div>
              <h3 class="text-xl font-semibold">{{ category.name }}</h3>
              <p class="text-muted-foreground">{{ category.count }} курсов</p>
            </div>
          </UICard>
        </div>
      </div>
    </section>

    <!-- Popular Courses Section -->
    <section class="bg-background py-20">
      <div class="container mx-auto px-6">
        <div class="mb-12 flex items-center justify-between">
          <h2 class="text-3xl font-bold md:text-4xl">Популярные курсы</h2>
          <UIButton variant="outline" as-child>
            <NuxtLink to="/app/courses">Все курсы</NuxtLink>
          </UIButton>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <UICard v-for="course in popularCourses" :key="course.id" class="overflow-hidden">
            <img :src="course.image" :alt="course.title" class="h-48 w-full object-cover" />
            <div class="p-6">
              <h3 class="mb-2 text-xl font-semibold">{{ course.title }}</h3>
              <p class="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                {{ course.description }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <UserCircle class="h-5 w-5" />
                  <span>{{ course.students }} студентов</span>
                </div>
                <UIButton size="sm" as-child>
                  <NuxtLink :to="`/app/courses/${course.id}`">Подробнее</NuxtLink>
                </UIButton>
              </div>
            </div>
          </UICard>
        </div>
      </div>
    </section>

    <!-- Recently Added Courses -->
    <section class="bg-muted/50 py-20">
      <div class="container mx-auto px-6">
        <div class="mb-12 flex items-center justify-between">
          <h2 class="text-3xl font-bold md:text-4xl">Новые курсы</h2>
          <UIButton variant="outline" as-child>
            <NuxtLink to="/app/courses?sort=newest">Все новые курсы</NuxtLink>
          </UIButton>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <UICard v-for="course in recentCourses" :key="course.id" class="overflow-hidden">
            <img :src="course.image" :alt="course.title" class="h-48 w-full object-cover" />
            <div class="p-6">
              <h3 class="mb-2 text-xl font-semibold">{{ course.title }}</h3>
              <p class="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                {{ course.description }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <UserCircle class="h-5 w-5" />
                  <span>{{ course.creatorName }}</span>
                </div>
                <UIButton size="sm" as-child>
                  <NuxtLink :to="`/app/courses/${course.id}`">Подробнее</NuxtLink>
                </UIButton>
              </div>
            </div>
          </UICard>
        </div>
      </div>
    </section>

    <!-- Become an Instructor Section -->
    <section class="bg-background py-20">
      <div class="container mx-auto px-6">
        <div class="mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold md:text-4xl">Станьте преподавателем</h2>
          <p class="text-muted-foreground mx-auto max-w-2xl text-xl">
            Делитесь своими знаниями с тысячами студентов и постройте успешную карьеру преподавателя
          </p>
        </div>
        <div class="mb-12 grid gap-8 md:grid-cols-3">
          <div class="space-y-4 text-center">
            <div class="mb-6 flex justify-center">
              <ClipboardCheck class="text-primary h-16 w-16" />
            </div>
            <h3 class="text-xl font-semibold">1. Подайте заявку</h3>
            <p class="text-muted-foreground">
              Заполните форму заявки и расскажите о своем опыте и экспертизе
            </p>
          </div>
          <div class="space-y-4 text-center">
            <div class="mb-6 flex justify-center">
              <UserCog class="text-primary h-16 w-16" />
            </div>
            <h3 class="text-xl font-semibold">2. Настройте профиль</h3>
            <p class="text-muted-foreground">
              Создайте привлекательный профиль преподавателя с вашим опытом и достижениями
            </p>
          </div>
          <div class="space-y-4 text-center">
            <div class="mb-6 flex justify-center">
              <BookOpen class="text-primary h-16 w-16" />
            </div>
            <h3 class="text-xl font-semibold">3. Создавайте курсы</h3>
            <p class="text-muted-foreground">
              Разработайте качественные учебные материалы и начните обучать студентов
            </p>
          </div>
        </div>
        <div class="text-center">
          <UIButton size="lg" as-child>
            <NuxtLink to="/app/apply-teacher">Стать преподавателем</NuxtLink>
          </UIButton>
        </div>
      </div>
    </section>

    <!-- Top Instructors Section -->
    <section class="bg-muted/50 py-20">
      <div class="container mx-auto px-6">
        <h2 class="mb-16 text-center text-3xl font-bold md:text-4xl">Лучшие преподаватели</h2>
        <div class="grid gap-6 md:grid-cols-4">
          <UICard v-for="instructor in topInstructors" :key="instructor.id" class="p-6">
            <div class="space-y-4 text-center">
              <img
                :src="instructor.image || '/default-avatar.png'"
                :alt="instructor.name"
                class="mx-auto h-24 w-24 rounded-full object-cover"
              />
              <h3 class="text-xl font-semibold">{{ instructor.name }}</h3>
              <p class="text-muted-foreground">{{ instructor.expertise }}</p>
              <div class="flex items-center justify-center space-x-2">
                <Users class="h-5 w-5" />
                <span>{{ instructor.studentsCount }} студентов</span>
              </div>
              <UIButton variant="outline" size="sm" as-child>
                <NuxtLink :to="`/instructors/${instructor.id}`">Профиль</NuxtLink>
              </UIButton>
            </div>
          </UICard>
        </div>
      </div>
    </section>
  </div>
</template>
