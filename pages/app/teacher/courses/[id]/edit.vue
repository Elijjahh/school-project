<script setup lang="ts">
const route = useRoute();
const courseId = Number(route.params.id);

const { data: categoriesData, pending: categoriesLoading } = useFetch('/api/categories');
const { data: courseData, pending: loading } = useFetch(`/api/courses/${courseId}`);

const errorMessage = ref('');

async function handleCourseSave(payload: {
  title: string;
  description: string;
  image: string;
  categoryId: number;
}) {
  if (!courseData.value) return;
  try {
    await $fetch(`/api/courses/${courseId}`, {
      method: 'PATCH',
      body: {
        title: payload.title,
        description: payload.description,
        image: payload.image,
        categoryId: Number(payload.categoryId),
        creatorId: courseData.value?.teacher?.id || 1,
      },
    });
  } catch {
    errorMessage.value = 'Ошибка при сохранении курса';
  }
}
</script>

<template>
  <div class="mb-10 space-y-8">
    <div v-if="loading" class="py-8 text-center">Загрузка...</div>
    <div v-else>
      <div class="space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Редактировать курс</h2>
        <p class="text-muted-foreground">Измените информацию о курсе и структуру модулей</p>
      </div>
      <CourseEditForm
        v-if="courseData && categoriesData"
        :course="courseData"
        :categories="categoriesData"
        :loading="loading"
        :categories-loading="categoriesLoading"
        :categories-error="errorMessage"
        @save="handleCourseSave"
      />
      <div class="mt-10 max-w-2xl space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-semibold">Модули</h3>
          <UIButton variant="secondary">
            <NuxtLink :to="`/app/teacher/courses/${courseId}/modules/new`">
              Добавить модуль
            </NuxtLink>
          </UIButton>
        </div>
        <ul v-if="courseData?.modules">
          <li v-for="mod in courseData.modules" :key="mod.id" class="mb-4">
            <NuxtLink
              :to="`/app/teacher/courses/${courseId}/modules/${mod.id}/edit`"
              class="text-blue-600 underline hover:text-blue-800"
            >
              {{ mod.title || 'Без названия' }} (Порядок: {{ mod.order }})
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
