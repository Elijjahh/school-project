<script setup lang="ts">
const { data: courses, pending, error } = await useFetch('/api/courses');
</script>

<template>
  <section class="py-10">
    <div class="container max-w-4xl mx-auto">
      <h1 class="text-4xl font-semibold mb-10">Мои курсы</h1>

      <div>
        <div class="flex gap-2.5 mb-5">
          <UIButton variant="ghost">Все</UIButton>
          <UIButton variant="ghost">Вводные</UIButton>
          <UIButton variant="ghost">Основные</UIButton>
          <UIButton variant="ghost">Профориентация</UIButton>
        </div>

        <div v-if="pending" class="flex justify-center items-center min-h-[200px]">
          <UISpinner class="w-8 h-8" />
        </div>
        <div v-else-if="error" class="text-red-500 text-center py-5">
          Произошла ошибка при загрузке курсов
        </div>
        <div v-else class="grid grid-cols-2 gap-5 mt-10">
          <UICard v-for="course in courses" :key="course.id" class="overflow-hidden">
            <img
              v-if="course.image"
              :src="course.image"
              :alt="course.title"
              class="w-full h-[200px] object-cover"
            />
            <img
              v-else
              src="/assets/images/register-img.png"
              :alt="course.title"
              class="w-full h-[200px] object-cover"
            />
            <UICardHeader>
              <UICardTitle>{{ course.title }}</UICardTitle>
            </UICardHeader>
            <UICardContent>
              <p class="text-gray-600">{{ course.description }}</p>
            </UICardContent>
          </UICard>
        </div>
      </div>
    </div>
  </section>
</template>
