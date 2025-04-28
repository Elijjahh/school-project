import { defineStore } from 'pinia';

interface Course {
  id: number;
  title: string;
  description: string;
  image?: string | null;
}

export const useWishlistStore = defineStore('wishlist', () => {
  // State
  const courses = ref<Course[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  // Getters
  function isInWishlist(courseId: number) {
    return courses.value.some((course) => course.id === courseId);
  }

  // Actions
  async function fetchWishlist() {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await useFetch('/api/wishlist');
      courses.value = data.value || [];
    } catch (err) {
      error.value = err as Error;
      console.error('Failed to fetch wishlist:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function addToWishlist(courseId: number) {
    try {
      await useFetch('/api/wishlist', {
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
      await useFetch(`/api/wishlist/${courseId}`, {
        method: 'DELETE',
      });
      await fetchWishlist(); // Refresh the wishlist
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      throw err;
    }
  }

  async function toggleWishlist(courseId: number) {
    if (isInWishlist(courseId)) {
      await removeFromWishlist(courseId);
    } else {
      await addToWishlist(courseId);
    }
  }

  return {
    // State
    courses,
    isLoading,
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
