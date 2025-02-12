<script lang="ts" setup></script>

<template>
  <div class="cards-container">
    <section class="cards-sec">
      <h1 class="courses">Мои курсы</h1>

      <form>
        <div class="card flex justify-center flex-wrap gap-4 cards-btns">
          <PrimeButton label="Все" variant="text" severity="secondary" />
          <PrimeButton label="Вводные" variant="text" severity="secondary" />
          <PrimeButton label="Основные" variant="text" severity="secondary" />
          <PrimeButton label="Профориентация" variant="text" severity="secondary" />
        </div>

        <div class="cards-grid">
          <PrimeCard style="width: 25rem; overflow: hidden">
            <template #header>
              <img
                alt="user header"
                src="https://primefaces.org/cdn/primevue/images/usercard.png"
              />
            </template>
            <template #subtitle>История</template>
            <template #title>Вводный курс по истории</template>
            <template #content>
              <p class="m-0">Читайте прошлое создавайте будущее</p>
            </template>
            <template #footer> </template>
          </PrimeCard>

          <PrimeCard style="width: 25rem; overflow: hidden">
            <template #header>
              <img
                alt="user header"
                src="https://primefaces.org/cdn/primevue/images/usercard.png"
              />
            </template>
            <template #subtitle>История</template>
            <template #title>Вводный курс по истории</template>
            <template #content>
              <p class="m-0">Читайте прошлое создавайте будущее</p>
            </template>
            <template #footer> </template>
          </PrimeCard>

          <PrimeCard style="width: 25rem; overflow: hidden">
            <template #header>
              <img
                alt="user header"
                src="https://primefaces.org/cdn/primevue/images/usercard.png"
              />
            </template>
            <template #subtitle>История</template>
            <template #title>Вводный курс по истории</template>
            <template #content>
              <p class="m-0">Читайте прошлое создавайте будущее</p>
            </template>
            <template #footer> </template>
          </PrimeCard>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.cards-container {
  display: grid;
  place-items: center;
}

.courses {
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
}
</style>
