<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { NuxtError } from '#app';

const { user } = useUserSession();

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
  }),
);

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema,
  initialValues: {
    lastname: user.value?.lastname || '',
    firstname: user.value?.firstname || '',
    username: user.value?.username || '',
    email: user.value?.email || '',
  },
});

// Reset form when user data changes
watch(user, (newUser) => {
  if (newUser) {
    resetForm({
      values: {
        lastname: newUser.lastname || '',
        firstname: newUser.firstname || '',
        username: newUser.username || '',
        email: newUser.email || '',
      },
    });
  }
});

const lastnameInputId = useId();
const firstnameInputId = useId();
const usernameInputId = useId();
const emailInputId = useId();

const { value: lastname } = useField<string>('lastname');
const { value: firstname } = useField<string>('firstname');
const { value: username } = useField<string>('username');
const { value: email } = useField<string>('email');

const onSubmit = handleSubmit(() => {
  submitForm();
});

const loading = ref(false);
const error = ref('');
const success = ref('');

const { fetch: fetchUserSession } = useUserSession();

async function submitForm() {
  const submitData = {
    lastname: lastname.value,
    firstname: firstname.value,
    username: username.value,
    email: email.value,
  };

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await $fetch('/api/auth/users/me', {
      method: 'PATCH',
      body: submitData,
    });

    await fetchUserSession();
    success.value = 'Профиль успешно обновлен';
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
  <div class="max-w-2xl mx-auto">
    <h2 class="text-2xl font-semibold mb-6">Настройки профиля</h2>
    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="onSubmit">
        <div class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <FormInput
              :id="lastnameInputId"
              v-model="lastname"
              label="Фамилия"
              placeholder="Фамилия"
              :error="errors.lastname"
            />
            <FormInput
              :id="firstnameInputId"
              v-model="firstname"
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
        </div>

        <p v-if="error" class="text-red-500 text-sm leading-[22px] mt-4">{{ error }}</p>
        <p v-if="success" class="text-green-500 text-sm leading-[22px] mt-4">{{ success }}</p>

        <UIButton type="submit" size="lg" class="w-full mt-6">
          {{ loading ? 'Сохраняем...' : 'Сохранить изменения' }}
        </UIButton>
      </form>
    </div>
  </div>
</template>
