<script setup lang="ts">
import { useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';

interface Course {
  id: number;
  title: string;
  description: string;
  image: string | null;
  category: { id: number; name: string };
}

const props = defineProps<{
  course: Course;
  categories: { id: number; name: string }[];
  loading: boolean;
  categoriesLoading: boolean;
  categoriesError: string;
}>();

const emit = defineEmits<{
  save: [value: { title: string; description: string; image: string; categoryId: number }];
}>();

const editing = ref(false);

// Zod schemas for each field
const titleSchema = toTypedSchema(zod.string().min(1, 'Название обязательно'));
const descriptionSchema = toTypedSchema(zod.string().min(1, 'Описание обязательно'));
const categoryIdSchema = toTypedSchema(zod.number().min(1, 'Категория обязательна'));
// No validation for image (string) here, but you can add if needed

// useField for each field
const {
  value: title,
  errorMessage: titleError,
  setValue: setTitle,
} = useField('title', titleSchema, { initialValue: '' });

const {
  value: description,
  errorMessage: descriptionError,
  setValue: setDescription,
} = useField('description', descriptionSchema, { initialValue: '' });

const { value: image, setValue: setImage } = useField('image', undefined, { initialValue: '' });

const {
  value: categoryId,
  errorMessage: categoryIdError,
  setValue: setCategoryId,
} = useField('categoryId', categoryIdSchema, { initialValue: 0 });

const imagePreview = ref<string | null>(null);

onMounted(() => {
  setTitle((props.course.title as string) || '');
  setDescription((props.course.description as string) || '');
  setImage((props.course.image as string) || '');
  setCategoryId(props.course.category.id || 0);
  imagePreview.value = (props.course.image as string) || null;
});

const onImageUrlChange = (url: string) => {
  setImage(url);
  imagePreview.value = url;
};

const saveLoading = ref(false);
const saveError = ref('');

async function handleSave() {
  saveError.value = '';
  const errors = [titleError.value, descriptionError.value, categoryIdError.value].filter(Boolean);
  if (errors.length > 0) {
    saveError.value = errors[0] as string;
    return;
  }
  emit('save', {
    title: title.value,
    description: description.value,
    image: image.value,
    categoryId: categoryId.value,
  });
  editing.value = false;
}
</script>
<template>
  <UICard class="max-w-2xl">
    <UICardHeader>
      <UICardTitle>Информация о курсе</UICardTitle>
      <UICardDescription>Основные сведения для будущих студентов</UICardDescription>
    </UICardHeader>
    <UICardContent>
      <div class="space-y-4">
        <div v-if="!editing">
          <div class="mb-2">
            <div class="font-semibold">Название курса</div>
            <div>{{ title }}</div>
          </div>
          <div class="mb-2">
            <div class="font-semibold">Описание</div>
            <div>{{ description }}</div>
          </div>
          <div class="mb-2">
            <div class="font-semibold">Категория</div>
            <div>{{ props.categories.find((cat) => cat.id === categoryId)?.name || '—' }}</div>
          </div>
          <div class="mb-2">
            <div class="font-semibold">Изображение</div>
            <img
              v-if="imagePreview || image"
              :src="imagePreview || image"
              alt="Course image"
              class="h-24 w-24 rounded object-cover"
            />
          </div>
          <UIButton type="button" @click="editing = true">Редактировать</UIButton>
        </div>
        <div v-else class="space-y-4">
          <FormInput
            id="course-title"
            v-model="title"
            label="Название курса"
            placeholder="Введите название"
            :error="titleError"
          />
          <UITextarea
            v-model="description"
            label="Описание"
            placeholder="Краткое описание"
            rows="3"
            :class="{
              'border-destructive focus-visible:ring-destructive': descriptionError,
            }"
          />
          <div v-if="descriptionError" class="text-destructive text-sm font-medium">
            {{ descriptionError }}
          </div>
          <CourseImageUpload :initial-url="imagePreview || image" @change="onImageUrlChange" />
          <div>
            <div v-if="props.categoriesLoading" class="text-muted-foreground text-sm">
              Загрузка категорий...
            </div>
            <div v-else-if="props.categoriesError" class="text-destructive text-sm">
              {{ props.categoriesError }}
            </div>
            <div v-else>
              <UISelect v-model="categoryId">
                <UISelectTrigger
                  :class="[
                    'w-full',
                    {
                      'border-destructive focus-visible:ring-destructive': categoryIdError,
                    },
                  ]"
                >
                  <UISelectValue :placeholder="'Выберите категорию'">
                    {{
                      props.categories.find((cat) => cat.id === categoryId)?.name ||
                      'Выберите категорию'
                    }}
                  </UISelectValue>
                </UISelectTrigger>
                <UISelectContent>
                  <UISelectGroup>
                    <UISelectLabel>Категории</UISelectLabel>
                    <UISelectItem v-for="cat in props.categories" :key="cat.id" :value="cat.id">{{
                      cat.name
                    }}</UISelectItem>
                  </UISelectGroup>
                </UISelectContent>
              </UISelect>
              <div v-if="categoryIdError" class="text-destructive mt-1 text-sm font-medium">
                {{ categoryIdError }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UICardContent>
    <UICardFooter v-if="editing">
      <UIButton type="button" :disabled="saveLoading" @click="handleSave">
        <span v-if="saveLoading" class="flex items-center"
          ><span class="mr-2">Сохраняем...</span
          ><span
            class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        /></span>
        <span v-else>Сохранить курс</span>
      </UIButton>
      <span v-if="saveError" class="text-destructive ml-4 text-sm font-medium">{{
        saveError
      }}</span>
    </UICardFooter>
  </UICard>
</template>
