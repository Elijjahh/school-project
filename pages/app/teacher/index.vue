<script setup lang="ts">
const teacher = ref({
  name: 'Иван Иванов',
  bio: 'Преподаватель математики с 10-летним опытом. Люблю делиться знаниями и помогать студентам достигать успеха.',
});
const courses = ref<{ id: number; title: string; description: string }[]>([]);

onMounted(() => {
  // Fetch teacher info and courses here
  courses.value = [
    { id: 1, title: 'Курс 1', description: 'Описание 1' },
    { id: 2, title: 'Курс 2', description: 'Описание 2' },
    { id: 3, title: 'Курс 3', description: 'Описание 3' },
  ];
});
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold tracking-tight">Обо мне</h2>
      <p class="text-muted-foreground">{{ teacher.bio }}</p>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h3 class="text-2xl font-semibold tracking-tight">Мои курсы</h3>
          <p class="text-sm text-muted-foreground">Последние курсы, которые вы ведёте</p>
        </div>
        <NuxtLink
          to="/app/teacher/courses"
          class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition text-sm font-medium"
        >
          Все курсы
        </NuxtLink>
      </div>
      <div v-if="courses.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CourseCard v-for="course in courses" :key="course.id" :course="course" />
      </div>
      <div
        v-else
        class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
      >
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <span class="text-muted-foreground text-2xl">📚</span>
        </div>
        <h3 class="mt-4 text-lg font-semibold">Нет курсов</h3>
        <p class="mt-2 text-sm text-muted-foreground">
          Добавьте свой первый курс, чтобы начать обучение студентов
        </p>
        <NuxtLink
          to="/app/teacher/courses/new"
          class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition text-sm font-medium"
        >
          Создать курс
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
