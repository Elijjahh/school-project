<script setup lang="ts">
import { Play, Headphones, Trophy, Users } from 'lucide-vue-next';

const { user } = useUserSession();

const {
  data: stats,
  pending: statsPending,
  error: statsError,
} = await useFetch(`/api/auth/users/${user.value?.id}/stats`);

const {
  data: courses,
  pending: coursesPending,
  error: coursesError,
} = await useFetch(`/api/auth/users/${user.value?.id}/courses`);
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Панель управления</h2>
      <p class="text-muted-foreground">Обзор вашей активности и прогресса в обучении</p>
    </div>

    <div v-if="statsPending" class="flex justify-center py-8">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
    <div
      v-else-if="statsError"
      class="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive"
    >
      <p class="text-center">Не удалось загрузить статистику</p>
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard :value="stats?.enrolledCourses ?? '-'" label="Ваши курсы" :icon="Play" />

      <StatsCard :value="stats?.activeCourses ?? '-'" label="Активные курсы" :icon="Headphones" />

      <StatsCard :value="stats?.completedCourses ?? '-'" label="Завершенные курсы" :icon="Trophy" />

      <StatsCard :value="stats?.instructors ?? '-'" label="Преподаватели" :icon="Users" />
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h2 class="text-2xl font-semibold tracking-tight">Ваши курсы</h2>
          <p class="text-sm text-muted-foreground">
            Продолжайте обучение с того места, где остановились
          </p>
        </div>
      </div>

      <div v-if="coursesPending" class="flex justify-center py-8">
        <div
          class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
      <div
        v-else-if="coursesError"
        class="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive"
      >
        <p class="text-center">Не удалось загрузить курсы</p>
      </div>
      <div v-else>
        <div v-if="courses && courses.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CourseCard
            v-for="course in courses"
            :key="course.id"
            :course="{
              id: course.id,
              title: course.title,
              description: course.description,
              image: course.image || undefined,
              completed: course.completed,
              progress: course.progress || undefined,
            }"
          />
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        >
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Play class="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 class="mt-4 text-lg font-semibold">Нет курсов</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Начните обучение, выбрав курс из каталога
          </p>
          <UIButton variant="outline" class="mt-4">
            <NuxtLink to="/app/courses">Перейти к курсам</NuxtLink>
          </UIButton>
        </div>
      </div>
    </div>
  </div>
</template>
