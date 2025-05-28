<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { NuxtError } from '#app';
import { Settings } from 'lucide-vue-next';

const { user } = useUserSession();

definePageMeta({
  layout: 'profile',
});

// Определяем роль пользователя
const isTeacher = computed(() => user.value?.role === 'teacher');

// Создаем единую схему валидации с опциональным полем bio
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
    bio: zod
      .string()
      .optional()
      .refine(
        (val) => {
          // Для преподавателей bio обязательно
          if (isTeacher.value && (!val || val.trim().length === 0)) {
            return false;
          }
          return true;
        },
        { message: 'Это обязательное поле' },
      ),
  }),
);

const { handleSubmit, errors, setValues } = useForm({
  validationSchema,
  initialValues: {
    lastname: '',
    firstname: '',
    username: '',
    email: '',
    bio: '',
  },
});

// Initialize form with user data when component mounts
onMounted(() => {
  if (user.value) {
    setValues({
      lastname: user.value.lastname,
      firstname: user.value.firstname,
      username: user.value.username,
      email: user.value.email,
      bio: user.value.bio || '',
    });
  }
});

// Update form if user data changes after mount
watch(
  () => user.value,
  (newUser) => {
    if (newUser) {
      setValues({
        lastname: newUser.lastname,
        firstname: newUser.firstname,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio || '',
      });
    }
  },
);

const lastnameInputId = useId();
const firstnameInputId = useId();
const usernameInputId = useId();
const emailInputId = useId();
const bioInputId = useId();

const { value: lastname } = useField<string>('lastname');
const { value: firstname } = useField<string>('firstname');
const { value: username } = useField<string>('username');
const { value: email } = useField<string>('email');
const { value: bio } = useField<string>('bio');

const selectedImage = ref<File | null>(null);
const imagePreview = ref<string | null>(user.value?.image || null);
const fileInput = ref<HTMLInputElement | null>(null);
const imageLoading = ref(false);
const imageError = ref('');

const onImageChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    selectedImage.value = file;
    imagePreview.value = URL.createObjectURL(file);

    // Immediately upload the image
    imageLoading.value = true;
    imageError.value = '';

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await $fetch<{ url: string }>('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      // Update user profile with new image
      await $fetch(`/api/auth/users/${user.value?.id}`, {
        method: 'PATCH',
        body: { image: response.url },
      });

      // Refresh user session to get updated data
      await fetchUserSession();

      // Clear selected image since it's already uploaded
      selectedImage.value = null;
    } catch (err) {
      const statusCode = (err as NuxtError).statusCode;
      if (statusCode === 400)
        imageError.value = 'Некорректный формат файла или размер превышает 2MB';
      else imageError.value = 'Ошибка при загрузке изображения';

      // Revert preview on error
      imagePreview.value = user.value?.image || null;
    }

    imageLoading.value = false;
  }
};

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
  const submitData: {
    lastname: string;
    firstname: string;
    username: string;
    email: string;
    bio?: string;
    image?: string;
  } = {
    lastname: lastname.value,
    firstname: firstname.value,
    username: username.value,
    email: email.value,
  };

  // Добавляем bio только для преподавателей
  if (isTeacher.value && bio.value) {
    submitData.bio = bio.value;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    if (selectedImage.value) {
      const formData = new FormData();
      formData.append('file', selectedImage.value);

      const response = await $fetch<{ url: string }>('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      submitData.image = response.url;
    }

    await $fetch(`/api/auth/users/${user.value?.id}`, {
      method: 'PATCH',
      body: submitData,
    });

    await fetchUserSession();
    success.value = 'Профиль успешно обновлен';

    setValues({
      ...submitData,
    });
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
        <form class="space-y-6" @submit.prevent="onSubmit">
          <div class="flex items-center gap-4">
            <div class="relative h-24 w-24">
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Profile"
                class="h-full w-full rounded-full object-cover"
              />
              <div
                v-else
                class="bg-muted flex h-full w-full items-center justify-center rounded-full"
              >
                <span class="text-muted-foreground text-2xl font-medium">
                  {{ user?.firstname?.[0] }}{{ user?.lastname?.[0] }}
                </span>
              </div>
            </div>
            <div class="space-y-2">
              <UIButton
                type="button"
                variant="outline"
                :disabled="imageLoading"
                @click="fileInput?.click()"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onImageChange"
                />
                <span v-if="imageLoading" class="flex items-center">
                  <span class="mr-2">Загружаем...</span>
                  <span
                    class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  />
                </span>
                <span v-else>Изменить фото</span>
              </UIButton>
              <p class="text-muted-foreground text-sm">JPG, GIF или PNG. Максимальный размер 2MB</p>
              <p v-if="imageError" class="text-destructive text-sm font-medium">
                {{ imageError }}
              </p>
            </div>
          </div>

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

          <!-- Поле "О себе" только для преподавателей -->
          <div v-if="isTeacher" class="space-y-2">
            <UITextarea
              :id="bioInputId"
              v-model="bio"
              label="О себе"
              placeholder="Краткая информация о себе..."
              :error="errors.bio"
              rows="3"
              class="w-full rounded border px-3 py-2"
            />
          </div>

          <div v-if="error" class="text-destructive text-sm font-medium">
            {{ error }}
          </div>
          <div v-if="success" class="text-primary text-sm font-medium">
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
            <p class="text-muted-foreground text-sm">
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
