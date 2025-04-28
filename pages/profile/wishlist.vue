<script setup lang="ts">
import { useWishlistStore } from '~/stores/wishlist';

const wishlistStore = useWishlistStore();

// Fetch wishlist on page load
onMounted(async () => {
  await wishlistStore.fetchWishlist();
});
</script>

<template>
  <section class="py-10">
    <div class="container max-w-4xl mx-auto">
      <h1 class="text-4xl font-semibold mb-10">Мой список желаний</h1>

      <div>
        <div v-if="wishlistStore.isLoading" class="flex justify-center items-center min-h-[200px]">
          <UISpinner class="w-8 h-8" />
        </div>
        <div v-else-if="wishlistStore.error" class="text-red-500 text-center py-5">
          Произошла ошибка при загрузке списка желаний
        </div>
        <div v-else-if="!wishlistStore.courses.length" class="text-center py-10">
          <p class="text-gray-600">Ваш список желаний пуст</p>
        </div>
        <div v-else class="grid grid-cols-2 gap-5 mt-10">
          <CourseCard v-for="course in wishlistStore.courses" :key="course.id" :course="course" />
        </div>
      </div>
    </div>
  </section>
</template>
