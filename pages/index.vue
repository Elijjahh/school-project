<script lang="ts" setup></script>

<template>
  <section class="cards">
    <div class="cards-container">
      <h1 class="cards-title">Мои курсы</h1>

      <form>
        <div>
          <PrimeButton label="Все" variant="text" severity="secondary" />
          <PrimeButton label="Вводные" variant="text" severity="secondary" />
          <PrimeButton label="Основные" variant="text" severity="secondary" />
          <PrimeButton label="Профориентация" variant="text" severity="secondary" />
        </div>

        <div class="cards-grid">
          <PrimeCard>
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

          <PrimeCard>
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

          <PrimeCard>
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
}
</style>
