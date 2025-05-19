<script setup lang="ts">
import { Mail, Book, Check } from 'lucide-vue-next';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';

const validationSchema = toTypedSchema(
  zod.object({
    name: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' }),
    email: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' })
      .email('Введите корректную почту'),
    experience: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' }),
    courseIdea: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' }),
  }),
);

const { handleSubmit, errors } = useForm({
  validationSchema,
});

const nameInputId = useId();
const emailInputId = useId();
const experienceInputId = useId();
const courseIdeaInputId = useId();

const { value: name } = useField<string>('name');
const { value: email } = useField<string>('email');
const { value: experience } = useField<string>('experience');
const { value: courseIdea } = useField<string>('courseIdea');

const steps = [
  {
    title: 'Заполните заявку',
    description: 'Расскажите о себе и своем опыте преподавания',
    icon: Mail,
  },
  {
    title: 'Подготовьте курс',
    description: 'Разработайте программу и материалы для вашего курса',
    icon: Book,
  },
  {
    title: 'Начните преподавать',
    description: 'После одобрения заявки вы сможете начать вести курс',
    icon: Check,
  },
];

const loading = ref(false);
const error = ref('');
const success = ref('');

const onSubmit = handleSubmit(async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    // TODO: Implement form submission
    console.log('Form submitted:', { name, email, experience, courseIdea });
    success.value = 'Заявка успешно отправлена';
  } catch {
    error.value = 'Ошибка при отправке заявки';
  }

  loading.value = false;
});
</script>

<template>
  <div class="bg-background flex min-h-screen items-center justify-center">
    <div class="mx-auto w-full max-w-4xl space-y-8 p-8">
      <div class="space-y-4 text-center">
        <h1 class="text-4xl font-bold tracking-tight">Стать преподавателем</h1>
        <p class="text-muted-foreground mx-auto max-w-2xl text-xl">
          Поделитесь своими знаниями и опытом с тысячами студентов
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <UICard v-for="step in steps" :key="step.title" class="p-6">
          <div class="space-y-4">
            <component :is="step.icon" class="text-primary h-12 w-12" />
            <h3 class="text-xl font-semibold">{{ step.title }}</h3>
            <p class="text-muted-foreground">{{ step.description }}</p>
          </div>
        </UICard>
      </div>

      <UICard class="p-6">
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div class="space-y-2">
            <FormInput
              :id="nameInputId"
              v-model="name"
              label="Ваше имя"
              placeholder="Иван Иванов"
              :error="errors.name"
            />
          </div>

          <div class="space-y-2">
            <FormInput
              :id="emailInputId"
              v-model="email"
              label="Email"
              placeholder="name@example.com"
              :error="errors.email"
            />
          </div>

          <div class="space-y-2">
            <FormInput
              :id="experienceInputId"
              v-model="experience"
              label="Опыт преподавания"
              type="textarea"
              placeholder="Расскажите о вашем опыте преподавания"
              :error="errors.experience"
            />
          </div>

          <div class="space-y-2">
            <FormInput
              :id="courseIdeaInputId"
              v-model="courseIdea"
              label="Идея курса"
              type="textarea"
              placeholder="Опишите идею вашего курса"
              :error="errors.courseIdea"
            />
          </div>

          <div v-if="error" class="text-destructive text-sm font-medium">
            {{ error }}
          </div>

          <div v-if="success" class="text-sm font-medium text-green-600">
            {{ success }}
          </div>

          <UIButton type="submit" class="w-full" :disabled="loading">
            <span v-if="loading" class="flex items-center justify-center">
              <span class="mr-2">Отправляем...</span>
              <span
                class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            </span>
            <span v-else>Отправить заявку</span>
          </UIButton>
        </form>
      </UICard>
    </div>
  </div>
</template>
