<template>
  <div>
    <Header />
    <Breadcrumbs />
    <NuxtPage :key="`${route.params.category || ''}_${route.params.id || ''}`" />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>