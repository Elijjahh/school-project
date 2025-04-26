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
  <AuthFormLayout title="Создайте аккаунт">
    <form class="mt-10" @submit.prevent="onSubmit">
      <div class="flex flex-col gap-4.5">
        <div class="grid grid-cols-2 gap-4">
          <FormInput
            :id="lastnameInputId"
            v-model="lastname"
            label="Фамилия"
            placeholder="Фамилия"
            :error="errors.lastname"
          />
          <FormInput
            v-model="firstname"
            :id="useId()"
            label="Имя"
            placeholder="Имя"
            :error="errors.firstname"
          />
        </div>

        <FormInput
          :id="usernameInputId"
          v-model="username"
          label="Имя пользователя"
          placeholder="Имя пользователя"
          :error="errors.username"
        />

        <FormInput
          :id="emailInputId"
          v-model="email"
          label="Email"
          placeholder="Email"
          :error="errors.email"
        />

        <div class="grid grid-cols-2 gap-4">
          <FormInput
            :id="passwordInputId"
            v-model="password"
            label="Создайте пароль"
            type="password"
            placeholder="Создайте пароль"
            :error="errors.password"
          />

          <FormInput
            :id="confirmPasswordInputId"
            v-model="confirmPassword"
            label="Повторите пароль"
            type="password"
            placeholder="Повторите пароль"
            :error="errors.confirmPassword"
          />
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm leading-[22px] mt-4">{{ error }}</p>

      <UIButton type="submit" size="lg" class="w-full mt-6">
        {{ loading ? 'Создаем...' : 'Создать аккаунт' }}
      </UIButton>
    </form>
  </AuthFormLayout>
</template>
