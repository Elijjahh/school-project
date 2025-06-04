<script setup lang="ts">
interface ApplicationWithUser {
  id: number;
  userId: number;
  motivation: string;
  experience: string | null;
  education: string | null;
  status: 'pending' | 'approved' | 'rejected' | null;
  adminComment: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    firstname: string;
    lastname: string;
    image: string | null;
    bio: string | null;
  };
}

definePageMeta({
  layout: 'admin',
});

const { data: applicationsData, refresh } = await useFetch('/api/teacher-applications');

const isProcessing = ref(false);
const selectedApplication = ref<ApplicationWithUser | null>(null);
const showModal = ref(false);
const adminComment = ref('');
const selectedAction = ref<'approved' | 'rejected'>('approved');

const applications = computed(() => applicationsData.value?.applications || []);

// Фильтрация заявок по статусу
const filterStatus = ref<'all' | 'pending' | 'approved' | 'rejected'>('all');

const filteredApplications = computed(() => {
  if (filterStatus.value === 'all') return applications.value;
  return applications.value.filter((app) => app.status === filterStatus.value);
});

// Статистика
const stats = computed(() => {
  const total = applications.value.length;
  const pending = applications.value.filter((app) => app.status === 'pending').length;
  const approved = applications.value.filter((app) => app.status === 'approved').length;
  const rejected = applications.value.filter((app) => app.status === 'rejected').length;

  return { total, pending, approved, rejected };
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'approved':
      return 'bg-gray-900 text-white border-gray-900';
    case 'rejected':
      return 'bg-gray-200 text-gray-900 border-gray-400';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'На рассмотрении';
    case 'approved':
      return 'Одобрено';
    case 'rejected':
      return 'Отклонено';
    default:
      return status;
  }
};

const openModal = (application: ApplicationWithUser, action: 'approved' | 'rejected') => {
  selectedApplication.value = application;
  selectedAction.value = action;
  adminComment.value = '';
  showModal.value = true;
};

const processApplication = async () => {
  if (!selectedApplication.value) return;

  isProcessing.value = true;

  try {
    await $fetch(`/api/teacher-applications/${selectedApplication.value.id}`, {
      method: 'PATCH',
      body: {
        status: selectedAction.value,
        adminComment: adminComment.value || undefined,
      },
    });

    await refresh();
    showModal.value = false;
    selectedApplication.value = null;
  } catch (error) {
    console.error('Error processing application:', error);
  } finally {
    isProcessing.value = false;
  }
};

useSeoMeta({
  title: 'Управление заявками преподавателей',
  description: 'Админ панель для рассмотрения заявок на роль преподавателя',
});
</script>

