<script setup lang="ts">
interface LessonPayload {
  title: string;
  content: string;
}

const route = useRoute();
const router = useRouter();
const moduleId = Number(route.params.moduleId);

const loading = ref(false);
const error = ref('');

async function handleLessonCreate(payload: LessonPayload) {
  loading.value = true;
  error.value = '';
  try {
    const created = await $fetch('/api/lessons', {
      method: 'POST',
      body: {
        moduleId,
        title: payload.title,
        content: payload.content,
      },
    });
    // После создания редиректим на страницу редактирования этого урока
    router.push(
      `/app/teacher/courses/${route.params.id}/modules/${moduleId}/lessons/${created.id}/edit`,
    );
  } catch {
    error.value = 'Ошибка при создании урока';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mb-10 space-y-8">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Создать урок</h2>
      <p class="text-muted-foreground">Заполните информацию о новом уроке</p>
    </div>
    <LessonCreateForm :module-id="moduleId" :loading="loading" @save="handleLessonCreate" />
    <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
  </div>
</template>
