<script setup lang="ts">
import { useWishlistStore } from '~/stores/wishlist';

const { data: courses, pending, error } = await useFetch('/api/courses');
const wishlistStore = useWishlistStore();

// Fetch wishlist on page load
onMounted(async () => {
  await wishlistStore.fetchWishlist();
});
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

        <CourseList
          :courses="courses || undefined"
          :pending="pending"
          :error="error || undefined"
        />
      </div>
    </div>
  </section>
</template>
