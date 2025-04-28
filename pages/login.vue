<script lang="ts" setup>
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { NuxtError } from '#app';

const validationSchema = toTypedSchema(
  zod.object({
    email: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' })
      .email('Введите корректную почту'),
    password: zod
      .string({ message: 'Это обязательное поле' })
      .min(8, { message: 'Длина пароля должна быть хотя бы 8 символов' }),
  }),
);

const { handleSubmit, errors } = useForm({
  validationSchema,
});

const emailInputId = useId();
const passwordInputId = useId();

const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');

const onSubmit = handleSubmit(() => {
  submitForm();
});

const loading = ref(false);
const error = ref('');

const { fetch: fetchUserSession } = useUserSession();
const router = useRouter();

async function submitForm() {
  const submitData = {
    email: email.value,
    password: password.value,
  };

  loading.value = true;
  error.value = '';

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: submitData,
    });

    await fetchUserSession();
    router.push('/');
  } catch (err) {
    const statusCode = (err as NuxtError).statusCode;

    if (statusCode == 400) error.value = 'Введите корректные данные';
    else if (statusCode == 404) error.value = 'Пользователь с такой почтой не найден';
    else if (statusCode == 401) error.value = 'Неверный пароль';
    else error.value = 'Ошибка на сервере';
  }

  loading.value = false;
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-md mx-auto p-8 space-y-6 bg-white rounded-lg shadow">
      <div class="flex flex-col space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">Войдите в ваш аккаунт</h1>
        <p class="text-sm text-muted-foreground">Введите ваши данные ниже, чтобы войти в аккаунт</p>
      </div>
      <form class="space-y-4" @submit.prevent="onSubmit">
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
            :id="passwordInputId"
            v-model="password"
            label="Пароль"
            type="password"
            placeholder="••••••••"
            :error="errors.password"
          />
        </div>
        <div v-if="error" class="text-sm font-medium text-destructive">
          {{ error }}
        </div>
        <UIButton type="submit" class="w-full" :disabled="loading">
          <span v-if="loading" class="flex items-center justify-center">
            <span class="mr-2">Входим...</span>
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          </span>
          <span v-else>Войти</span>
        </UIButton>
      </form>
      <p class="px-8 text-center text-sm text-muted-foreground">
        Нет аккаунта?
        <NuxtLink to="/register" class="underline underline-offset-4 hover:text-primary">
          Зарегистрироваться
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
