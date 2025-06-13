<script setup lang="ts">
interface Category {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  createdAt: string | null;
}

const { data: categoriesData, refresh } = await useFetch('/api/categories');

const isLoading = ref(false);
const showModal = ref(false);
const editingCategory = ref<Category | null>(null);

const categories = computed(() => categoriesData.value?.categories || []);

// Форма для создания/редактирования категории
const form = reactive({
  name: '',
  description: '',
  image: '',
});

const resetForm = () => {
  form.name = '';
  form.description = '';
  form.image = '';
  editingCategory.value = null;
};

const openCreateModal = () => {
  resetForm();
  showModal.value = true;
};

const openEditModal = (category: Category) => {
  editingCategory.value = category;
  form.name = category.name;
  form.description = category.description || '';
  form.image = category.image || '';
  showModal.value = true;
};

const saveCategory = async () => {
  if (!form.name.trim()) return;

  isLoading.value = true;

  try {
    if (editingCategory.value) {
      // Редактирование существующей категории
      await $fetch(`/api/categories/${editingCategory.value.id}`, {
        method: 'PUT',
        body: {
          name: form.name,
          description: form.description || undefined,
          image: form.image || undefined,
        },
      });
    } else {
      // Создание новой категории
      await $fetch('/api/categories', {
        method: 'POST',
        body: {
          name: form.name,
          description: form.description || undefined,
          image: form.image || undefined,
        },
      });
    }

    await refresh();
    showModal.value = false;
    resetForm();
  } catch (error) {
    console.error('Error saving category:', error);
  } finally {
    isLoading.value = false;
  }
};

const { confirm, alert } = useModal();

const deleteCategory = async (category: Category) => {
  const confirmed = await confirm({
    title: 'Удаление категории',
    message: `Вы уверены, что хотите удалить категорию "${category.name}"?`,
    confirmText: 'Удалить',
    cancelText: 'Отмена',
  });

  if (!confirmed) {
    return;
  }

  try {
    await $fetch(`/api/categories/${category.id}`, {
      method: 'DELETE',
    });

    await refresh();
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      (error as { statusCode: number }).statusCode === 409
    ) {
      await alert({
        title: 'Ошибка удаления',
        message: 'Нельзя удалить категорию, которая используется в курсах',
        type: 'error',
      });
    } else {
      console.error('Error deleting category:', error);
    }
  }
};

definePageMeta({
  layout: 'admin',
});

useSeoMeta({
  title: 'Управление категориями',
  description: 'Админ панель для управления категориями курсов',
});
</script>

