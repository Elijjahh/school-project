<script setup lang="ts">
import { useWishlistStore } from '~/stores/wishlist';
import { Compass } from 'lucide-vue-next';

// Expanded type for course
interface Course {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  completed?: boolean;
  progress?: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string | null;
}

const categories = ref<{ id: string; label: string }[]>([{ id: 'all', label: 'Все' }]);
const categoriesLoading = ref(true);
const categoriesError = ref<unknown>(null);

const sortFields = [
  { id: 'id', label: 'ID' },
  { id: 'title', label: 'Название' },
  { id: 'image', label: 'Изображение' },
];
const sortOrders = [
  { id: 'asc', label: 'По возрастанию' },
  { id: 'desc', label: 'По убыванию' },
];

const selectedCategory = ref('all');
const selectedSortField = ref('id');
const selectedSortOrder = ref('asc');

const courses = ref<Course[]>([]);
const pending = ref(false);
const error = ref<unknown>(null);

const wishlistStore = useWishlistStore();

async function fetchCategories() {
  categoriesLoading.value = true;
  categoriesError.value = null;
  try {
    const { data, error: fetchError } = await useFetch<Category[]>('/api/categories');
    if (fetchError.value) throw fetchError.value;
    const fetched = data.value || [];
    categories.value = [
      { id: 'all', label: 'Все' },
      ...fetched.map((cat) => ({ id: String(cat.id), label: cat.name })),
    ];
  } catch (err) {
    categoriesError.value = err;
    categories.value = [{ id: 'all', label: 'Все' }];
  } finally {
    categoriesLoading.value = false;
  }
}

async function fetchCourses() {
  pending.value = true;
  error.value = null;
  try {
    const { data, error: fetchError } = await useFetch<Course[]>('/api/courses', {
      query: {
        category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
        sort: selectedSortField.value,
        order: selectedSortOrder.value,
      },
    });
    if (fetchError.value) throw fetchError.value;
    courses.value = data.value || [];
  } catch (err) {
    error.value = err;
    courses.value = [];
  } finally {
    pending.value = false;
  }
}

watch([selectedCategory, selectedSortField, selectedSortOrder], fetchCourses, { immediate: true });

onMounted(async () => {
  await fetchCategories();
  await wishlistStore.fetchWishlist();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div class="space-y-8">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Курсы</h1>
        <p class="text-muted-foreground">Выберите курс и начните обучение прямо сейчас</p>
      </div>

      <div class="space-y-4">
        <!-- Filters (categories) -->
        <div class="flex flex-wrap gap-2">
          <template v-if="categoriesLoading">
            <span class="text-muted-foreground text-sm">Загрузка категорий...</span>
          </template>
          <template v-else>
            <UIButton
              v-for="category in categories"
              :key="category.id"
              variant="outline"
              size="sm"
              :class="{
                'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground':
                  selectedCategory === category.id,
              }"
              @click="selectedCategory = category.id"
            >
              {{ category.label }}
            </UIButton>
          </template>
        </div>

        <!-- Sorting controls below filters -->
        <div class="flex items-center gap-2">
          <label class="text-sm">Сортировать:</label>
          <div class="flex gap-2">
            <UISelect v-model="selectedSortField">
              <UISelectTrigger class="min-w-[140px]">
                <UISelectValue :placeholder="'Поле'">
                  {{ sortFields.find((f) => f.id === selectedSortField)?.label || 'Поле' }}
                </UISelectValue>
              </UISelectTrigger>
              <UISelectContent>
                <UISelectGroup>
                  <UISelectLabel>Поле</UISelectLabel>
                  <UISelectItem v-for="field in sortFields" :key="field.id" :value="field.id">
                    {{ field.label }}
                  </UISelectItem>
                </UISelectGroup>
              </UISelectContent>
            </UISelect>
            <UISelect v-model="selectedSortOrder">
              <UISelectTrigger class="min-w-[140px]">
                <UISelectValue :placeholder="'Порядок'">
                  {{ sortOrders.find((o) => o.id === selectedSortOrder)?.label || 'Порядок' }}
                </UISelectValue>
              </UISelectTrigger>
              <UISelectContent>
                <UISelectGroup>
                  <UISelectLabel>Порядок</UISelectLabel>
                  <UISelectItem v-for="order in sortOrders" :key="order.id" :value="order.id">
                    {{ order.label }}
                  </UISelectItem>
                </UISelectGroup>
              </UISelectContent>
            </UISelect>
          </div>
        </div>

        <div v-if="pending" class="flex justify-center py-8">
          <div
            class="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          />
        </div>
        <div
          v-else-if="error"
          class="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4"
        >
          <p class="text-center">Не удалось загрузить курсы</p>
        </div>
        <div
          v-else-if="!courses.length"
          class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        >
          <div class="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <Compass class="text-muted-foreground h-6 w-6" />
          </div>
          <h3 class="mt-4 text-lg font-semibold">Нет доступных курсов</h3>
          <p class="text-muted-foreground mt-2 text-sm">
            В данный момент нет доступных курсов в этой категории
          </p>
        </div>
        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CourseCard v-for="course in courses" :key="course.id" :course="course" />
        </div>
      </div>
    </div>
  </div>
</template>
