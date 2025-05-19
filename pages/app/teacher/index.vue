<script setup lang="ts">
const { user } = useUserSession();

const teacher = computed(() => ({
  name: user.value ? `${user.value.firstname} ${user.value.lastname}` : '',
  bio: user.value?.bio || '',
}));

// Define a Course type matching CourseCard expectations
interface Course {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  completed?: boolean;
  progress?: number;
  category?: string;
  studentsCount?: number;
  creator?: { id: number };
}

const courses = ref<Course[]>([]);
const loading = ref(true);
const error = ref('');

async function fetchCourses() {
  loading.value = true;
  error.value = '';
  try {
    if (!user.value?.id) throw new Error('Пользователь не найден');
    const { data, error: fetchError } = await useFetch(
      `/api/auth/users/${user.value.id}/teaching-courses`,
    );
    if (fetchError.value) throw fetchError.value;
    courses.value = (data.value || []) as Course[];
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Ошибка загрузки курсов';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchCourses();
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
          <p class="text-muted-foreground text-sm">Последние курсы, которые вы ведёте</p>
        </div>
        <NuxtLink
          to="/app/teacher/courses"
          class="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium transition"
        >
          Все курсы
        </NuxtLink>
      </div>
      <div v-if="loading" class="py-8 text-center">Загрузка...</div>
      <div v-else-if="error" class="py-8 text-center text-red-500">{{ error }}</div>
      <div v-else-if="courses.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CourseCard v-for="course in courses" :key="course.id" :course="course" />
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
          to="/app/teacher/courses/new"
          class="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded px-4 py-2 text-sm font-medium transition"
        >
          Создать курс
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
