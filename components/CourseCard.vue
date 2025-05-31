<script lang="ts" setup>
import { useWishlistStore } from '~/stores/wishlist';
import { Heart, Users } from 'lucide-vue-next';
import type { CourseWithUIFields } from '~/drizzle/types';

const props = defineProps<{
  course: CourseWithUIFields & {
    image?: string | null;
  };
  mode?: 'student' | 'teacher';
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
    <div class="relative flex aspect-video flex-col">
      <img
        :src="course.image || ''"
        class="h-full w-full object-cover transition-all group-hover:scale-105"
        :alt="course.title"
      />
      <div class="from-background/80 flex-1 bg-gradient-to-t to-transparent" />
    </div>
    <div class="space-y-3 p-4">
      <h3 class="leading-none font-semibold tracking-tight">{{ course.title }}</h3>
      <p class="text-muted-foreground line-clamp-2 text-sm">{{ course.description }}</p>
      <div v-if="mode === 'teacher'" class="flex flex-col gap-2 pt-2">
        <div class="text-muted-foreground flex items-center gap-2 text-xs">
          <UIBadge v-if="course.category" variant="secondary" class="text-xs">
            {{ course.category }}
          </UIBadge>
          <span v-if="course.studentsCount" class="flex items-center gap-1">
            <Users class="h-3 w-3" />
            {{ course.studentsCount }} студентов
          </span>
        </div>
        <div class="mt-2 flex gap-2">
          <NuxtLink :to="`/app/courses/${course.id}`">
            <UIButton variant="outline" size="sm">Детали</UIButton>
          </NuxtLink>
          <NuxtLink :to="`/app/courses/${course.id}/edit`">
            <UIButton variant="secondary" size="sm">Редактировать</UIButton>
          </NuxtLink>
        </div>
      </div>
      <div v-else class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-2">
          <span
            v-if="course.completed"
            class="focus:ring-ring bg-primary text-primary-foreground hover:bg-primary/80 inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            {{ course.progress ? course.progress + '%' : '' }} Completed
          </span>
          <span
            v-else-if="course.progress"
            class="focus:ring-ring bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
      <NuxtLink v-if="mode !== 'teacher'" :to="`/app/courses/${course.id}`" class="w-full">
        <UIButton class="w-full" variant="default"> Перейти к курсу </UIButton>
      </NuxtLink>
    </div>
  </UICard>
</template>
