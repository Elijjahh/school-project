<script lang="ts" setup>
defineProps<{
  courses?: Array<{
    id: number;
    title: string;
    description: string;
    image?: string | null;
    completed?: boolean;
    progress?: number;
  }>;
  pending?: boolean;
  error?: Error;
}>();
</script>

<template>
  <div>
    <div v-if="pending" class="flex justify-center items-center min-h-[200px]">
      <UISpinner class="w-8 h-8" />
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-5">
      Произошла ошибка при загрузке курсов
    </div>
    <div v-else class="grid grid-cols-2 gap-5 mt-10">
      <CourseCard
        v-for="course in courses"
        :key="course.id"
        :course="{
          id: course.id,
          title: course.title,
          description: course.description,
          image: course.image,
          completed: course.completed,
          progress: course.progress,
        }"
      />
    </div>
  </div>
</template>
