<template>
  <nav v-if="!isHomePage" aria-label="Breadcrumb" class="container">
    <ol class="breadcrumb">
      <li v-for="(crumb, index) in crumbs" :key="index" class="breadcrumb-item">
        <template v-if="index < crumbs.length - 1">
          <nuxt-link :to="crumb.path as string">
            {{ crumb.title }}
          </nuxt-link>
        </template>
        <span v-else aria-current="page">{{ crumb.title }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';

interface Breadcrumb {
  title: string;
  path: RouteLocationRaw | null;
}

const route = useRoute();

// Проверяем, главная ли это страница
const isHomePage = computed(() => route.path === '/');

// Словарь кастомных названий для страниц
const customTitles: Record<string, string> = {
  'catalog': 'Каталог',
  'products': 'Товары',
  'user-profile': 'Профиль пользователя',
  'checkout': 'Оформление заказа'
  // Добавьте другие страницы по необходимости
};

const crumbs = computed<Breadcrumb[]>(() => {
  const fullPath = route.fullPath;
  const params = fullPath.startsWith('/')
      ? fullPath.substring(1).split('/')
      : fullPath.split('/');

  const crumbs: Breadcrumb[] = [];
  let path = '';

  // Добавляем главную страницу
  crumbs.push({
    title: 'Главная',
    path: '/'
  });

  // Строим путь для каждого сегмента
  params.forEach((param, index) => {
    path = `${path}/${param}`;

    // Пропускаем пустые сегменты
    if (!param) return;

    // Получаем название из словаря или преобразуем параметр
    const title = getTitleFromRoute(param) || formatTitle(param);

    // Не делаем последний элемент ссылкой
    if (index < params.length - 1) {
      crumbs.push({
        title,
        path
      });
    } else {
      crumbs.push({
        title,
        path: null
      });
    }
  });

  return crumbs;
});

const formatTitle = (str: string): string => {
  return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getTitleFromRoute = (param: string): string | null => {
  // Проверяем кастомные названия
  if (customTitles[param]) {
    return customTitles[param];
  }

  // Можно добавить проверку из API или store
  return null;
};
</script>


<style scoped lang="scss">

</style>