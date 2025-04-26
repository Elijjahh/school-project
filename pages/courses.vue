<script setup lang="ts">
const { data: courses, pending, error } = await useFetch('/api/courses');
</script>

<template>
  <section class="cards">
    <div class="cards-container">
      <h1 class="cards-title">Мои курсы</h1>

      <div>
        <div class="cards-btns">
          <PrimeButton label="Все" variant="text" severity="secondary" />
          <PrimeButton label="Вводные" variant="text" severity="secondary" />
          <PrimeButton label="Основные" variant="text" severity="secondary" />
          <PrimeButton label="Профориентация" variant="text" severity="secondary" />
        </div>

        <div v-if="pending" class="loading">
          <PrimeProgressSpinner />
        </div>
        <div v-else-if="error" class="error">Произошла ошибка при загрузке курсов</div>
        <div v-else class="cards-grid">
          <PrimeCard v-for="course in courses" :key="course.id">
            <template #header>
              <img
                v-if="course.image"
                :src="course.image"
                :alt="course.title"
                class="course-image"
              />
              <img
                v-else
                src="https://primefaces.org/cdn/primevue/images/usercard.png"
                :alt="course.title"
                class="course-image"
              />
            </template>
            <template #title>{{ course.title }}</template>
            <template #content>
              <p class="m-0">{{ course.description }}</p>
            </template>
          </PrimeCard>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cards-container {
  display: grid;
  grid-template-columns: 50rem;
  overflow: hidden;
  width: 80%;
  margin: 0 auto;
  justify-content: center;
}

.cards-title {
  font-size: 2.5rem;
  margin: 40px 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin: 40px 10px;
}

.cards-btns {
  display: flex;
  justify-content: left;
  gap: 10px;
  margin-bottom: 20px;
}

.course-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error {
  color: var(--red-500);
  text-align: center;
  padding: 20px;
}
</style>
