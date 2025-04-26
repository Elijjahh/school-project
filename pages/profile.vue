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
  <div class="container">
    <div class="profile-content">
      <div class="profile-header">
        <div class="profile-image">
          <img
            v-if="user?.image"
            :src="user.image"
            :alt="`${user?.firstname} ${user?.lastname}`"
            class="avatar"
          />
          <img
            v-else
            src="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
            :alt="`${user?.firstname} ${user?.lastname}`"
            class="avatar"
          />
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ user?.firstname }} {{ user?.lastname }}</h1>
          <p class="profile-username">@{{ user?.username }}</p>
          <p v-if="displayRole" class="profile-role">{{ displayRole }}</p>
        </div>
      </div>

      <PrimeTabMenu :model="tabs" v-model:activeIndex="activeTab" class="profile-tabs" />

      <div v-if="statsPending" class="loading">Загрузка статистики...</div>
      <div v-else-if="statsError" class="error">Не удалось загрузить статистику</div>
      <div v-else class="dashboard-stats">
        <div class="stat-card enrolled">
          <span class="stat-icon-wrapper"><i class="pi pi-play stat-icon" /></span>
          <div class="stat-info">
            <div class="stat-value">{{ stats?.enrolledCourses ?? '-' }}</div>
            <div class="stat-label">Ваши курсы</div>
          </div>
        </div>
        <div class="stat-card active">
          <span class="stat-icon-wrapper"><i class="pi pi-headphones stat-icon" /></span>
          <div class="stat-info">
            <div class="stat-value">{{ stats?.activeCourses ?? '-' }}</div>
            <div class="stat-label">Активные курсы</div>
          </div>
        </div>
        <div class="stat-card completed">
          <span class="stat-icon-wrapper"><i class="pi pi-trophy stat-icon" /></span>
          <div class="stat-info">
            <div class="stat-value">{{ stats?.completedCourses ?? '-' }}</div>
            <div class="stat-label">Завершенные курсы</div>
          </div>
        </div>
        <div class="stat-card instructors">
          <span class="stat-icon-wrapper"><i class="pi pi-users stat-icon" /></span>
          <div class="stat-info">
            <div class="stat-value">{{ stats?.instructors ?? '-' }}</div>
            <div class="stat-label">Преподаватели</div>
          </div>
        </div>
      </div>

      <div v-if="coursesPending" class="loading">Загрузка курсов...</div>
      <div v-else-if="coursesError" class="error">Не удалось загрузить курсы</div>
      <div v-else>
        <div v-if="courses && courses.length > 0" class="learning-section">
          <h2>Ваши курсы</h2>
          <div class="courses-row">
            <div v-for="course in courses" :key="course.id" class="course-card">
              <img :src="course.image || ''" class="course-thumb" />
              <div class="course-title">{{ course.title }}</div>
              <div class="course-desc">{{ course.description }}</div>
              <div class="course-progress-row">
                <button class="watch-btn">Watch Lecture</button>
                <span v-if="course.completed" class="progress-completed">
                  {{ course.progress ? course.progress + '%' : '' }} Completed
                </span>
                <span v-else-if="course.progress" class="progress-incomplete">
                  {{ course.progress }}% Finish
                </span>
              </div>
            </div>
          </div>
        </div>
        <h2 v-else class="no-courses">У вас пока нет курсов</h2>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
  background: var(--surface-card);
  border-radius: 8px;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-name {
  font-size: 2rem;
  margin: 0;
}

.profile-username {
  color: var(--text-color-secondary);
  margin: 0;
}

.profile-role {
  text-transform: capitalize;
  color: var(--primary-color);
  margin: 0;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-border);
}

.detail-label {
  color: var(--text-color-secondary);
}

.detail-value {
  font-weight: 500;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error {
  color: var(--red-500);
  text-align: center;
  padding: 20px;
}

.dashboard-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
  justify-content: flex-start;
}

.stat-icon-wrapper {
  background: #fff;
  padding: 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.stat-icon {
  font-size: 2rem;
  color: #ff6a3d;
  display: block;
  margin: 0;
}

.stat-card {
  padding: 1.5rem;
  text-align: left;
  min-width: 180px;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-shadow: none;
  border-radius: 10px;
  background: #f8f8f8;
}

.stat-card.enrolled {
  background: #fff3ee;
}
.stat-card.active {
  background: #f3f3fd;
}
.stat-card.completed {
  background: #f1fbf5;
}
.stat-card.instructors {
  background: #fff7f2;
}

.stat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.stat-label {
  color: #888;
}

.learning-section {
  margin-top: 2rem;
}

.courses-row {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.course-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  width: 250px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.course-thumb {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.course-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.course-desc {
  color: #888;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.course-progress-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
}

.watch-btn {
  background: #fff3ee;
  color: #ff6a3d;
  border: none;
  border-radius: 5px;
  padding: 0.4rem 1.2rem;
  font-weight: 500;
  cursor: pointer;
}

.progress-completed {
  color: #4caf50;
  font-weight: 500;
  font-size: 0.95rem;
}

.progress-incomplete {
  color: #4caf50;
  font-weight: 500;
  font-size: 0.95rem;
}

.no-courses {
  text-align: center;
  margin-top: 2rem;
}

.profile-tabs {
  margin: 2rem 0 1rem 0;
  background: #fff;
  border-radius: 8px;
  padding: 0 1rem;
}
</style>
