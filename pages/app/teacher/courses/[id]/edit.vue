<script setup lang="ts">
import { useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import { ref, onMounted } from 'vue';
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

// --- Modules & Lessons ---
interface Lesson {
  title: string;
  content: string;
}
interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
}
const modules = ref<Module[]>([]);

function addModule() {
  modules.value.push({ title: '', description: '', lessons: [] });
}
function removeModule(idx: number) {
  modules.value.splice(idx, 1);
}
function addLesson(moduleIdx: number) {
  modules.value[moduleIdx].lessons.push({ title: '', content: '' });
}
function removeLesson(moduleIdx: number, lessonIdx: number) {
  modules.value[moduleIdx].lessons.splice(lessonIdx, 1);
}

// --- Submission ---
const loading = ref(false);
const error = ref('');
const success = ref('');

// --- Categories (static for now, can be fetched later) ---
const categories = ref([
  { id: '1', label: 'Категория 1' },
  { id: '2', label: 'Категория 2' },
]);

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

// --- Load course data on mount ---
const courseLoading = ref(true);
const courseLoadError = ref('');
onMounted(async () => {
  courseLoading.value = true;
  courseLoadError.value = '';
  try {
    // TODO: Replace with real API call
    // const { data } = await $fetch(`/api/courses/${route.params.id}`);
    // Example mock:
    const data = {
      title: 'Мой курс',
      description: 'Описание курса',
      image: '',
      categoryId: '1',
      modules: [
        {
          title: 'Модуль 1',
          description: 'Описание модуля',
          lessons: [
            { title: 'Урок 1', content: '' },
            { title: 'Урок 2', content: '' },
          ],
        },
      ],
    };
    title.value = data.title;
    description.value = data.description;
    image.value = data.image;
    imagePreview.value = data.image;
    categoryId.value = data.categoryId;
    modules.value = data.modules;
  } catch {
    courseLoadError.value = 'Ошибка загрузки курса';
  } finally {
    courseLoading.value = false;
  }
});

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
  // TODO: Save changes to API
  setTimeout(() => {
    success.value = 'Курс успешно обновлен!';
    loading.value = false;
  }, 1000);
}
</script>

<template>
  <div class="space-y-8 mb-10">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Редактировать курс</h2>
      <p class="text-muted-foreground">Измените информацию о курсе, модулях и уроках</p>
    </div>
    <UICard class="max-w-2xl">
      <UICardHeader>
        <UICardTitle>Информация о курсе</UICardTitle>
        <UICardDescription>Основные сведения для будущих студентов</UICardDescription>
      </UICardHeader>
      <UICardContent>
        <div v-if="courseLoading" class="py-8 text-center text-muted-foreground">Загрузка...</div>
        <div v-else-if="courseLoadError" class="py-8 text-center text-destructive">
          {{ courseLoadError }}
        </div>
        <div v-else class="space-y-4">
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
              :error="descriptionError"
              rows="3"
            />
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
            <UISelect v-model="categoryId">
              <UISelectTrigger class="w-full">
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
      </UICardContent>
    </UICard>

    <UICard class="max-w-2xl">
      <UICardHeader>
        <UICardTitle>Модули</UICardTitle>
        <UICardDescription>Добавьте модули и уроки для курса</UICardDescription>
      </UICardHeader>
      <UICardContent>
        <div v-if="courseLoading" class="py-8 text-center text-muted-foreground">Загрузка...</div>
        <div v-else-if="courseLoadError" class="py-8 text-center text-destructive">
          {{ courseLoadError }}
        </div>
        <div v-else class="space-y-6">
          <div v-for="(module, mIdx) in modules" :key="mIdx" class="border rounded p-4 mb-4">
            <div class="flex gap-2 items-end mb-2">
              <FormInput
                :id="`module-${mIdx}-title`"
                v-model="module.title"
                label="Название модуля"
                placeholder="Название"
              />
              <UIButton type="button" variant="outline" @click="removeModule(mIdx)">
                Удалить
              </UIButton>
            </div>
            <div class="mb-2">
              <UITextarea
                v-model="module.description"
                label="Описание модуля"
                placeholder="Описание"
                rows="2"
              />
            </div>
            <div>
              <div class="font-medium mb-1">Уроки</div>
              <div
                v-for="(lesson, lIdx) in module.lessons"
                :key="lIdx"
                class="flex gap-2 items-end mb-2"
              >
                <FormInput
                  :id="`module-${mIdx}-lesson-${lIdx}-title`"
                  v-model="lesson.title"
                  label="Название урока"
                  placeholder="Название урока"
                />
                <UIButton type="button" variant="outline" @click="removeLesson(mIdx, lIdx)">
                  Удалить
                </UIButton>
              </div>
              <UIButton type="button" variant="secondary" @click="addLesson(mIdx)">
                Добавить урок
              </UIButton>
            </div>
          </div>
          <UIButton type="button" variant="secondary" @click="addModule">
            Добавить модуль
          </UIButton>
        </div>
      </UICardContent>
    </UICard>

    <div v-if="error" class="text-sm font-medium text-destructive">{{ error }}</div>
    <div v-if="success" class="text-sm font-medium text-primary">{{ success }}</div>
    <div class="flex">
      <UIButton type="button" :disabled="loading" @click="handleSubmit">
        <span v-if="loading" class="flex items-center">
          <span class="mr-2">Сохраняем...</span>
          <UISpinner class="h-4 w-4" />
        </span>
        <span v-else>Сохранить изменения</span>
      </UIButton>
    </div>
  </div>
</template>
