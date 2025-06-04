<script setup lang="ts">
interface Props {
  lessonId: number;
  userId: number;
  autoMarkCompleted?: boolean; // Автоматически отмечать урок как завершенный через минуту
}

const props = withDefaults(defineProps<Props>(), {
  autoMarkCompleted: false,
});

const emit = defineEmits<{
  progressUpdated: [];
}>();

const completed = ref(false);
const loading = ref(false);
const timeSpent = ref(0);
const timer = ref<NodeJS.Timeout | null>(null);
const startTime = ref<Date | null>(null);
const isAuthor = ref(false);

// Проверяем, завершен ли урок при загрузке компонента
const checkLessonProgress = async () => {
  try {
    // Получаем модуль урока для определения курса
    const lessonData = await $fetch(`/api/lessons/${props.lessonId}`);
    if (!lessonData?.moduleId) return;

    const moduleData = await $fetch(`/api/modules/${lessonData.moduleId}`);
    if (!moduleData?.courseId) return;

    // Получаем прогресс курса
    const progressData = await $fetch(
      `/api/courses/${moduleData.courseId}/progress?userId=${props.userId}`,
    );

    // Проверяем, является ли пользователь автором
    if ('isAuthor' in progressData && progressData.isAuthor) {
      isAuthor.value = true;
      return;
    }

    // Ищем текущий урок в прогрессе
    for (const module of progressData.modules || []) {
      const lesson = module.lessons?.find((l) => l.lessonId === props.lessonId);
      if (lesson) {
        completed.value = lesson.completed;
        break;
      }
    }
  } catch (error) {
    console.error('Failed to check lesson progress:', error);
  }
};

// Отмечаем урок как завершенный
const markCompleted = async () => {
  if (completed.value || loading.value || isAuthor.value) return;

  loading.value = true;
  try {
    await $fetch(`/api/lessons/${props.lessonId}/progress`, {
      method: 'PUT',
      body: { userId: props.userId },
    });
    completed.value = true;
    emit('progressUpdated');

    // Перепроверяем статус урока для надежности
    await nextTick();
    await checkLessonProgress();
  } catch (error) {
    console.error('Failed to mark lesson as completed:', error);
  } finally {
    loading.value = false;
  }
};

// Функция для обновления времени
const updateTime = () => {
  if (startTime.value && !completed.value && !isAuthor.value) {
    const now = new Date();
    timeSpent.value = Math.floor((now.getTime() - startTime.value.getTime()) / 1000);

    // Если включена автоматическая отметка и прошла минута
    if (props.autoMarkCompleted && timeSpent.value >= 60) {
      markCompleted();
      clearTimer();
    }
  }
};

// Запуск таймера
const startTimer = () => {
  if (completed.value || isAuthor.value) return;

  startTime.value = new Date();
  timer.value = setInterval(updateTime, 1000);

  // Запускаем сразу первое обновление времени
  updateTime();
};

// Остановка таймера
const clearTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

// Форматирование времени
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Инициализация при монтировании компонента
onMounted(async () => {
  await checkLessonProgress();

  // Запускаем таймер только если урок не завершен и пользователь не автор
  if (!completed.value && !isAuthor.value) {
    startTimer();
  }
});

// Очистка при размонтировании
onUnmounted(() => {
  clearTimer();
});

// Экспортируем функции для внешнего использования
defineExpose({
  markCompleted,
  timeSpent: readonly(timeSpent),
  completed: readonly(completed),
});
</script>

<template>
  <!-- Не показываем прогресс для авторов курса -->
  <div
    v-if="!isAuthor && !completed"
    class="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3"
  >
    <div class="flex items-center gap-2">
      <div class="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></div>
      <span class="text-sm font-medium text-yellow-800">Урок в процессе</span>
    </div>

    <!-- Таймер времени на уроке -->
    <div class="text-sm text-yellow-700">Время: {{ formatTime(timeSpent) }}</div>

    <!-- Кнопка ручного завершения -->
    <UIButton
      v-if="!autoMarkCompleted"
      variant="outline"
      size="sm"
      :loading="loading"
      @click="markCompleted"
      class="ml-auto"
    >
      Завершить урок
    </UIButton>
  </div>

  <div
    v-else-if="!isAuthor && completed"
    class="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3"
  >
    <div class="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
      <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        ></path>
      </svg>
    </div>
    <span class="text-sm font-medium text-green-800">Урок завершен</span>
  </div>
</template>
