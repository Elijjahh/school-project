<script setup lang="ts">
import { Play, Headphones, Trophy, Users, Book, CheckCircle } from 'lucide-vue-next';

definePageMeta({
  layout: 'profile',
});

const { user } = useUserSession();

// Определяем роль пользователя
const isTeacher = computed(() => user.value?.role === 'teacher');

// Данные для преподавателя
const teacher = computed(() => ({
  name: user.value ? `${user.value.firstname} ${user.value.lastname}` : '',
  bio: user.value?.bio || '',
}));

// Данные для студента (статистика и курсы)
const {
  data: stats,
  pending: statsPending,
  error: statsError,
} = await useFetch(`/api/auth/users/${user.value?.id}/stats`, {
  server: false,
  default: () => null,
});

const {
  data: studentCourses,
  pending: coursesPending,
  error: coursesError,
} = await useFetch(`/api/auth/users/${user.value?.id}/courses`, {
  server: false,
  default: () => [],
});

// Данные для аналитики преподавателя
const {
  data: teacherStats,
  pending: teacherStatsPending,
  error: teacherStatsError,
} = await useFetch(`/api/auth/users/${user.value?.id}/dashboard-stats`, {
  server: false,
  default: () => null,
});

// Курсы преподавателя
const {
  data: teacherCourses,
  pending: teacherCoursesLoading,
  error: teacherCoursesError,
} = await useFetch(`/api/auth/users/${user.value?.id}/teaching-courses`, {
  server: false,
  default: () => [],
});

// Функция для расчета процентов
function getPercent(finished: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((finished / total) * 100)}%`;
}

// Вычисляемая статистика для преподавателя
const teacherStatsComputed = computed(() => {
  const d = teacherStats.value || { studentsCount: 0, coursesCount: 0, finishedParticipations: 0 };
  return [
    { label: 'Студенты', value: d.studentsCount, icon: Users },
    { label: 'Курсы', value: d.coursesCount, icon: Book },
    {
      label: 'Завершения',
      value: getPercent(d.finishedParticipations, d.studentsCount),
      icon: CheckCircle,
    },
  ];
});
</script>

<template>
  <div class="space-y-8">
    <!-- Интерфейс для преподавателя -->
    <template v-if="isTeacher">
      <div class="space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Аналитика преподавателя</h2>
        <p class="text-muted-foreground">Статистика, активность и вовлечённость ваших студентов</p>
      </div>

      <!-- Статистика преподавателя -->
      <div v-if="teacherStatsPending" class="flex justify-center py-8">
        <div
          class="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        />
      </div>
      <div v-else-if="teacherStatsError" class="py-8 text-center text-red-500">
        {{ teacherStatsError.message }}
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          v-for="stat in teacherStatsComputed"
          :key="stat.label"
          :label="stat.label"
          :value="stat.value"
          :icon="stat.icon"
        />
      </div>

      <!-- Информация о преподавателе -->
      <div class="space-y-2">
        <h2 class="text-2xl font-bold tracking-tight">Обо мне</h2>
        <p class="text-muted-foreground">{{ teacher.bio }}</p>
      </div>

      <!-- Курсы преподавателя -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h3 class="text-2xl font-semibold tracking-tight">Мои курсы</h3>
            <p class="text-muted-foreground text-sm">Последние курсы, которые вы ведёте</p>
          </div>
          <NuxtLink
            to="/app/my-courses"
            class="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium transition"
          >
            Все курсы
          </NuxtLink>
        </div>
        <div v-if="teacherCoursesLoading" class="py-8 text-center">Загрузка...</div>
        <div v-else-if="teacherCoursesError" class="py-8 text-center text-red-500">
          {{ teacherCoursesError.message }}
        </div>
        <div v-else-if="teacherCourses.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CourseCard v-for="course in teacherCourses" :key="course.id" :course="course" />
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        >
          <div class="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <span class="text-muted-foreground text-2xl">📚</span>
          </div>
          <h3 class="mt-4 text-lg font-semibold">Нет курсов</h3>
          <p class="text-muted-foreground mt-2 text-sm">
            Добавьте свой первый курс, чтобы начать обучение студентов
          </p>
          <NuxtLink
            to="/app/courses/new"
            class="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded px-4 py-2 text-sm font-medium transition"
          >
            Создать курс
          </NuxtLink>
        </div>
      </div>
    </template>

    <!-- Интерфейс для студента -->
    <template v-else>
      <div class="space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Панель управления</h2>
        <p class="text-muted-foreground">Обзор вашей активности и прогресса в обучении</p>
      </div>

      <div v-if="statsPending" class="flex justify-center py-8">
        <div
          class="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        />
      </div>
      <div
        v-else-if="statsError"
        class="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4"
      >
        <p class="text-center">Не удалось загрузить статистику</p>
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard :value="stats?.enrolledCourses ?? '-'" label="Ваши курсы" :icon="Play" />

        <StatsCard :value="stats?.activeCourses ?? '-'" label="Активные курсы" :icon="Headphones" />

        <StatsCard
          :value="stats?.completedCourses ?? '-'"
          label="Завершенные курсы"
          :icon="Trophy"
        />

        <StatsCard :value="stats?.instructors ?? '-'" label="Преподаватели" :icon="Users" />
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h2 class="text-2xl font-semibold tracking-tight">Ваши курсы</h2>
            <p class="text-muted-foreground text-sm">
              Продолжайте обучение с того места, где остановились
            </p>
          </div>
        </div>

        <div v-if="coursesPending" class="flex justify-center py-8">
          <div
            class="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          />
        </div>
        <div
          v-else-if="coursesError"
          class="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4"
        >
          <p class="text-center">Не удалось загрузить курсы</p>
        </div>
        <div v-else>
          <div
            v-if="studentCourses && studentCourses.length > 0"
            class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <CourseCard
              v-for="course in studentCourses"
              :key="course.id"
              :course="{
                id: course.id,
                title: course.title,
                description: course.description,
                image: course.image || null,
                creatorId: 0,
                categoryId: 0,
                completed: course.completed,
                progress: course.progress || undefined,
              }"
            />
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
          >
            <div class="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <Play class="text-muted-foreground h-6 w-6" />
            </div>
            <h3 class="mt-4 text-lg font-semibold">Нет курсов</h3>
            <p class="text-muted-foreground mt-2 text-sm">
              Начните обучение, выбрав курс из каталога
            </p>
            <UIButton variant="outline" class="mt-4">
              <NuxtLink to="/app/my-courses">Перейти к курсам</NuxtLink>
            </UIButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
