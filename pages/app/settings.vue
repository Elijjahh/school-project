<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { NuxtError } from '#app';
import { Settings } from 'lucide-vue-next';
import type { TeacherApplication } from '~/drizzle/types';

definePageMeta({
  layout: 'profile',
});

const { user } = useUserSession();

// Получаем информацию о заявке пользователя
const { data: applicationData } = await useFetch('/api/teacher-applications/my', {
  server: false,
});

const application = computed(() => applicationData.value as TeacherApplication | null);

// Функция для получения текста статуса
const getStatusText = (status: string | null) => {
  switch (status) {
    case 'pending':
      return 'На рассмотрении';
    case 'approved':
      return 'Одобрено';
    case 'rejected':
      return 'Отклонено';
    default:
      return 'Неизвестно';
  }
};

// Функция для получения цвета статуса
const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'approved':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'rejected':
      return 'bg-red-50 border-red-200 text-red-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

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
              <ImagePlaceholder v-else class="h-full w-full rounded-full" />
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

    <!-- Карточка для подачи заявки на роль преподавателя (только для студентов) -->
    <UICard v-if="user?.role === 'student'" class="mb-8">
      <UICardHeader>
        <UICardTitle>Стать преподавателем</UICardTitle>
        <UICardDescription>
          <span v-if="!application">
            Подайте заявку на получение роли преподавателя на нашей платформе
          </span>
          <span v-else> Информация о вашей заявке на роль преподавателя </span>
        </UICardDescription>
      </UICardHeader>
      <UICardContent>
        <!-- Если заявка не подана -->
        <div v-if="!application" class="flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-muted-foreground text-sm">
              Если у вас есть опыт и знания, которыми вы хотите поделиться, станьте преподавателем и
              создавайте собственные курсы
            </p>
          </div>
          <UIButton @click="navigateTo('/app/apply-teacher')"> Подать заявку </UIButton>
        </div>

        <!-- Если заявка подана -->
        <div v-else class="space-y-4">
          <div class="rounded-lg border p-4" :class="getStatusColor(application.status)">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">
                  Статус заявки: {{ getStatusText(application.status) }}
                </h3>
                <p class="mt-1 text-sm">
                  Подана:
                  {{
                    application.createdAt
                      ? new Date(application.createdAt).toLocaleDateString('ru-RU')
                      : ''
                  }}
                </p>
              </div>
              <div class="text-right">
                <Icon
                  :name="
                    application.status === 'approved'
                      ? 'lucide:check-circle'
                      : application.status === 'rejected'
                        ? 'lucide:x-circle'
                        : 'lucide:clock'
                  "
                  class="h-6 w-6"
                />
              </div>
            </div>
          </div>

          <!-- Комментарий администратора если есть -->
          <div v-if="application.adminComment" class="rounded-lg bg-gray-50 p-4">
            <h4 class="mb-2 font-medium text-gray-900">Комментарий администратора:</h4>
            <p class="text-sm text-gray-700">{{ application.adminComment }}</p>
          </div>

          <!-- Информация о заявке -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 class="mb-1 font-medium text-gray-900">Мотивация:</h4>
              <p class="text-sm text-gray-600">{{ application.motivation }}</p>
            </div>
            <div v-if="application.experience">
              <h4 class="mb-1 font-medium text-gray-900">Опыт:</h4>
              <p class="text-sm text-gray-600">{{ application.experience }}</p>
            </div>
            <div v-if="application.education" class="md:col-span-2">
              <h4 class="mb-1 font-medium text-gray-900">Образование:</h4>
              <p class="text-sm text-gray-600">{{ application.education }}</p>
            </div>
          </div>

          <!-- Кнопка для повторной подачи заявки если отклонена -->
          <div v-if="application.status === 'rejected'" class="border-t pt-4">
            <UIButton @click="navigateTo('/app/apply-teacher')" variant="outline">
              Подать новую заявку
            </UIButton>
          </div>
        </div>
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
