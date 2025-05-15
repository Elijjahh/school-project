<script setup lang="ts">
const route = useRoute();
const courseId = Number(route.params.id);
const moduleId = Number(route.params.moduleId);

const { data: moduleDataRaw, pending: loading, refresh } = useFetch(`/api/modules/${moduleId}`);

const moduleData = computed(() => {
  return moduleDataRaw.value
    ? {
        id: moduleDataRaw.value.id,
        title: moduleDataRaw.value.title,
        description: moduleDataRaw.value.description,
        order: moduleDataRaw.value.order,
      }
    : null;
});

const lessons = computed(() => {
  return Array.isArray(moduleDataRaw.value?.lessons)
    ? moduleDataRaw.value.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
      }))
    : [];
});

const error = ref('');

async function handleModuleSave(payload: { title: string; description: string; order: number }) {
  if (!moduleData.value) return;
  try {
    await $fetch(`/api/modules/${moduleId}`, {
      method: 'PATCH',
      body: {
        courseId,
        title: payload.title,
        description: payload.description,
        order: payload.order,
      },
    });
    await refresh();
  } catch {
    error.value = 'Ошибка при сохранении модуля';
  }
}
</script>

<template>
  <div class="space-y-8 mb-10">
    <div v-if="loading" class="text-center py-8">Загрузка...</div>
    <div v-else>
      <div class="space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Редактировать модуль</h2>
        <p class="text-muted-foreground">Измените информацию о модуле и список уроков</p>
      </div>
      <ModuleEditForm
        v-if="moduleData"
        :module="moduleData"
        :idx="0"
        :loading="loading"
        @save="handleModuleSave"
      />
      <div class="space-y-6 mt-10 max-w-2xl">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-semibold">Уроки</h3>
          <UIButton variant="secondary">
            <NuxtLink :to="`/app/teacher/courses/${courseId}/modules/${moduleId}/lessons/new`">
              Добавить урок
            </NuxtLink>
          </UIButton>
        </div>
        <ul>
          <li v-for="lesson in lessons" :key="lesson.id" class="mb-4">
            <NuxtLink
              :to="`/app/teacher/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/edit`"
              class="underline text-blue-600 hover:text-blue-800"
            >
              {{ lesson.title || 'Без названия' }} (Порядок: {{ lesson.order }})
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
