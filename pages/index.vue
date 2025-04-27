<template>
  <main>
    <Slider />
    <section class="category" aria-labelledby="category-title">
      <div class="category-wrapper container">
        <h1 class="category__title">Категории товаров</h1>
        <div class="category-grid">

          <div class="category__item">
            <a href="/" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/pc.png" alt="Компьютеры">
            </a>
            <h4 class="category__item__title">
              <a href="/" class="category__item__title__link">Компьютеры</a>
            </h4>
          </div>

          <div class="category__item">
            <a href="/" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/cpu.png" alt="Процессоры">
            </a>
            <h4 class="category__item__title">
              <a href="/" class="category__item__title__link">Процессоры</a>
            </h4>
          </div>

          <div class="category__item">
            <a href="/" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/graphics_card.png" alt="Видеокарты">
            </a>
            <h4 class="category__item__title">
              <a href="/" class="category__item__title__link">Видеокарты</a>
            </h4>
          </div>

          <div class="category__item">
            <a href="/" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/m2.png" alt="SSD накопители">
            </a>
            <h4 class="category__item__title">
              <a href="/" class="category__item__title__link">SSD накопители</a>
            </h4>
          </div>

          <div class="category__item">
            <a href="/" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/motherboard.png" alt="Материнская плата">
            </a>
            <h4 class="category__item__title">
              <a href="/" class="category__item__title__link">Материнские платы</a>
            </h4>
          </div>

          <div class="category__item">
            <a href="/" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/psu.png" alt="Блоки питания">
            </a>
            <h4 class="category__item__title">
              <a href="/" class="category__item__title__link">Блоки питания</a>
            </h4>
          </div>

          <div class="category__item">
            <a href="/" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/ram.png" alt="Оперативная память">
            </a>
            <h4 class="category__item__title">
              <a href="/" class="category__item__title__link">Оперативная память</a>
            </h4>
          </div>

          <div class="category__item">
            <a href="/" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/storage.png" alt="HDD накопители">
            </a>
            <h4 class="category__item__title">
              <a href="/" class="category__item__title__link">HDD накопители</a>
            </h4>
          </div>

          <div class="category__item">
            <a href="/" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/cooling.png" alt="Системы охлаждения">
            </a>
            <h4 class="category__item__title">
              <a href="/" class="category__item__title__link">Системы охлаждения</a>
            </h4>
          </div>

          <div class="category__item">
            <a href="/" class="category__item__image-wrapper">
              <img class="category__item__image" src="/images/corpus.png" alt="Корпусы">
            </a>
            <h4 class="category__item__title">
              <a href="/" class="category__item__title__link">Корпусы</a>
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