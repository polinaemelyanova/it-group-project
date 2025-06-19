<template>
  <header class="header" data-js-header>
    <div class="header__overlay" data-js-header-overlay>
      <div class="header__inner container" data-js-header-inner>
        <nav class="header__menu">
          <ul class="header__menu-list">
            <li class="header__menu-item">
              <a href="/" class="header__menu-link ">О магазине</a>
            </li>
            <li class="header__menu-item">
              <NuxtLink to="/configurator" class="header__menu-link">Конфигуратор ПК</NuxtLink>
            </li>
            <li class="header__menu-item">
              <a href="/" class="header__menu-link">Оплата</a>
            </li>
            <li class="header__menu-item">
              <a href="/" class="header__menu-link">Доставка</a>
            </li>
            <li class="header__menu-item">
              <a href="/" class="header__menu-link">Контакты</a>
            </li>

          </ul>
        </nav>
        <div class="header__group hidden-tablet">
          <div class="header__clock">
            <span class="icon__clock icon">Пн-Вс: 10:00 — 20:00</span>
          </div>
          <div class="header__contact">
            <a class="phone-link" href="tel:+74952330338"><span class="icon__contact icon">8 (495)
                                233-03-38</span></a>
            <a class="phone-link" href="tel:+74952330338">8 (495) 233-03-38</a>
          </div>
        </div>
      </div>
    </div>
    <div class="header__body" data-js-header-body>
      <div class="header__bottom container" data-js-header-bottom>
        <a href="/" class="header__logo" aria-label="Home" title="Home">
          <img src="/images/logo.svg" alt="" width="170" height="34" class="logo__image logo">
        </a>
        <div class="header__group">

          <div class="header__catalog-wrapper">
            <NuxtLink
                to="/catalog"
                class="header__catalog button icon__catalog icon hidden-tablet"
                data-js-catalog-button
            >
              Каталог
            </NuxtLink>
            <div class="header__catalog__drop-down" data-js-catalog-drop-down>
              <a class="header__catalog__drop-down__item" href="/">Компьютеры</a>
              <a class="header__catalog__drop-down__item" href="/">Комплектующие</a>
              <a class="header__catalog__drop-down__item" href="/">Оргтехника</a>
            </div>
          </div>

          <button
              class="header__burger-button burger-button icon__navigation icon__navigation__menu-open visible-tablet"
              type="button" aria-label="Open menu" title="Open menu" data-js-header-burger-button>
          </button>
          <form action="#" class="header__form" method="get">
                        <span class="">
                            <input type="text" class="header__bottom__input" placeholder="Поиск по товару">
                            <button class="search">
                                <span class="icon__search icon"></span>
                            </button>
                        </span>
          </form>

        </div>
        <NuxtLink to="/cart" class="header__cart icon__cart hidden-tablet">Корзина</NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isMenuActive = ref(false);

const toggleMenu = () => {
  isMenuActive.value = !isMenuActive.value;
};
</script>

