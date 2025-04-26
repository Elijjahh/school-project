<script lang="ts" setup>
defineProps<{
  course: {
    id: string;
    title: string;
    description: string;
    image?: string;
    completed?: boolean;
    progress?: number;
  };
}>();
</script>

<template>
  <UICard class="flex flex-col">
    <img :src="course.image || ''" class="w-full h-48 object-cover rounded-t-lg" />
    <div class="p-4 flex flex-col gap-4">
      <h3 class="text-xl font-semibold">{{ course.title }}</h3>
      <p class="text-gray-600">{{ course.description }}</p>
      <div class="flex items-center justify-between mt-auto">
        <UIButton variant="default">Watch Lecture</UIButton>
        <span v-if="course.completed" class="text-green-500">
          {{ course.progress ? course.progress + '%' : '' }} Completed
        </span>
        <span v-else-if="course.progress" class="text-blue-500">
          {{ course.progress }}% Finish
        </span>
      </div>
    </div>
  </UICard>
</template>
