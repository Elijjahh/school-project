<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { NuxtError } from '#app';
import { Settings } from 'lucide-vue-next';

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

const router = useRouter();
const { clear } = useUserSession();

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

async function handleLogout() {
  await clear();
  router.push('/login');
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Настройки</h2>
      <p class="text-muted-foreground">Управляйте настройками вашего профиля</p>
    </div>

    <UICard>
      <UICardHeader>
        <UICardTitle>Профиль</UICardTitle>
        <UICardDescription> Обновите информацию о вашем профиле </UICardDescription>
      </UICardHeader>
      <UICardContent>
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div class="grid gap-4 md:grid-cols-2">
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
                :id="firstnameInputId"
                v-model="firstname"
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

          <div v-if="error" class="text-sm font-medium text-destructive">
            {{ error }}
          </div>
          <div v-if="success" class="text-sm font-medium text-primary">
            {{ success }}
          </div>

          <div class="flex justify-end">
            <UIButton type="submit" :disabled="loading">
              <span v-if="loading" class="flex items-center">
                <span class="mr-2">Сохраняем...</span>
                <span
                  class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
              </span>
              <span v-else class="flex items-center">
                <Settings class="mr-2 h-4 w-4" />
                Сохранить изменения
              </span>
            </UIButton>
          </div>
        </form>
      </UICardContent>
    </UICard>

    <UICard class="mb-8">
      <UICardHeader>
        <UICardTitle>Выход из аккаунта</UICardTitle>
        <UICardDescription>Выйти из вашего аккаунта на этом устройстве</UICardDescription>
      </UICardHeader>
      <UICardContent>
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground">
              При выходе вам потребуется повторно войти в аккаунт для доступа к вашим курсам и
              прогрессу
            </p>
          </div>
          <UIButton variant="destructive" @click="handleLogout"> Выйти </UIButton>
        </div>
      </UICardContent>
    </UICard>
  </div>
</template>
