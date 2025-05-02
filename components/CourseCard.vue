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
  <UICard class="group relative overflow-hidden rounded-lg border">
    <div class="aspect-video relative flex flex-col">
      <img
        :src="course.image || ''"
        class="h-full w-full object-cover transition-all group-hover:scale-105"
        :alt="course.title"
      />
      <div class="flex-1 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
    <div class="p-4 space-y-3">
      <h3 class="font-semibold leading-none tracking-tight">{{ course.title }}</h3>
      <p class="text-sm text-muted-foreground line-clamp-2">{{ course.description }}</p>
      <div class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-2">
          <span
            v-if="course.completed"
            class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
          >
            {{ course.progress ? course.progress + '%' : '' }} Completed
          </span>
          <span
            v-else-if="course.progress"
            class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {{ course.progress }}% Progress
          </span>
        </div>
        <UIButton
          variant="ghost"
          size="icon"
          :disabled="isLoading"
          class="h-8 w-8"
          @click="toggleWishlist"
        >
          <Heart
            class="h-4 w-4"
            :class="{ 'text-destructive fill-destructive': wishlistStore.isInWishlist(course.id) }"
          />
        </UIButton>
      </div>
      <NuxtLink :to="`/app/courses/${course.id}`" class="w-full">
        <UIButton class="w-full" variant="default"> Перейти к курсу </UIButton>
      </NuxtLink>
    </div>
  </UICard>
</template>
