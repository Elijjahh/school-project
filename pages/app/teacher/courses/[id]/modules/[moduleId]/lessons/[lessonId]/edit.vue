<script setup lang="ts">
const route = useRoute();
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
    </div>
  </div>
</template>
