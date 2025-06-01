<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

interface CreatedQuestion {
  id: number;
}

interface CreatedTest {
  id: number;
}

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);
const moduleId = Number(route.params.moduleId);
const lessonId = Number(route.params.lessonId);

const loading = ref(false);
const error = ref('');

async function handleTestCreate(payload: {
  maxAttempts: number;
  questions: Array<{ text: string; answers: Array<{ text: string; correct: boolean }> }>;
}) {
  loading.value = true;
  error.value = '';
  try {
    // Создаем тест
    const createdTest = await $fetch<CreatedTest>('/api/tests', {
      method: 'POST',
      body: {
        lessonId,
        maxAttempts: payload.maxAttempts,
      },
    });

    // Создаем вопросы и ответы
    for (const questionData of payload.questions) {
      const createdQuestion = await $fetch<CreatedQuestion>('/api/questions', {
        method: 'POST',
        body: {
          testId: createdTest.id,
          text: questionData.text,
        },
      });

      for (const answerData of questionData.answers) {
        await $fetch('/api/answers', {
          method: 'POST',
          body: {
            questionId: createdQuestion.id,
            text: answerData.text,
            correct: answerData.correct,
          },
        });
      }
    }

    // После создания редиректим на страницу редактирования теста
    router.push(
      `/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/tests/${createdTest.id}/edit`,
    );
  } catch {
    error.value = 'Ошибка при создании теста';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mb-10 space-y-8">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Создать тест</h2>
      <p class="text-muted-foreground">Создайте тест с вопросами для урока</p>
    </div>
    <TestCreateForm :lesson-id="lessonId" :loading="loading" @save="handleTestCreate" />
    <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
  </div>
</template>
