<script lang="ts" setup>
import type { Course } from '~/drizzle/types';

defineProps<{
  courses?: (Course & {
    completed: boolean;
    progress: number;
  })[];
  pending?: boolean;
  error?: Error;
}>();
</script>

<template>
  <div>
    <div v-if="pending" class="flex min-h-[200px] items-center justify-center">
      <UISpinner class="h-8 w-8" />
    </div>
    <div v-else-if="error" class="py-5 text-center text-red-500">
      Произошла ошибка при загрузке курсов
    </div>
    <div v-else class="mt-10 grid grid-cols-2 gap-5">
      <CourseCard
        v-for="course in courses"
        :key="course.id"
        :course="{
          id: course.id,
          title: course.title,
          description: course.description,
          image: course.image,
          creatorId: course.creatorId,
          categoryId: course.categoryId,
          completed: course.completed,
          progress: course.progress,
        }"
      />
    </div>
  </div>
</template>
