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
  if (completed.value || loading.value) return;

  try {
    loading.value = true;
    await $fetch(`/api/lessons/${props.lessonId}/progress`, {
      method: 'PUT',
      body: { userId: props.userId },
    });

    completed.value = true;
    emit('progressUpdated');
  } catch (error) {
    console.error('Failed to mark lesson as completed:', error);
  } finally {
    loading.value = false;
  }
};

// Автоматическое отслеживание времени
const startTimer = () => {
  if (!props.autoMarkCompleted || completed.value) return;

  timer.value = setInterval(() => {
    timeSpent.value += 1;

    // Отмечаем урок как завершенный через 60 секунд
    if (timeSpent.value >= 60 && !completed.value) {
      markCompleted();
      stopTimer();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

// Lifecycle hooks
onMounted(() => {
  checkLessonProgress();

  if (props.autoMarkCompleted) {
    startTimer();
  }
});

onBeforeUnmount(() => {
  stopTimer();
});

// Экспортируем функции для внешнего использования
defineExpose({
  markCompleted,
  checkProgress: checkLessonProgress,
});
</script>

<template>
  <div class="flex items-center space-x-2">
    <!-- Индикатор завершения -->
    <div class="flex items-center space-x-2">
      <div
        :class="completed ? 'bg-green-500' : 'bg-gray-300'"
        class="h-3 w-3 rounded-full transition-colors duration-200"
      ></div>
      <span
        :class="completed ? 'font-medium text-green-700' : 'text-gray-600'"
        class="text-sm transition-colors duration-200"
      >
        {{ completed ? 'Урок завершен' : 'Урок не завершен' }}
      </span>
    </div>

    <!-- Таймер автозавершения (только для разработки) -->
    <div
      v-if="props.autoMarkCompleted && !completed && timeSpent > 0"
      class="text-xs text-gray-500"
    >
      {{ Math.max(0, 60 - timeSpent) }}с до автозавершения
    </div>
  </div>
</template>
