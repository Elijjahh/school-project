<script lang="ts" setup>
import { useWishlistStore } from '~/stores/wishlist';
import { Heart } from 'lucide-vue-next';

const props = defineProps<{
  course: {
    id: number;
    title: string;
    description: string;
    image?: string | null;
    completed?: boolean;
    progress?: number;
  };
}>();

const wishlistStore = useWishlistStore();
const isLoading = ref(false);

const toggleWishlist = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  await wishlistStore.toggleWishlist(props.course.id);
  isLoading.value = false;
};
</script>

<template>
  <UICard class="flex flex-col">
    <img :src="course.image || ''" class="w-full h-48 object-cover rounded-t-lg" />
    <div class="p-4 flex flex-col gap-4">
      <h3 class="text-xl font-semibold">{{ course.title }}</h3>
      <p class="text-gray-600">{{ course.description }}</p>
      <div class="flex items-center justify-between mt-auto">
        <UIButton variant="default">Watch Lecture</UIButton>
        <div class="flex items-center gap-2">
          <span v-if="course.completed" class="text-green-500">
            {{ course.progress ? course.progress + '%' : '' }} Completed
          </span>
          <span v-else-if="course.progress" class="text-blue-500">
            {{ course.progress }}% Finish
          </span>
          <UIButton variant="ghost" size="icon" :disabled="isLoading" @click="toggleWishlist">
            <Heart
              class="w-5 h-5"
              :class="{ 'text-red-500 fill-red-500': wishlistStore.isInWishlist(course.id) }"
            />
          </UIButton>
        </div>
      </div>
    </div>
  </UICard>
</template>
