<template>
  <div>
    <Header />
    <Breadcrumbs />
    <NuxtPage />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';
</script>

<style scoped lang="scss">
/* Здесь можно задать стили для layout, если нужно */
</style>