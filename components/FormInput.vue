<script lang="ts" setup>
defineProps<{
  id: string;
  modelValue: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="space-y-2">
    <label
      :for="id"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {{ label }}
    </label>
    <UIInput
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :type="type || 'text'"
      :class="{ 'border-destructive focus-visible:ring-destructive': error }"
      :placeholder="placeholder"
    />
    <p v-if="error" class="text-sm font-medium text-destructive">
      {{ error }}
    </p>
  </div>
</template>
