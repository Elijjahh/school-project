import { defineStore } from 'pinia';
import type { Course } from '~/drizzle/types';

export const useWishlistStore = defineStore('wishlist', () => {
  // State
  const courses = ref<Course[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  function isInWishlist(courseId: number) {
    return courses.value.some((course) => course.id === courseId);
  }

  // Actions
  async function fetchWishlist() {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Course[]>('/api/wishlist');
      courses.value = data || [];
    } catch (err) {
      error.value = err as string;
      console.error('Failed to fetch wishlist:', err);
    }
    loading.value = false;
  }

  async function addToWishlist(courseId: number) {
    try {
      await $fetch('/api/wishlist', {
        method: 'POST',
        body: { courseId },
      });
      await fetchWishlist(); // Refresh the wishlist
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      throw err;
    }
  }

  async function removeFromWishlist(courseId: number) {
    try {
      await $fetch(`/api/wishlist/${courseId}`, {
        method: 'DELETE',
      });
      await fetchWishlist(); // Refresh the wishlist
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      throw err;
    }
  }

  async function toggleWishlist(courseId: number) {
    if (isInWishlist(courseId)) await removeFromWishlist(courseId);
    else await addToWishlist(courseId);
  }

  return {
    // State
    courses,
    loading,
    isLoading: loading,
    error,
    // Getters
    isInWishlist,
    // Actions
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
  };
});
