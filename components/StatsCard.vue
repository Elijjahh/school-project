<script lang="ts" setup>
import type { FunctionalComponent } from 'vue';
import type { LucideProps } from 'lucide-vue-next';

defineProps<{
  value: string | number;
  label: string;
  icon: FunctionalComponent<LucideProps>;
}>();
</script>

<template>
  <UICard class="overflow-hidden">
    <UICardContent class="px-6">
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <component :is="icon" class="h-6 w-6" />
        </div>
        <div class="space-y-1">
          <p class="text-2xl font-bold tracking-tight">{{ value }}</p>
          <p class="text-sm text-muted-foreground">{{ label }}</p>
        </div>
      </div>
    </UICardContent>
  </UICard>
</template>
