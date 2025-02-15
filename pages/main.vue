<script lang="ts" setup></script>
<template>
  <section>
    <div class="main__info">
      <div class="main__text">
        <div class="main__heading">
          <div class="main__heading ferstline">
            Создаем
            <div class="main__heading future">будущее</div>
          </div>

          <div class="main__heading secline">
            для детей
            <div class="main__heading here">здесь!</div>
          </div>
        </div>
        <div class="main__buttons">
          <Login />
          <RegistrationForm />
        </div>
      </div>
      <div class="main__photo"></div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.main {
  &__info {
    background-color: aquamarine;
    height: auto;
    padding: 15px;
  }

  &__text {
    margin-top: 15px;
    margin-bottom: 20px;
  }
  &__heading {
    display: flex;
    flex-direction: column;
    max-width: 100;

    font-weight: 500;
    font-size: 69px;

    .ferstline {
      display: flex;
      align-items: baseline;
      flex-direction: row;

      padding: 10px 10px 0px 10px;
    }

    .secline {
      display: flex;
      align-items: baseline;
      flex-direction: row;

      padding: 10px 10px 10px 60px;
    }

    .future {
      border-radius: 2cap;
      padding: 5px;
      margin-left: 10px;
      background-color: yellow;
    }

    .here {
      border-radius: 2cap;
      padding: 5px;
      margin-left: 10px;
      background-color: goldenrod;
    }
  }

  &__buttons {
    display: flex;
    gap: 15px;
    margin: 10px;
    padding-left: 100px;
  }
}
</style>
