<template>
  <div
    v-if="confirmState.show"
    class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm"
  >
    <div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
      <div class="mb-4 flex items-center space-x-3">
        <div class="rounded-full bg-red-100 p-3">
          <AppIcon name="lucide:trash" class="h-6 w-6 text-red-600" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ confirmState.title || 'Подтверждение' }}
        </h3>
      </div>

      <p class="mb-6 text-gray-600">{{ confirmState.message }}</p>

      <div class="flex justify-end space-x-3">
        <UIButton variant="outline" @click="handleCancel" :disabled="confirmState.loading">
          {{ confirmState.cancelText || 'Отмена' }}
        </UIButton>
        <UIButton variant="destructive" @click="handleConfirm" :disabled="confirmState.loading">
          <UISpinner v-if="confirmState.loading" class="mr-2 h-4 w-4" />
          {{ confirmState.confirmText || 'Подтвердить' }}
        </UIButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { confirmState, handleConfirm, handleCancel } = useModal();
</script>
