<template>
  <div
    v-if="alertState.show"
    class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm"
  >
    <div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
      <div class="mb-4 flex items-center space-x-3">
        <div :class="iconBgClass">
          <AppIcon :name="iconName" class="h-6 w-6" :class="iconClass" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ alertState.title || getDefaultTitle }}
        </h3>
      </div>

      <p class="mb-6 text-gray-600">{{ alertState.message }}</p>

      <div class="flex justify-end">
        <UIButton @click="handleAlertOk">
          {{ alertState.okText || 'ОК' }}
        </UIButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { alertState, handleAlertOk } = useModal();

const getDefaultTitle = computed(() => {
  switch (alertState.value.type) {
    case 'success':
      return 'Успех';
    case 'warning':
      return 'Предупреждение';
    case 'error':
      return 'Ошибка';
    default:
      return 'Уведомление';
  }
});

const iconName = computed(() => {
  switch (alertState.value.type) {
    case 'success':
      return 'lucide:check-circle';
    case 'warning':
      return 'lucide:alert-triangle';
    case 'error':
      return 'lucide:x-circle';
    default:
      return 'lucide:info';
  }
});

const iconBgClass = computed(() => {
  switch (alertState.value.type) {
    case 'success':
      return 'rounded-lg bg-green-100 p-2';
    case 'warning':
      return 'rounded-lg bg-yellow-100 p-2';
    case 'error':
      return 'rounded-lg bg-red-100 p-2';
    default:
      return 'rounded-lg bg-blue-100 p-2';
  }
});

const iconClass = computed(() => {
  switch (alertState.value.type) {
    case 'success':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-blue-600';
  }
});
</script>
