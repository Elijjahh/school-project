<script lang="ts" setup>
defineProps<{
  courses?: Array<{
    id: string | number;
    title: string;
    description: string;
    image?: string | null;
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
</template>
