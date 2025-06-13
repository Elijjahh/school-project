<script setup lang="ts">
import {
  Layers,
  Plus,
  FolderPlus,
  Folder,
  Calendar,
  Edit,
  Trash,
  Save,
  X,
  Check,
  Eye,
  EyeOff,
  Search,
  User,
  Menu,
  Home,
  Book,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Star,
  Heart,
  Clock,
  Play,
  FileText,
  GraduationCap,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-vue-next';

interface Props {
  name: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  strokeWidth: 2,
});

// Маппинг имен иконок на компоненты Lucide
const iconComponents = {
  'lucide:layers': Layers,
  'lucide:plus': Plus,
  'lucide:folder-plus': FolderPlus,
  'lucide:folder': Folder,
  'lucide:calendar': Calendar,
  'lucide:edit': Edit,
  'lucide:trash': Trash,
  'lucide:save': Save,
  'lucide:x': X,
  'lucide:check': Check,
  'lucide:eye': Eye,
  'lucide:eye-off': EyeOff,
  'lucide:search': Search,
  'lucide:user': User,
  'lucide:menu': Menu,
  'lucide:home': Home,
  'lucide:book': Book,
  'lucide:users': Users,
  'lucide:settings': Settings,
  'lucide:log-out': LogOut,
  'lucide:external-link': ExternalLink,
  'lucide:chevron-down': ChevronDown,
  'lucide:chevron-right': ChevronRight,
  'lucide:star': Star,
  'lucide:heart': Heart,
  'lucide:clock': Clock,
  'lucide:play': Play,
  'lucide:file-text': FileText,
  'lucide:graduation-cap': GraduationCap,
  'lucide:x-circle': XCircle,
  'lucide:check-circle': CheckCircle,
  'lucide:alert-triangle': AlertTriangle,
  'lucide:info': Info,
};

const IconComponent = computed(() => {
  return iconComponents[props.name as keyof typeof iconComponents] || null;
});

// Размеры
const iconSize = computed(() => {
  if (typeof props.size === 'string') {
    // Если размер строка, парсим число из неё
    const parsed = parseInt(props.size, 10);
    return isNaN(parsed) ? 24 : parsed;
  }
  return props.size;
});
</script>

<template>
  <component
    :is="IconComponent"
    v-if="IconComponent"
    :size="iconSize"
    :color="color"
    :stroke-width="strokeWidth"
    :class="props.class"
  />
  <div v-else :class="props.class" class="inline-block">
    <!-- Fallback если иконка не найдена -->
    <div class="rounded bg-gray-300" :style="{ width: `${iconSize}px`, height: `${iconSize}px` }" />
  </div>
</template>
