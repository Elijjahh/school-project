<script setup lang="ts">
import { useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { NuxtError } from '#app';

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
interface Category {
  id: number;
  name: string;
}
const categories = ref<{ id: string; label: string }[]>([]);
const categoriesLoading = ref(true);
const categoriesError = ref<unknown>(null);

const { user } = useUserSession();
const router = useRouter();

async function fetchCategories() {
  categoriesLoading.value = true;
  categoriesError.value = null;
  try {
    const { data, error: fetchError } = await useFetch('/api/categories');
    if (fetchError.value) throw fetchError.value;
    const fetched = (data.value || []) as Category[];
    categories.value = fetched.map((cat) => ({ id: String(cat.id), label: cat.name }));
  } catch (err) {
    categoriesError.value = err;
    categories.value = [];
  } finally {
    categoriesLoading.value = false;
  }
}

onMounted(fetchCategories);

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

    router.push('/app/teacher/courses');
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
  <div class="space-y-8 mb-10">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Создать курс</h2>
      <p class="text-muted-foreground">Заполните информацию о курсе</p>
    </div>
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
            <p v-if="descriptionError" class="text-sm font-medium text-destructive mt-1">
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
                <div v-else class="flex h-full w-full items-center justify-center rounded bg-muted">
                  <span class="text-2xl font-medium text-muted-foreground">
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
                <p class="text-sm text-muted-foreground">
                  JPG, GIF или PNG. Максимальный размер 2MB
                </p>
                <p v-if="imageError" class="text-sm font-medium text-destructive">
                  {{ imageError }}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div v-if="categoriesLoading" class="text-muted-foreground text-sm">
              Загрузка категорий...
            </div>
            <div v-else-if="categoriesError" class="text-destructive text-sm">
              Ошибка загрузки категорий
            </div>
            <div v-else>
              <UISelect v-model="categoryId">
                <UISelectTrigger
                  :class="[
                    'w-full',
                    { 'border-destructive focus-visible:ring-destructive': categoryError },
                  ]"
                >
                  <UISelectValue :placeholder="'Выберите категорию'">
                    {{
                      categories.find((cat) => cat.id === categoryId)?.label || 'Выберите категорию'
                    }}
                  </UISelectValue>
                </UISelectTrigger>
                <UISelectContent>
                  <UISelectGroup>
                    <UISelectLabel>Категории</UISelectLabel>
                    <UISelectItem v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.label }}
                    </UISelectItem>
                  </UISelectGroup>
                </UISelectContent>
              </UISelect>
              <div v-if="categoryError" class="text-sm font-medium text-destructive mt-1">
                {{ categoryError }}
              </div>
            </div>
          </div>
        </div>
      </UICardContent>
    </UICard>

    <div v-if="error" class="text-sm font-medium text-destructive">{{ error }}</div>
    <div v-if="success" class="text-sm font-medium text-primary">{{ success }}</div>
    <div class="flex">
      <UIButton type="button" :disabled="loading" @click="handleSubmit">
        <span v-if="loading" class="flex items-center">
          <span class="mr-2">Создаём...</span>
          <UISpinner class="h-4 w-4" />
        </span>
        <span v-else>Создать курс</span>
      </UIButton>
    </div>
  </div>
</template>
