<script lang="ts" setup>
import type { FunctionalComponent } from 'vue';
import type { LucideProps } from 'lucide-vue-next';

defineProps<{
  value: string | number;
  label: string;
  icon: FunctionalComponent<LucideProps>;
  iconColor: string;
  bgColor: string;
}>();
</script>

<template>
  <UICard :class="`${bgColor} p-2`">
    <div class="flex items-center gap-4">
      <div :class="`w-12 h-12 rounded-full ${iconColor} flex items-center justify-center`">
        <component :is="icon" class="w-6 h-6" />
      </div>
      <div>
        <div class="text-2xl font-semibold">{{ value }}</div>
        <div class="text-gray-600">{{ label }}</div>
      </div>
    </div>
  </UICard>
</template>
