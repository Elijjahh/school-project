<script setup lang="ts">
const { user } = useUserSession();
const route = useRoute();
const courseId = computed(() => Number(route.params.id));
const router = useRouter();

// Mock interfaces based on drizzle schema
interface Teacher {
  id: number;
  firstname: string;
  lastname: string;
  image?: string | null;
}
interface Category {
  id: number;
  name: string;
}
interface Lesson {
  id: number;
  title: string;
  order: number;
}
interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}
interface Course {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  category: Category;
  teacher: Teacher;
  modules: Module[];
}

// Mock data
const course = ref<(Course & { isParticipating?: boolean; isInWishlist?: boolean }) | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const isStarting = ref(false);
const hasStarted = ref(false);
const isInWishlist = ref(false);

const isCreator = computed(() => {
  return user.value && course.value && user.value.id === course.value.teacher.id;
});

async function fetchCourse() {
  loading.value = true;
  error.value = null;
  try {
    const { data, error: fetchError } = await useFetch(`/api/courses/${courseId.value}`);
    if (fetchError.value) throw fetchError.value;
    course.value = data.value as Course & { isParticipating?: boolean; isInWishlist?: boolean };
    hasStarted.value = !!course.value?.isParticipating;
    isInWishlist.value = !!course.value?.isInWishlist;
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Ошибка загрузки курса';
  } finally {
    loading.value = false;
  }
}

async function startCourse() {
  isStarting.value = true;
  try {
    const { data, error: participateError } = await useFetch(
      `/api/courses/${courseId.value}/participate`,
      {
        method: 'POST',
      },
    );
    if (!participateError.value) {
      hasStarted.value = true;
      if (data.value && typeof data.value.inWishlist === 'boolean') {
        isInWishlist.value = data.value.inWishlist;
      }
    }
  } finally {
    isStarting.value = false;
  }
}

async function addToWishlist() {
  const { data: _data, error } = await useFetch(`/api/courses/${courseId.value}/wishlist`, {
    method: 'POST',
  });
  if (!error.value) {
    isInWishlist.value = true;
  }
}

async function removeFromWishlist() {
  const { error } = await useFetch(`/api/courses/${courseId.value}/wishlist`, {
    method: 'DELETE',
  });
  if (!error.value) {
    isInWishlist.value = false;
  }
}

function toggleWishlist() {
  if (isInWishlist.value) {
    removeFromWishlist();
  } else {
    addToWishlist();
  }
}

const isRemoving = ref(false);

async function removeCourse() {
  if (!confirm('Вы уверены, что хотите удалить этот курс?')) return;
  isRemoving.value = true;
  try {
    await $fetch(`/api/courses/${courseId.value}`, { method: 'DELETE' });
    router.push('/app/teacher/courses');
  } catch (err) {
    error.value = (err as Error).message || 'Ошибка при удалении курса';
  } finally {
    isRemoving.value = false;
  }
}

onMounted(async () => {
  await fetchCourse();
  // Optionally, fetch participation/wishlist state here if you have endpoints
});
</script>

<template>
  <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div v-if="loading" class="text-center py-8">Загрузка...</div>
    <div v-else-if="error" class="text-red-500 text-center py-8">{{ error }}</div>
    <div v-else-if="course" class="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
      <!-- Main Content -->
      <div class="flex-1 space-y-8">
        <!-- Course Info -->
        <div class="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
          <img
            v-if="course.image"
            :src="course.image"
            :alt="course.title"
            class="w-full h-64 object-cover rounded mb-2"
          />
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold mb-1">{{ course.title }}</h1>
              <div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span class="bg-muted px-2 py-0.5 rounded">{{ course.category.name }}</span>
              </div>
              <p class="text-muted-foreground mb-2">{{ course.description }}</p>
            </div>
            <!-- Teacher section -->
            <div class="flex items-center gap-3 bg-muted/40 rounded p-2">
              <img
                v-if="course.teacher.image"
                :src="course.teacher.image"
                :alt="course.teacher.firstname"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div class="font-semibold">
                  {{ course.teacher.firstname }} {{ course.teacher.lastname }}
                </div>
                <div class="text-xs text-muted-foreground">Преподаватель</div>
              </div>
            </div>
          </div>
        </div>
        <!-- Course Content (Modules & Lessons) -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">Содержание курса</h2>
          <div v-for="module in course.modules" :key="module.id" class="mb-6">
            <div class="font-semibold text-lg mb-2">{{ module.title }}</div>
            <ul class="pl-4 border-l-2 border-muted-foreground/20">
              <li
                v-for="lesson in module.lessons"
                :key="lesson.id"
                class="mb-1 flex items-center gap-2"
              >
                <span class="text-muted-foreground">Урок {{ lesson.order }}:</span>
                <span>{{ lesson.title }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- Sidebar -->
      <aside class="w-full lg:w-80 flex-shrink-0 space-y-4">
        <div class="bg-white rounded-lg shadow p-6 flex flex-col gap-4 sticky top-8">
          <template v-if="isCreator">
            <NuxtLink :to="`/app/teacher/courses/${courseId}/edit`">
              <UIButton variant="default" class="w-full">Редактировать курс</UIButton>
            </NuxtLink>
            <UIButton
              variant="destructive"
              class="w-full"
              :loading="isRemoving"
              :disabled="isRemoving"
              @click="removeCourse"
            >
              Удалить курс
            </UIButton>
          </template>
          <template v-else>
            <UIButton
              v-if="!hasStarted"
              variant="default"
              class="w-full"
              :loading="isStarting"
              :disabled="isStarting"
              @click="startCourse"
            >
              Начать курс
            </UIButton>
            <UIButton v-else variant="secondary" class="w-full" disabled> Курс начат </UIButton>
            <UIButton
              :variant="isInWishlist ? 'destructive' : 'outline'"
              class="w-full"
              @click="toggleWishlist"
            >
              {{ isInWishlist ? 'Убрать из избранного' : 'В избранное' }}
            </UIButton>
          </template>
        </div>
      </aside>
    </div>
  </div>
</template>
