<script lang="ts" setup>
defineProps<{
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
}>();

const modelValue = defineModel<string>({ required: true });
</script>

<template>
  <div class="space-y-2">
    <label
      :for="id"
      class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {{ label }}
    </label>
    <UIInput
      :id="id"
      v-model="modelValue"
      :type="type || 'text'"
      :class="{ 'border-destructive focus-visible:ring-destructive': error }"
      :placeholder="placeholder"
    />
    <p v-if="error" class="text-destructive text-sm font-medium">
      {{ error }}
    </p>
  </div>
</template>
