<script setup lang="ts">
import { useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { NuxtError } from '#app';
import type { Category } from '~/drizzle/types';

definePageMeta({
  layout: 'profile',
});

// --- Course Info Fields ---
const {
  value: title,
  errorMessage: titleError,
  validate: validateTitle,
} = useField('title', toTypedSchema(zod.string().min(1, { message: 'Название обязательно' })), {
  initialValue: '',
});
const {
  value: description,
  errorMessage: descriptionError,
  validate: validateDescription,
} = useField(
  'description',
  toTypedSchema(zod.string().min(1, { message: 'Описание обязательно' })),
  { initialValue: '' },
);
const { value: image, errorMessage: imageError } = useField<string>('image', undefined, {
  initialValue: '',
});
const {
  value: categoryId,
  errorMessage: categoryError,
  validate: validateCategory,
} = useField(
  'categoryId',
  toTypedSchema(zod.string().min(1, { message: 'Категория обязательна' })),
  { initialValue: '' },
);

// --- Submission ---
const loading = ref(false);
const error = ref('');
const success = ref('');

// --- Categories (dynamic, fetched from API) ---
const { data: categoriesData } = await useFetch<Category[]>('/api/categories');

const categories = computed(() => {
  const fetched = (categoriesData.value || []) as Category[];
  return fetched.map((cat) => ({ id: String(cat.id), label: cat.name }));
});

const { user } = useUserSession();
const router = useRouter();

// --- Image upload state ---
const selectedImage = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const imageLoading = ref(false);

const onImageChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    selectedImage.value = file;
    imagePreview.value = URL.createObjectURL(file);
    imageLoading.value = true;
    imageError.value = '';
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await $fetch<{ url: string }>('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });
      image.value = response.url;
      selectedImage.value = null;
    } catch (err) {
      const statusCode = (err as NuxtError).statusCode;
      if (statusCode === 400)
        imageError.value = 'Некорректный формат файла или размер превышает 2MB';
      else imageError.value = 'Ошибка при загрузке изображения';
      imagePreview.value = null;
    }
    imageLoading.value = false;
  }
};

async function handleSubmit() {
  error.value = '';
  success.value = '';
  loading.value = true;
  const results = await Promise.all([validateTitle(), validateDescription(), validateCategory()]);
  if (results.some((r) => r.errors.length > 0)) {
    error.value = 'Пожалуйста, заполните все обязательные поля';
    loading.value = false;
    return;
  }
  try {
    if (!user.value?.id) throw new Error('Пользователь не найден');
    const body = {
      title: title.value,
      description: description.value,
      image: image.value,
      creatorId: user.value.id,
      categoryId: Number(categoryId.value),
    };
    await $fetch('/api/courses', {
      method: 'POST',
      body,
    });
    success.value = 'Курс успешно создан!';
    // Redirect to edit page for the new course

    router.push('/app/my-courses');
  } catch (err) {
    const statusCode = (err as NuxtError).statusCode;
    if (statusCode === 400) error.value = 'Введите корректные данные';
    else if (statusCode === 409) error.value = 'Курс с такими данными уже существует';
    else error.value = 'Ошибка на сервере';
  }
  loading.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="space-y-8">
        <!-- Breadcrumbs -->
        <UIBreadcrumb>
          <UIBreadcrumbList>
            <UIBreadcrumbItem>
              <UIBreadcrumbLink href="/app/my-courses">Мои курсы</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbPage>Создать курс</UIBreadcrumbPage>
            </UIBreadcrumbItem>
          </UIBreadcrumbList>
        </UIBreadcrumb>

        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Создать курс</h1>
          <p class="text-gray-600">Заполните информацию о курсе</p>
        </div>

        <!-- Course Creation Form -->
        <UICard class="max-w-2xl">
          <UICardHeader>
            <UICardTitle>Информация о курсе</UICardTitle>
            <UICardDescription>Основные сведения для будущих студентов</UICardDescription>
          </UICardHeader>
          <UICardContent>
            <div class="space-y-4">
              <div>
                <FormInput
                  id="course-title"
                  v-model="title"
                  label="Название курса"
                  placeholder="Введите название"
                  :error="titleError"
                />
              </div>
              <div>
                <UITextarea
                  v-model="description"
                  label="Описание"
                  placeholder="Краткое описание"
                  rows="3"
                  :class="{ 'border-destructive focus-visible:ring-destructive': descriptionError }"
                />
                <p v-if="descriptionError" class="text-destructive mt-1 text-sm font-medium">
                  {{ descriptionError }}
                </p>
              </div>
              <div>
                <div class="flex items-center gap-4">
                  <div class="relative h-24 w-24">
                    <img
                      v-if="imagePreview || image"
                      :src="imagePreview || image"
                      alt="Course image"
                      class="h-full w-full rounded object-cover"
                    />
                    <div
                      v-else
                      class="bg-muted flex h-full w-full items-center justify-center rounded"
                    >
                      <span class="text-muted-foreground text-2xl font-medium">
                        <span>📷</span>
                      </span>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <UIButton
                      type="button"
                      variant="outline"
                      :disabled="imageLoading"
                      @click="fileInput?.click()"
                    >
                      <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="onImageChange"
                      />
                      <span v-if="imageLoading" class="flex items-center">
                        <span class="mr-2">Загружаем...</span>
                        <span
                          class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                        />
                      </span>
                      <span v-else>Загрузить изображение</span>
                    </UIButton>
                    <p class="text-muted-foreground text-sm">JPG, PNG до 2MB</p>
                  </div>
                </div>
                <p v-if="imageError" class="text-destructive mt-1 text-sm font-medium">
                  {{ imageError }}
                </p>
              </div>
              <div>
                <UISelect v-model="categoryId" placeholder="Выберите категорию">
                  <UISelectTrigger>
                    <UISelectValue />
                  </UISelectTrigger>
                  <UISelectContent>
                    <UISelectItem
                      v-for="category in categories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.label }}
                    </UISelectItem>
                  </UISelectContent>
                </UISelect>
                <p v-if="categoryError" class="text-destructive mt-1 text-sm font-medium">
                  {{ categoryError }}
                </p>
              </div>
            </div>
          </UICardContent>
          <UICardFooter class="flex justify-between">
            <UIButton variant="outline" @click="router.push('/app/my-courses')"> Отмена </UIButton>
            <UIButton :disabled="loading" @click="handleSubmit">
              <span v-if="loading" class="flex items-center">
                <span class="mr-2">Создание...</span>
                <span
                  class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
              </span>
              <span v-else>Создать курс</span>
            </UIButton>
          </UICardFooter>
        </UICard>

        <!-- Success/Error Messages -->
        <div v-if="success" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <svg
              class="h-5 w-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">{{ success }}</p>
            </div>
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
