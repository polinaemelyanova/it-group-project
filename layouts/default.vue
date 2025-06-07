<template>
  <div class="layout">
    <Header />
    <Breadcrumbs />
    <main class="layout__main">
      <NuxtPage :key="`${route.params.category || ''}_${route.params.id || ''}`" />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
