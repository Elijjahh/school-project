<script lang="ts" setup>
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { NuxtError } from '#app';

const validationSchema = toTypedSchema(
  zod.object({
    lastname: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' }),
    firstname: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' }),
    username: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' }),
    email: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' })
      .email('Введите корректную почту'),
    password: zod
      .string({ message: 'Это обязательное поле' })
      .min(8, { message: 'Длина пароля должна быть хотя бы 8 символов' })
      .refine((_passwordValue) => password.value === confirmPassword.value, {
        message: 'Пароли должны совпадать',
      }),
    confirmPassword: zod
      .string({ message: 'Это обязательное поле' })
      .min(8, { message: 'Длина пароля должна быть хотя бы 8 символов' })
      .refine((_passwordValue) => password.value === confirmPassword.value, {
        message: 'Пароли должны совпадать',
      }),
  }),
);

const { handleSubmit, errors } = useForm({
  validationSchema,
});

const lastnameInputId = useId();
const usernameInputId = useId();
const emailInputId = useId();
const passwordInputId = useId();
const confirmPasswordInputId = useId();

const { value: lastname } = useField<string>('lastname');
const { value: firstname } = useField<string>('firstname');
const { value: username } = useField<string>('username');
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const { value: confirmPassword } = useField<string>('confirmPassword');

const onSubmit = handleSubmit(() => {
  submitForm();
});

const loading = ref(false);
const error = ref('');

const { fetch: fetchUserSession } = useUserSession();
const router = useRouter();

async function submitForm() {
  const submitData = {
    lastname: lastname.value,
    firstname: firstname.value,
    username: username.value,
    email: email.value,
    password: password.value,
  };

  loading.value = true;
  error.value = '';

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: submitData,
    });

    await fetchUserSession();
    router.push('/');
  } catch (err) {
    const statusCode = (err as NuxtError).statusCode;

    if (statusCode == 400) error.value = 'Введите корректные данные';
    else if (statusCode == 409) error.value = 'Пользователь с такими данными уже существует';
    else error.value = 'Ошибка на сервере';
  }

  loading.value = false;
}
</script>

<template>
  <div class="bg-background flex min-h-screen items-center justify-center">
    <div class="mx-auto w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
      <div class="flex flex-col space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">Создайте аккаунт</h1>
        <p class="text-muted-foreground text-sm">Введите ваши данные ниже, чтобы создать аккаунт</p>
      </div>
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <FormInput
              :id="lastnameInputId"
              v-model="lastname"
              label="Фамилия"
              placeholder="Иванов"
              :error="errors.lastname"
            />
          </div>
          <div class="space-y-2">
            <FormInput
              v-model="firstname"
              :id="useId()"
              label="Имя"
              placeholder="Иван"
              :error="errors.firstname"
            />
          </div>
        </div>
        <div class="space-y-2">
          <FormInput
            :id="usernameInputId"
            v-model="username"
            label="Имя пользователя"
            placeholder="ivanov"
            :error="errors.username"
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
        <div class="grid grid-cols-2 gap-4">
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
          <div class="space-y-2">
            <FormInput
              :id="confirmPasswordInputId"
              v-model="confirmPassword"
              label="Подтвердите пароль"
              type="password"
              placeholder="••••••••"
              :error="errors.confirmPassword"
            />
          </div>
        </div>
        <div v-if="error" class="text-destructive text-sm font-medium">
          {{ error }}
        </div>
        <UIButton type="submit" class="w-full" :disabled="loading">
          <span v-if="loading" class="flex items-center justify-center">
            <span class="mr-2">Создаем...</span>
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          </span>
          <span v-else>Создать аккаунт</span>
        </UIButton>
      </form>
      <p class="text-muted-foreground px-8 text-center text-sm">
        Уже есть аккаунт?
        <NuxtLink to="/login" class="hover:text-primary underline underline-offset-4">
          Войти
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
