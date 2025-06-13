<template>
  <!-- Модальное окно подтверждения -->
  <UIModalConfirm />

  <!-- Модальное окно уведомления -->
  <UIModalAlert />
</template>

<script setup lang="ts">
const modal = useModal();

// Предоставляем глобально доступ к модальным окнам
provide('modal', {
  confirm: modal.confirm,
  alert: modal.alert,
});
</script>
