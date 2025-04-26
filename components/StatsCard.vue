<script lang="ts" setup>
defineProps<{
  value: string | number;
  label: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}>();
</script>

<template>
  <UICard :class="bgColor">
    <div class="flex items-center gap-4">
      <div :class="`w-12 h-12 rounded-full ${iconColor} flex items-center justify-center`">
        <i :class="icon" class="text-xl"></i>
      </div>
      <div>
        <div class="text-2xl font-semibold">{{ value }}</div>
        <div class="text-gray-600">{{ label }}</div>
      </div>
    </div>
  </UICard>
</template>
