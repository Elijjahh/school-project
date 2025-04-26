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
  <section class="grid grid-cols-[1fr_1.3fr] md:grid-cols-1">
    <div class="bg-purple-50 flex items-end md:hidden">
      <div class="aspect-square">
        <img src="/assets/images/register-img.png" alt="" class="h-full w-full object-contain" />
      </div>
    </div>
    <div class="p-[14vw_15.6vw_14vw_6.9vw] xl:p-[14vw_6.9vw]">
      <h1 class="text-gray-900 text-4xl font-semibold leading-[48px] tracking-tight text-center">
        Создайте аккаунт
      </h1>
      <form class="mt-10" @submit.prevent="onSubmit">
        <div class="flex flex-col gap-4.5">
          <div class="flex flex-col gap-1.5">
            <label
              :for="lastnameInputId"
              class="text-gray-900 text-sm leading-[22px] tracking-tight"
            >
              Ваше полное имя
            </label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <UIInput
                  :id="lastnameInputId"
                  v-model="lastname"
                  :class="{ 'border-red-500': errors.lastname }"
                  placeholder="Фамилия"
                />
                <p v-if="errors.lastname" class="text-red-500 text-sm leading-[22px] mt-1.5">
                  {{ errors.lastname }}
                </p>
              </div>
              <div>
                <UIInput
                  v-model="firstname"
                  :class="{ 'border-red-500': errors.firstname }"
                  placeholder="Имя"
                />
                <p v-if="errors.firstname" class="text-red-500 text-sm leading-[22px] mt-1.5">
                  {{ errors.firstname }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              :for="usernameInputId"
              class="text-gray-900 text-sm leading-[22px] tracking-tight"
            >
              Имя пользователя
            </label>
            <UIInput
              :id="usernameInputId"
              v-model="username"
              :class="{ 'border-red-500': errors.username }"
              placeholder="Имя пользователя"
            />
            <p v-if="errors.username" class="text-red-500 text-sm leading-[22px]">
              {{ errors.username }}
            </p>
          </div>

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

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label
                :for="passwordInputId"
                class="text-gray-900 text-sm leading-[22px] tracking-tight"
              >
                Создайте пароль
              </label>
              <UIInput
                :id="passwordInputId"
                v-model="password"
                type="password"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Создайте пароль"
              />
              <p v-if="errors.password" class="text-red-500 text-sm leading-[22px]">
                {{ errors.password }}
              </p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label
                :for="confirmPasswordInputId"
                class="text-gray-900 text-sm leading-[22px] tracking-tight"
              >
                Повторите пароль
              </label>
              <UIInput
                :id="confirmPasswordInputId"
                v-model="confirmPassword"
                type="password"
                :class="{ 'border-red-500': errors.confirmPassword }"
                placeholder="Повторите пароль"
              />
              <p v-if="errors.confirmPassword" class="text-red-500 text-sm leading-[22px]">
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>
        </div>

        <p v-if="error" class="text-red-500 text-sm leading-[22px] mt-4">{{ error }}</p>

        <UIButton type="submit" size="lg" class="w-full mt-6">
          {{ loading ? 'Создаем...' : 'Создать аккаунт' }}
        </UIButton>
      </form>
    </div>
  </section>
</template>