<template>
  <div class="space-y-8">
    <!-- Заголовок и статистика -->
    <div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="rounded-lg bg-gray-900 p-3">
            <AppIcon name="lucide:layers" class="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Управление категориями</h2>
            <p class="font-medium text-gray-600">Всего категорий: {{ categories.length }}</p>
          </div>
        </div>
        <UIButton size="lg" class="bg-gray-900 hover:bg-gray-800" @click="openCreateModal">
          <AppIcon name="lucide:plus" class="mr-2 h-5 w-5" />
          Добавить категорию
        </UIButton>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div
      v-if="categories.length === 0"
      class="rounded-lg border border-gray-300 bg-white p-16 text-center shadow-sm"
    >
      <div class="mx-auto max-w-md">
        <div
          class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100"
        >
          <AppIcon name="lucide:folder-plus" class="h-12 w-12 text-gray-600" />
        </div>
        <h3 class="mb-2 text-xl font-semibold text-gray-900">Нет категорий</h3>
        <p class="mb-6 text-gray-500">
          Создайте первую категорию для организации курсов на платформе.
        </p>
        <UIButton size="lg" class="bg-gray-900 hover:bg-gray-800" @click="openCreateModal">
          <AppIcon name="lucide:plus" class="mr-2 h-5 w-5" />
          Создать первую категорию
        </UIButton>
      </div>
    </div>

    <!-- Сетка категорий -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="category in categories"
        :key="category.id"
        class="group overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm transition-all duration-200 hover:shadow-lg"
      >
        <!-- Изображение категории -->
        <div class="relative h-48 overflow-hidden bg-gray-100">
          <img
            v-if="category.image"
            :src="category.image"
            :alt="category.name"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full w-full items-center justify-center bg-gray-100">
            <AppIcon name="lucide:folder" class="h-16 w-16 text-gray-400" />
          </div>
        </div>

        <!-- Контент карточки -->
        <div class="p-6">
          <h3 class="mb-2 text-lg font-semibold text-gray-900">
            {{ category.name }}
          </h3>

          <p v-if="category.description" class="mb-4 line-clamp-2 text-sm text-gray-600">
            {{ category.description }}
          </p>

          <div v-else class="mb-4 text-sm text-gray-400 italic">Описание не указано</div>

          <!-- Дата создания -->
          <div class="mb-4 flex items-center text-xs text-gray-500">
            <AppIcon name="lucide:calendar" class="mr-1 h-3 w-3" />
            <span>
              {{
                category.createdAt
                  ? new Date(category.createdAt).toLocaleDateString('ru-RU')
                  : 'Дата не указана'
              }}
            </span>
          </div>

          <!-- Кнопки действий -->
          <div class="flex space-x-2">
            <UIButton
              variant="outline"
              size="sm"
              class="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              @click="openEditModal(category)"
            >
              <AppIcon name="lucide:edit" class="mr-1 h-3 w-3" />
              Изменить
            </UIButton>
            <UIButton
              variant="outline"
              size="sm"
              class="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              @click="deleteCategory(category)"
            >
              <AppIcon name="lucide:trash" class="mr-1 h-3 w-3" />
              Удалить
            </UIButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal для создания/редактирования категории -->
    <div
      v-if="showModal"
      class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm"
    >
      <div class="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
        <div class="mb-6 flex items-center space-x-3">
          <div class="rounded-lg bg-gray-100 p-2">
            <AppIcon
              :name="editingCategory ? 'lucide:edit' : 'lucide:plus'"
              class="h-6 w-6 text-gray-700"
            />
          </div>
          <h3 class="text-xl font-semibold text-gray-900">
            {{ editingCategory ? 'Редактировать категорию' : 'Создать новую категорию' }}
          </h3>
        </div>

        <form class="space-y-6" @submit.prevent="saveCategory">
          <!-- Превью изображения -->
          <div v-if="form.image" class="overflow-hidden rounded-lg border border-gray-300">
            <img
              :src="form.image"
              :alt="form.name || 'Превью'"
              class="h-32 w-full object-cover"
              @error="form.image = ''"
            />
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div>
              <label for="name" class="mb-2 block text-sm font-semibold text-gray-700">
                Название категории <span class="text-gray-900">*</span>
              </label>
              <UIInput
                id="name"
                v-model="form.name"
                placeholder="Например: Веб-разработка"
                required
                class="text-base"
              />
            </div>

            <div>
              <label for="description" class="mb-2 block text-sm font-semibold text-gray-700">
                Описание
              </label>
              <UITextarea
                id="description"
                v-model="form.description"
                placeholder="Краткое описание категории..."
                rows="3"
                class="resize-none"
              />
            </div>

            <div>
              <label for="image" class="mb-2 block text-sm font-semibold text-gray-700">
                URL изображения
              </label>
              <UIInput
                id="image"
                v-model="form.image"
                type="url"
                placeholder="https://example.com/image.jpg"
                class="text-base"
              />
              <p class="mt-1 text-xs text-gray-500">Рекомендуемый размер: 400x300 пикселей</p>
            </div>
          </div>

          <div class="flex justify-end space-x-3 border-t border-gray-200 pt-4">
            <UIButton
              type="button"
              variant="outline"
              :disabled="isLoading"
              size="lg"
              @click="showModal = false"
            >
              Отмена
            </UIButton>
            <UIButton
              type="submit"
              :disabled="isLoading || !form.name.trim()"
              size="lg"
              class="bg-gray-900 hover:bg-gray-800"
            >
              <UISpinner v-if="isLoading" class="mr-2 h-4 w-4" />
              <AppIcon
                v-else
                :name="editingCategory ? 'lucide:save' : 'lucide:plus'"
                class="mr-2 h-4 w-4"
              />
              {{ editingCategory ? 'Сохранить изменения' : 'Создать категорию' }}
            </UIButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
