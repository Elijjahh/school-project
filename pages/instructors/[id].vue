<script lang="ts" setup>
import { Users } from 'lucide-vue-next';

const route = useRoute();
const instructorId = route.params.id as string;

// Получаем данные преподавателя
const { data: instructorData, pending, error } = await useFetch(`/api/instructors/${instructorId}`);

const instructor = computed(() => instructorData.value?.instructor);

// SEO мета-теги
useSeoMeta({
  title: () => (instructor.value ? `${instructor.value.name} - Преподаватель` : 'Преподаватель'),
  description: () =>
    instructor.value
      ? `Профиль преподавателя ${instructor.value.name}. ${instructor.value.coursesCount} курсов, ${instructor.value.studentsCount} студентов.`
      : 'Профиль преподавателя',
});

// Форматирование даты
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
  });
};
</script>

<template>
  <div class="bg-background min-h-screen">
    <!-- Загрузка -->
    <div v-if="pending" class="container mx-auto px-6 py-12">
      <div class="flex items-center justify-center">
        <UISpinner class="h-8 w-8" />
      </div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="container mx-auto px-6 py-12">
      <div class="text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900">Преподаватель не найден</h1>
        <p class="mb-8 text-gray-600">Возможно, преподаватель был удален или не существует.</p>
        <UIButton as-child>
          <NuxtLink to="/">Вернуться на главную</NuxtLink>
        </UIButton>
      </div>
    </div>

    <!-- Профиль преподавателя -->
    <div v-else-if="instructor" class="container mx-auto px-6 py-12">
      <!-- Хедер профиля -->
      <div class="bg-muted/50 mb-8 rounded-lg p-8">
        <div class="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <!-- Аватар -->
          <div class="flex-shrink-0">
            <img
              :src="instructor.image"
              :alt="instructor.name"
              class="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
            />
          </div>

          <!-- Информация -->
          <div class="flex-1 text-center md:text-left">
            <h1 class="mb-2 text-3xl font-bold text-gray-900">{{ instructor.name }}</h1>
            <p class="mb-4 text-lg text-gray-600">{{ instructor.bio }}</p>

            <!-- Статистика -->
            <div class="mb-4 flex flex-wrap justify-center gap-6 md:justify-start">
              <div class="text-center">
                <div class="text-primary text-2xl font-bold">{{ instructor.coursesCount }}</div>
                <div class="text-sm text-gray-600">Курсов</div>
              </div>
              <div class="text-center">
                <div class="text-primary text-2xl font-bold">{{ instructor.studentsCount }}</div>
                <div class="text-sm text-gray-600">Студентов</div>
              </div>
              <div v-if="instructor.joinedAt" class="text-center">
                <div class="text-sm text-gray-600">Преподает с</div>
                <div class="text-sm font-medium">{{ formatDate(instructor.joinedAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Курсы преподавателя -->
      <div class="mb-8">
        <h2 class="mb-6 text-2xl font-bold">Курсы преподавателя</h2>

        <div v-if="instructor.courses.length === 0" class="py-12 text-center">
          <div class="text-lg text-gray-500">У этого преподавателя пока нет курсов</div>
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UICard
            v-for="course in instructor.courses"
            :key="course.id"
            class="overflow-hidden transition-shadow hover:shadow-lg"
          >
            <div class="relative">
              <img
                :src="course.image || '/default-course-image.jpg'"
                :alt="course.title"
                class="h-48 w-full object-cover"
              />
              <div v-if="course.category" class="absolute top-3 left-3">
                <UIBadge variant="secondary" class="bg-white/90 text-gray-900">
                  {{ course.category }}
                </UIBadge>
              </div>
            </div>

            <div class="p-6">
              <h3 class="mb-2 line-clamp-1 text-xl font-semibold">{{ course.title }}</h3>
              <p class="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600">
                {{ course.description }}
              </p>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1 text-sm text-gray-500">
                  <Users class="h-4 w-4" />
                  <span>{{ course.studentsCount }} студентов</span>
                </div>

                <UIButton size="sm" as-child>
                  <NuxtLink :to="`/app/courses/${course.id}`"> Перейти к курсу </NuxtLink>
                </UIButton>
              </div>
            </div>
          </UICard>
        </div>
      </div>

      <!-- Кнопка назад -->
      <div class="text-center">
        <UIButton variant="outline" as-child>
          <NuxtLink to="/">Вернуться на главную</NuxtLink>
        </UIButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
