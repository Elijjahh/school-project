<script setup lang="ts">
interface Course {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  category?: string;
  studentsCount?: number;
}
const courses = ref<Course[]>([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
onMounted(() => {
  // Fetch teacher's courses here
  courses.value = [
    {
      id: 1,
      title: 'Курс 1',
      description: 'Описание курса 1',
      image: 'https://source.unsplash.com/random/400x200?sig=1',
      category: 'Математика',
      studentsCount: 25,
    },
    {
      id: 2,
      title: 'Курс 2',
      description: 'Описание курса 2',
      image: 'https://source.unsplash.com/random/400x200?sig=2',
      category: 'Физика',
      studentsCount: 18,
    },
    {
      id: 3,
      title: 'Курс 3',
      description: 'Описание курса 3',
      image: 'https://source.unsplash.com/random/400x200?sig=3',
      category: 'Информатика',
      studentsCount: 32,
    },
  ];
});
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Мои курсы</h2>
      <p class="text-muted-foreground">Список всех курсов, которые вы ведёте</p>
    </div>
    <div class="flex justify-end">
      <NuxtLink to="/app/teacher/courses/new">
        <UIButton :disabled="loading">
          <span v-if="loading" class="flex items-center">
            <span class="mr-2">Создаём...</span>
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          </span>
          <span v-else>Создать новый курс</span>
        </UIButton>
      </NuxtLink>
    </div>
    <UICard>
      <UICardContent>
        <div v-if="courses.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CourseCard v-for="course in courses" :key="course.id" :course="course" mode="teacher" />
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground"
        >
          <span class="text-2xl mb-2">📚</span>
          <span>Курсы не найдены</span>
        </div>
      </UICardContent>
    </UICard>
    <div v-if="error" class="text-sm font-medium text-destructive">{{ error }}</div>
    <div v-if="success" class="text-sm font-medium text-primary">{{ success }}</div>
  </div>
</template>
