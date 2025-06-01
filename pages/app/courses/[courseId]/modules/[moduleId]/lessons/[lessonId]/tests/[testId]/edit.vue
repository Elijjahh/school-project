<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const route = useRoute();
const _courseId = Number(route.params.courseId);
const _moduleId = Number(route.params.moduleId);
const _lessonId = Number(route.params.lessonId);
const testId = Number(route.params.testId);

const { data: testData, pending: loading, refresh } = useFetch(`/api/tests/${testId}`);

const error = ref('');

async function handleTestSave(payload: {
  maxAttempts: number;
  testQuestions: Array<{ text: string; answers: Array<{ text: string; correct: boolean }> }>;
}) {
  if (!testData.value) return;
  try {
    await fetch(`/api/tests/${testId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxAttempts: payload.maxAttempts,
        testQuestions: payload.testQuestions,
      }),
    });
    await refresh();
  } catch {
    error.value = 'Ошибка при сохранении теста';
  }
}
</script>

<template>
  <div class="mb-10 space-y-8">
    <div v-if="loading" class="py-8 text-center">Загрузка...</div>
    <div v-else>
      <div class="space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Редактировать тест</h2>
        <p class="text-muted-foreground">Измените настройки теста и его вопросы</p>
      </div>
      <TestEditForm v-if="testData" :test="testData" :loading="loading" @save="handleTestSave" />
      <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
    </div>
  </div>
</template>
