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
  <AuthFormLayout title="Войдите в ваш аккаунт">
    <form class="mt-10" @submit.prevent="onSubmit">
      <div class="flex flex-col gap-4.5">
        <FormInput
          :id="emailInputId"
          v-model="email"
          label="Email"
          placeholder="Email"
          :error="errors.email"
        />

        <FormInput
          :id="passwordInputId"
          v-model="password"
          label="Пароль"
          type="password"
          placeholder="Пароль"
          :error="errors.password"
        />
      </div>

      <p v-if="error" class="text-red-500 text-sm leading-[22px] mt-4">{{ error }}</p>

      <UIButton type="submit" size="lg" class="w-full mt-6">
        {{ loading ? 'Входим...' : 'Войти' }}
      </UIButton>
    </form>
  </AuthFormLayout>
</template>
