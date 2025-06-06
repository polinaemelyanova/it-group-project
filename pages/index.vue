<template>
  <main>
    <Slider />
    <section class="category" aria-labelledby="category-title">
      <div class="category-wrapper container">
        <h1 class="category__title">Категории товаров</h1>
        <div class="category-grid">

          <div class="category__item">
            <NuxtLink to="/catalog/pc" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/pc.png" alt="Компьютеры">
            </NuxtLink>
            <h4 class="category__item__title">
              <NuxtLink to="/catalog/pc" class="category__item__title__link">Компьютеры</NuxtLink>
            </h4>
          </div>

          <div class="category__item">
            <NuxtLink to="/catalog/cpu" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/cpu.png" alt="Процессоры">
            </NuxtLink>
            <h4 class="category__item__title">
              <NuxtLink to="/catalog/cpu" class="category__item__title__link">Процессоры</NuxtLink>
            </h4>
          </div>

          <div class="category__item">
            <NuxtLink to="/catalog/gpu" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/graphics_card.png" alt="Видеокарты">
            </NuxtLink>
            <h4 class="category__item__title">
              <NuxtLink to="/catalog/gpu" class="category__item__title__link">Видеокарты</NuxtLink>
            </h4>
          </div>

          <div class="category__item">
            <NuxtLink to="/catalog/ssd" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/m2.png" alt="SSD накопители">
            </NuxtLink>
            <h4 class="category__item__title">
              <NuxtLink to="/catalog/ssd" class="category__item__title__link">SSD накопители</NuxtLink>
            </h4>
          </div>

          <div class="category__item">
            <NuxtLink to="/catalog/motherboard" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/motherboard.png" alt="Материнская плата">
            </NuxtLink>
            <h4 class="category__item__title">
              <NuxtLink to="/catalog/motherboard" class="category__item__title__link">Материнские платы</NuxtLink>
            </h4>
          </div>

          <div class="category__item">
            <NuxtLink to="/catalog/psu" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/psu.png" alt="Блоки питания">
            </NuxtLink>
            <h4 class="category__item__title">
              <NuxtLink to="/catalog/psu" class="category__item__title__link">Блоки питания</NuxtLink>
            </h4>
          </div>

          <div class="category__item">
            <NuxtLink to="/catalog/ram" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/ram.png" alt="Оперативная память">
            </NuxtLink>
            <h4 class="category__item__title">
              <NuxtLink to="/catalog/ram" class="category__item__title__link">Оперативная память</NuxtLink>
            </h4>
          </div>

          <div class="category__item">
            <NuxtLink to="/catalog/hdd" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/storage.png" alt="HDD накопители">
            </NuxtLink>
            <h4 class="category__item__title">
              <NuxtLink to="/catalog/hdd" class="category__item__title__link">HDD накопители</NuxtLink>
            </h4>
          </div>

          <div class="category__item">
            <NuxtLink to="/catalog/cooling" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/cooling.png" alt="Системы охлаждения">
            </NuxtLink>
            <h4 class="category__item__title">
              <NuxtLink to="/catalog/cooling" class="category__item__title__link">Системы охлаждения</NuxtLink>
            </h4>
          </div>

          <div class="category__item">
            <NuxtLink to="/catalog/case" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/corpus.png" alt="Корпусы">
            </NuxtLink>
            <h4 class="category__item__title">
              <NuxtLink to="/catalog/case" class="category__item__title__link">Корпуса</NuxtLink>
            </h4>
          </div>

        </div>
      </div>
    </section>
  </main>


</template>

<script setup lang="ts">
import Slider from '~/components/Slider.vue';

interface Category {
  id: number;
  title: string;
  image: string;
}

const categories: Category[] = [
  { id: 1, title: 'Компьютеры', image: '/images/pc.png' },
  { id: 2, title: 'Процессоры', image: '/images/cpu.png' },
  { id: 3, title: 'Видеокарты', image: '/images/graphics_card.png' },
  { id: 4, title: 'SSD накопители', image: '/images/m2.png' },
];
</script>

<style scoped lang="scss">
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;

  .category {
    text-align: center;

    img {
      max-width: 100%;
      height: auto;
    }
  }
}
</style>