<script setup lang="ts">
const { user } = useUserSession();

const {
  data: stats,
  pending: statsPending,
  error: statsError,
} = await useFetch(`/api/auth/users/${user.value?.id}/stats`);

const {
  data: courses,
  pending: coursesPending,
  error: coursesError,
} = await useFetch(`/api/auth/users/${user.value?.id}/courses`);

const displayRole = computed(() => {
  if (user.value?.role === 'teacher') return 'Преподаватель';
  if (user.value?.role === 'admin') return 'Администратор';
  return '';
});

const tabs = [
  { label: 'Панель', icon: 'pi pi-home' },
  { label: 'Курсы', icon: 'pi pi-book' },
  { label: 'Преподаватели', icon: 'pi pi-users' },
  { label: 'Сообщения', icon: 'pi pi-envelope' },
  { label: 'Избранное', icon: 'pi pi-heart' },
  { label: 'Покупки', icon: 'pi pi-shopping-cart' },
  { label: 'Настройки', icon: 'pi pi-cog' },
];
const activeTab = ref(0);
</script>

<template>
  <div class="container mx-auto">
    <div class="flex flex-col gap-8">
      <div class="flex items-center gap-8 p-4 bg-white rounded-lg shadow">
        <div class="w-[150px] h-[150px] rounded-full overflow-hidden">
          <img
            v-if="user?.image"
            :src="user.image"
            :alt="`${user?.firstname} ${user?.lastname}`"
            class="w-full h-full object-cover"
          />
          <img
            v-else
            src="/assets/images/login-img.png"
            :alt="`${user?.firstname} ${user?.lastname}`"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="flex flex-col gap-2">
          <h1 class="text-4xl font-semibold m-0">{{ user?.firstname }} {{ user?.lastname }}</h1>
          <p class="text-gray-500 m-0">@{{ user?.username }}</p>
          <p v-if="displayRole" class="text-primary capitalize m-0">{{ displayRole }}</p>
        </div>
      </div>

      <UITabs v-model="activeTab" class="w-full">
        <UITabsList class="w-full justify-start">
          <UITabsTrigger v-for="(tab, index) in tabs" :key="index" :value="index" class="gap-2">
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </UITabsTrigger>
        </UITabsList>
      </UITabs>

      <div v-if="statsPending" class="text-center py-8">Загрузка статистики...</div>
      <div v-else-if="statsError" class="text-center text-red-500 py-8">
        Не удалось загрузить статистику
      </div>
      <div v-else class="grid grid-cols-4 gap-6">
        <UICard class="bg-blue-50">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="pi pi-play text-blue-500 text-xl"></i>
            </div>
            <div>
              <div class="text-2xl font-semibold">{{ stats?.enrolledCourses ?? '-' }}</div>
              <div class="text-gray-600">Ваши курсы</div>
            </div>
          </div>
        </UICard>

        <UICard class="bg-green-50">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <i class="pi pi-headphones text-green-500 text-xl"></i>
            </div>
            <div>
              <div class="text-2xl font-semibold">{{ stats?.activeCourses ?? '-' }}</div>
              <div class="text-gray-600">Активные курсы</div>
            </div>
          </div>
        </UICard>

        <UICard class="bg-yellow-50">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <i class="pi pi-trophy text-yellow-500 text-xl"></i>
            </div>
            <div>
              <div class="text-2xl font-semibold">{{ stats?.completedCourses ?? '-' }}</div>
              <div class="text-gray-600">Завершенные курсы</div>
            </div>
          </div>
        </UICard>

        <UICard class="bg-purple-50">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <i class="pi pi-users text-purple-500 text-xl"></i>
            </div>
            <div>
              <div class="text-2xl font-semibold">{{ stats?.instructors ?? '-' }}</div>
              <div class="text-gray-600">Преподаватели</div>
            </div>
          </div>
        </UICard>
      </div>

      <div v-if="coursesPending" class="text-center py-8">Загрузка курсов...</div>
      <div v-else-if="coursesError" class="text-center text-red-500 py-8">
        Не удалось загрузить курсы
      </div>
      <div v-else>
        <div v-if="courses && courses.length > 0">
          <h2 class="text-2xl font-semibold mb-6">Ваши курсы</h2>
          <div class="grid grid-cols-3 gap-6">
            <UICard v-for="course in courses" :key="course.id" class="flex flex-col">
              <img :src="course.image || ''" class="w-full h-48 object-cover rounded-t-lg" />
              <div class="p-4 flex flex-col gap-4">
                <h3 class="text-xl font-semibold">{{ course.title }}</h3>
                <p class="text-gray-600">{{ course.description }}</p>
                <div class="flex items-center justify-between mt-auto">
                  <UIButton variant="default">Watch Lecture</UIButton>
                  <span v-if="course.completed" class="text-green-500">
                    {{ course.progress ? course.progress + '%' : '' }} Completed
                  </span>
                  <span v-else-if="course.progress" class="text-blue-500">
                    {{ course.progress }}% Finish
                  </span>
                </div>
              </div>
            </UICard>
          </div>
        </div>
        <h2 v-else class="text-2xl font-semibold text-center py-8">У вас пока нет курсов</h2>
      </div>
    </div>
  </div>
</template>
