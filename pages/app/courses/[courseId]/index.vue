<script setup lang="ts">
const { user } = useUserSession();
const route = useRoute();
const courseId = computed(() => Number(route.params.courseId));
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
    router.push('/app/my-courses');
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
  <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div v-if="loading" class="py-8 text-center">Загрузка...</div>
    <div v-else-if="error" class="py-8 text-center text-red-500">{{ error }}</div>
    <div v-else-if="course" class="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
      <!-- Main Content -->
      <div class="flex-1 space-y-8">
        <!-- Course Info -->
        <div class="flex flex-col gap-4 rounded-lg bg-white p-6 shadow">
          <img
            v-if="course.image"
            :src="course.image"
            :alt="course.title"
            class="mb-2 h-64 w-full rounded object-cover"
          />
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 class="mb-1 text-3xl font-bold">{{ course.title }}</h1>
              <div class="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                <span class="bg-muted rounded px-2 py-0.5">{{ course.category.name }}</span>
              </div>
              <p class="text-muted-foreground mb-2">{{ course.description }}</p>
            </div>
            <!-- Teacher section -->
            <div class="bg-muted/40 flex items-center gap-3 rounded p-2">
              <img
                v-if="course.teacher.image"
                :src="course.teacher.image"
                :alt="course.teacher.firstname"
                class="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <div class="font-semibold">
                  {{ course.teacher.firstname }} {{ course.teacher.lastname }}
                </div>
                <div class="text-muted-foreground text-xs">Преподаватель</div>
              </div>
            </div>
          </div>
        </div>
        <!-- Course Content (Modules & Lessons) -->
        <div class="rounded-lg bg-white p-6 shadow">
          <h2 class="mb-4 text-xl font-bold">Содержание курса</h2>
          <div v-for="module in course.modules" :key="module.id" class="mb-6">
            <div class="mb-2 text-lg font-semibold">{{ module.title }}</div>
            <ul class="border-muted-foreground/20 border-l-2 pl-4">
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
      <aside class="w-full flex-shrink-0 space-y-4 lg:w-80">
        <div class="sticky top-8 flex flex-col gap-4 rounded-lg bg-white p-6 shadow">
          <template v-if="isCreator">
            <NuxtLink :to="`/app/courses/${courseId}/edit`">
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
