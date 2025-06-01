<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const route = useRoute();
const courseId = Number(route.params.courseId);
const moduleId = Number(route.params.moduleId);
const lessonId = Number(route.params.lessonId);

const { data: lessonRaw, pending: loading, refresh } = useFetch(`/api/lessons/${lessonId}`);

const lesson = computed(() => {
  return lessonRaw.value
    ? {
        id: lessonRaw.value.id,
        title: lessonRaw.value.title,
        content: lessonRaw.value.content,
        order: lessonRaw.value.order,
      }
    : null;
});

const tests = computed(() => {
  return Array.isArray(lessonRaw.value?.tests)
    ? lessonRaw.value.tests.map((t) => ({
        id: t.id,
        maxAttempts: t.maxAttempts,
        questionsCount: t.questions?.length || 0,
      }))
    : [];
});

const error = ref('');

async function handleLessonSave(payload: { title: string; content: string; order: number }) {
  if (!lesson.value) return;
  try {
    if (lessonId) {
      await $fetch(`/api/lessons/${lessonId}`, {
        method: 'PATCH',
        body: {
          moduleId,
          title: payload.title,
          content: payload.content,
          order: payload.order,
        },
      });
    }
    await refresh();
  } catch {
    error.value = 'Ошибка при сохранении урока';
  }
}
</script>

<template>
  <div class="mb-10 space-y-8">
    <div v-if="loading" class="py-8 text-center">Загрузка...</div>
    <div v-else>
      <div class="space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Редактировать урок</h2>
        <p class="text-muted-foreground">Измените информацию об уроке</p>
      </div>
      <LessonEditForm
        v-if="lesson"
        :lesson="lesson"
        :module-id="moduleId"
        :idx="0"
        :loading="loading"
        @save="handleLessonSave"
      />

      <div class="mt-10 max-w-2xl space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-semibold">Тесты</h3>
          <UIButton variant="secondary">
            <NuxtLink
              :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/tests/new`"
            >
              Добавить тест
            </NuxtLink>
          </UIButton>
        </div>
        <div v-if="tests.length === 0" class="text-muted-foreground">
          Для этого урока пока нет тестов
        </div>
        <ul v-else>
          <li v-for="test in tests" :key="test.id" class="mb-4">
            <NuxtLink
              :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/tests/${test.id}/edit`"
              class="text-blue-600 underline hover:text-blue-800"
            >
              Тест ({{ test.questionsCount }} вопрос{{
                test.questionsCount === 1 ? '' : test.questionsCount < 5 ? 'а' : 'ов'
              }}, макс. попыток: {{ test.maxAttempts }})
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
