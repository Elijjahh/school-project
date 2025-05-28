<script setup lang="ts">
import { Clock, Check } from 'lucide-vue-next';

definePageMeta({
  layout: 'profile',
});

const { user } = useUserSession();

// Определяем роль пользователя
const isTeacher = computed(() => user.value?.role === 'teacher');

// Интерфейс для курсов
interface Course {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  category?: string;
  studentsCount?: number;
  progress?: number;
  lastAccessed?: string;
  completed?: boolean;
}

// Данные для преподавателей
const {
  data: teacherCourses,
  pending: teacherPending,
  error: teacherError,
} = await useFetch<Course[]>(`/api/auth/users/${user.value?.id}/teaching-courses`, {
  server: false,
  default: () => [],
});

// Данные для студентов
const {
  data: studentCourses,
  pending: studentPending,
  error: studentError,
} = await useFetch<Course[]>(`/api/auth/users/${user.value?.id}/courses`, {
  server: false,
  default: () => [],
});

// Вычисляемые свойства для текущей роли
const courses = computed(() => {
  if (isTeacher.value) {
    return teacherCourses.value || [];
  }
  return studentCourses.value || [];
});

const pending = computed(() => {
  if (isTeacher.value) {
    return teacherPending.value;
  }
  return studentPending.value;
});

const error = computed(() => {
  if (isTeacher.value) {
    return teacherError.value;
  }
  return studentError.value;
});
</script>

<template>
  <div class="space-y-8">
    <!-- Заголовок для преподавателей -->
    <div v-if="isTeacher" class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Мои курсы</h2>
      <p class="text-muted-foreground">Список всех курсов, которые вы ведёте</p>
    </div>

    <!-- Заголовок для студентов -->
    <div v-else class="space-y-2">
      <h1 class="text-2xl font-bold">Мои курсы</h1>
      <p class="text-muted-foreground">Здесь вы можете видеть все курсы, на которые вы записаны</p>
    </div>

    <!-- Кнопка создания курса для преподавателей -->
    <div v-if="isTeacher" class="flex justify-end">
      <NuxtLink to="/app/courses/new">
        <UIButton :disabled="pending">
          <span v-if="pending" class="flex items-center">
            <span class="mr-2">Создаём...</span>
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          </span>
          <span v-else>Создать новый курс</span>
        </UIButton>
      </NuxtLink>
    </div>

    <!-- Контент для преподавателей -->
    <template v-if="isTeacher">
      <UICard>
        <UICardContent>
          <div v-if="pending" class="py-8 text-center">Загрузка...</div>
          <div v-else-if="error" class="py-8 text-center text-red-500">{{ error.message }}</div>
          <div v-else-if="courses.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CourseCard
              v-for="course in courses"
              :key="course.id"
              :course="course"
              mode="teacher"
            />
          </div>
          <div
            v-else
            class="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
          >
            <span class="mb-2 text-2xl">📚</span>
            <span>Курсы не найдены</span>
          </div>
        </UICardContent>
      </UICard>
    </template>

    <!-- Контент для студентов -->
    <template v-else>
      <div v-if="pending" class="py-8 text-center">Загрузка...</div>
      <div v-else-if="error" class="py-8 text-center text-red-500">{{ error.message }}</div>
      <div v-else-if="courses.length" class="grid gap-6">
        <UICard v-for="course in courses" :key="course.id" class="p-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ course.title }}</h3>
              <div v-if="course.lastAccessed" class="flex items-center gap-2">
                <Clock class="text-muted-foreground h-4 w-4" />
                <span class="text-muted-foreground text-sm">
                  Последний доступ: {{ course.lastAccessed }}
                </span>
              </div>
            </div>

            <!-- Прогресс для студентов -->
            <div v-if="course.progress !== undefined" class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span>Прогресс</span>
                <span>{{ course.progress }}%</span>
              </div>
              <div class="bg-muted h-2 rounded-full">
                <div
                  class="bg-primary h-full rounded-full"
                  :style="{ width: `${course.progress}%` }"
                ></div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <UIButton variant="outline">
                <NuxtLink :to="`/app/courses/${course.id}`">Продолжить обучение</NuxtLink>
              </UIButton>
              <div v-if="course.completed" class="flex items-center gap-2 text-green-600">
                <Check class="h-4 w-4" />
                <span class="text-sm">Завершено</span>
              </div>
            </div>
          </div>
        </UICard>
      </div>
      <div
        v-else
        class="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
      >
        <span class="mb-2 text-2xl">📚</span>
        <span>У вас пока нет курсов</span>
        <UIButton variant="outline" class="mt-4">
          <NuxtLink to="/app/courses">Перейти к каталогу курсов</NuxtLink>
        </UIButton>
      </div>
    </template>
  </div>
</template>
