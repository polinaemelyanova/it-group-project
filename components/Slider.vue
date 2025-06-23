<template>
  <section class="slider container">
    <Swiper
        :modules="[Navigation, Pagination, Autoplay, EffectFade]"
        :loop="true"
        :centeredSlides="true"
        :effect="'fade'"
        :speed="700"
        :autoplay="{ delay: 8000, disableOnInteraction: false }"
        :pagination="{ el: '.swiper-pagination', clickable: true }"
        :navigation="{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }"
        class="swiper-container"
    >
      <SwiperSlide v-for="(banner, index) in banners" :key="index" class="swiper-slide">
        <NuxtLink :to="banner.link">
          <img :src="banner.src" :alt="banner.alt" />
        </NuxtLink>
      </SwiperSlide>

      <div class="swiper-pagination"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </Swiper>
  </section>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Импорты стилей
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const banners = [
  { src: '/images/banner1.png', alt: 'баннер 1', link: '/configurator' },
  { src: '/images/banner2.png', alt: 'баннер 2', link: '/catalog/pc' },
  { src: '/images/banner3.png', alt: 'баннер 3', link: '/catalog/pc' },
];
</script>