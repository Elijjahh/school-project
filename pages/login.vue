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
  <section class="grid grid-cols-[1fr_1.3fr] md:grid-cols-1">
    <div class="bg-purple-50 flex items-end md:hidden">
      <div class="aspect-square">
        <img src="/assets/images/login-img.png" alt="" class="h-full w-full object-contain" />
      </div>
    </div>
    <div class="p-[14vw_15.6vw_14vw_6.9vw] xl:p-[14vw_6.9vw]">
      <h1 class="text-gray-900 text-4xl font-semibold leading-[48px] tracking-tight text-center">
        Войдите в ваш аккаунт
      </h1>
      <form class="mt-10" @submit.prevent="onSubmit">
        <div class="flex flex-col gap-4.5">
          <div class="flex flex-col gap-1.5">
            <label :for="emailInputId" class="text-gray-900 text-sm leading-[22px] tracking-tight">
              Email
            </label>
            <UIInput
              :id="emailInputId"
              v-model="email"
              :class="{ 'border-red-500': errors.email }"
              placeholder="Email"
            />
            <p v-if="errors.email" class="text-red-500 text-sm leading-[22px]">
              {{ errors.email }}
            </p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              :for="passwordInputId"
              class="text-gray-900 text-sm leading-[22px] tracking-tight"
            >
              Пароль
            </label>
            <UIInput
              :id="passwordInputId"
              v-model="password"
              type="password"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Пароль"
            />
            <p v-if="errors.password" class="text-red-500 text-sm leading-[22px]">
              {{ errors.password }}
            </p>
          </div>
        </div>

        <p v-if="error" class="text-red-500 text-sm leading-[22px] mt-4">{{ error }}</p>

        <UIButton type="submit" size="lg" class="w-full mt-6">
          {{ loading ? 'Входим...' : 'Войти' }}
        </UIButton>
      </form>
    </div>
  </section>
</template>