<template>
  <div class="space-y-8">
    <!-- Статистика -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="lucide:users" class="h-8 w-8 text-gray-700" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Всего заявок</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="lucide:clock" class="h-8 w-8 text-gray-700" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">На рассмотрении</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="lucide:check-circle" class="h-8 w-8 text-gray-700" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Одобрено</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="lucide:x-circle" class="h-8 w-8 text-gray-700" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Отклонено</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <Icon name="lucide:filter" class="h-5 w-5 text-gray-500" />
          <span class="text-sm font-medium text-gray-700">Фильтр по статусу:</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            @click="filterStatus = 'all'"
            :class="[
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              filterStatus === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            Все ({{ stats.total }})
          </button>
          <button
            @click="filterStatus = 'pending'"
            :class="[
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              filterStatus === 'pending'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            На рассмотрении ({{ stats.pending }})
          </button>
          <button
            @click="filterStatus = 'approved'"
            :class="[
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              filterStatus === 'approved'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            Одобрено ({{ stats.approved }})
          </button>
          <button
            @click="filterStatus = 'rejected'"
            :class="[
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              filterStatus === 'rejected'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            Отклонено ({{ stats.rejected }})
          </button>
        </div>
      </div>
    </div>

    <!-- Список заявок -->
    <div
      v-if="filteredApplications.length === 0"
      class="rounded-lg border border-gray-300 bg-white p-12 text-center shadow-sm"
    >
      <Icon name="lucide:inbox" class="mx-auto h-16 w-16 text-gray-400" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">
        {{
          filterStatus === 'all'
            ? 'Нет заявок'
            : `Нет заявок со статусом "${getStatusText(filterStatus)}"`
        }}
      </h3>
      <p class="mt-2 text-sm text-gray-500">
        {{
          filterStatus === 'all'
            ? 'Пока нет заявок на роль преподавателя.'
            : 'Попробуйте изменить фильтр.'
        }}
      </p>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="application in filteredApplications"
        :key="application.id"
        class="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="p-6">
          <!-- Заголовок карточки -->
          <div class="mb-6 flex items-start justify-between">
            <div class="flex items-center space-x-4">
              <UIAvatar class="h-16 w-16 shadow-lg ring-4 ring-white">
                <UIAvatarImage
                  v-if="application.user.image"
                  :src="application.user.image"
                  :alt="`${application.user.firstname} ${application.user.lastname}`"
                />
                <UIAvatarFallback class="bg-gray-600 text-lg font-semibold text-white">
                  {{ application.user.firstname[0] }}{{ application.user.lastname[0] }}
                </UIAvatarFallback>
              </UIAvatar>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ application.user.firstname }} {{ application.user.lastname }}
                </h3>
                <p class="text-sm text-gray-500">@{{ application.user.username }}</p>
                <p class="text-sm font-medium text-gray-700">{{ application.user.email }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span
                class="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium"
                :class="getStatusColor(application.status || 'pending')"
              >
                {{ getStatusText(application.status || 'pending') }}
              </span>
              <span class="text-sm text-gray-500">
                {{
                  application.createdAt
                    ? new Date(application.createdAt).toLocaleDateString('ru-RU')
                    : ''
                }}
              </span>
            </div>
          </div>

          <!-- Контент заявки -->
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="rounded-lg bg-gray-50 p-4">
              <h4 class="mb-3 flex items-center text-sm font-semibold text-gray-800">
                <Icon name="lucide:heart" class="mr-2 h-4 w-4 text-gray-600" />
                Мотивация
              </h4>
              <p class="text-sm leading-relaxed text-gray-700">{{ application.motivation }}</p>
            </div>

            <div v-if="application.experience" class="rounded-lg bg-gray-50 p-4">
              <h4 class="mb-3 flex items-center text-sm font-semibold text-gray-800">
                <Icon name="lucide:briefcase" class="mr-2 h-4 w-4 text-gray-600" />
                Опыт работы
              </h4>
              <p class="text-sm leading-relaxed text-gray-700">{{ application.experience }}</p>
            </div>

            <div v-if="application.education" class="rounded-lg bg-gray-50 p-4">
              <h4 class="mb-3 flex items-center text-sm font-semibold text-gray-800">
                <Icon name="lucide:graduation-cap" class="mr-2 h-4 w-4 text-gray-600" />
                Образование
              </h4>
              <p class="text-sm leading-relaxed text-gray-700">{{ application.education }}</p>
            </div>
          </div>

          <!-- Комментарий администратора -->
          <div
            v-if="application.adminComment"
            class="mt-6 rounded-lg border border-gray-300 bg-gray-50 p-4"
          >
            <h4 class="mb-2 flex items-center text-sm font-semibold text-gray-800">
              <Icon name="lucide:message-square" class="mr-2 h-4 w-4 text-gray-600" />
              Комментарий администратора
            </h4>
            <p class="text-sm text-gray-700">{{ application.adminComment }}</p>
          </div>

          <!-- Кнопки действий -->
          <div v-if="application.status === 'pending'" class="mt-6 flex justify-end space-x-3">
            <UIButton
              variant="outline"
              @click="openModal(application, 'approved')"
              class="border-gray-600 text-gray-700 hover:bg-gray-50"
            >
              <Icon name="lucide:check" class="mr-2 h-4 w-4" />
              Одобрить
            </UIButton>
            <UIButton
              variant="outline"
              @click="openModal(application, 'rejected')"
              class="border-gray-600 text-gray-700 hover:bg-gray-50"
            >
              <Icon name="lucide:x" class="mr-2 h-4 w-4" />
              Отклонить
            </UIButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal для подтверждения действия -->
    <div
      v-if="showModal"
      class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm"
    >
      <div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <h3 class="mb-4 text-xl font-semibold">
          {{ selectedAction === 'approved' ? 'Одобрить заявку' : 'Отклонить заявку' }}
        </h3>

        <div v-if="selectedApplication" class="mb-4 rounded-lg bg-gray-50 p-4">
          <p class="text-sm text-gray-600">
            <strong>Заявка от:</strong> {{ selectedApplication.user.firstname }}
            {{ selectedApplication.user.lastname }}
          </p>
          <p class="text-sm text-gray-600">
            <strong>Email:</strong> {{ selectedApplication.user.email }}
          </p>
        </div>

        <div class="mb-6">
          <label for="adminComment" class="mb-2 block text-sm font-medium text-gray-700">
            Комментарий {{ selectedAction === 'approved' ? '(необязательно)' : '(рекомендуется)' }}
          </label>
          <UITextarea
            id="adminComment"
            v-model="adminComment"
            placeholder="Добавьте комментарий к решению..."
            rows="4"
            class="resize-none"
          />
        </div>

        <div class="flex justify-end space-x-3">
          <UIButton variant="outline" @click="showModal = false" :disabled="isProcessing">
            Отмена
          </UIButton>
          <UIButton
            @click="processApplication"
            :disabled="isProcessing"
            class="bg-gray-900 hover:bg-gray-800"
          >
            <UISpinner v-if="isProcessing" class="mr-2 h-4 w-4" />
            {{ selectedAction === 'approved' ? 'Одобрить' : 'Отклонить' }}
          </UIButton>
        </div>
      </div>
    </div>
  </div>
</template>
