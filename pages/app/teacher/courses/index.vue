<script setup lang="ts">
interface Course {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  category?: string;
  studentsCount?: number;
}
const { user } = useUserSession();
const { data, pending, error } = useFetch<Course[]>(
  `/api/auth/users/${user.value!.id}/teaching-courses`,
);

const courses = computed(() => data.value || []);
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Мои курсы</h2>
      <p class="text-muted-foreground">Список всех курсов, которые вы ведёте</p>
    </div>
    <div class="flex justify-end">
      <NuxtLink to="/app/teacher/courses/new">
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
    <UICard>
      <UICardContent>
        <div v-if="pending" class="py-8 text-center">Загрузка...</div>
        <div v-else-if="error" class="py-8 text-center text-red-500">{{ error.message }}</div>
        <div v-else-if="courses.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CourseCard v-for="course in courses" :key="course.id" :course="course" mode="teacher" />
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
  </div>
</template>
