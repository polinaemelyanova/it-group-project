<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// правильно импортируем сами классы!
import Header from '@/composables/Header.js'
import ScrollHeader from '@/composables/ScrollHeader.js'
import { onMounted } from 'vue'

onMounted(() => {
  new Header()
  new ScrollHeader()
})
</script>
