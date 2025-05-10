<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const products = ref([])

const fetchProducts = async (category) => {
  console.log('ЗАПРОС НА API. Категория:', category)

  try {
    const response = await fetch(`http://localhost/api.php?category=${category}`)
    if (!response.ok) throw new Error('Ошибка загрузки данных')

    const data = await response.json()
    console.log('ПОЛУЧЕНО:', data)
    products.value = data
  } catch (error) {
    console.error('ОШИБКА при получении данных:', error)
    products.value = []
  }
}

onMounted(() => {
  console.log('MOUNTED. Категория:', route.params.category)
  fetchProducts(route.params.category)
})

watch(() => route.params.category, (newCategory) => {
  console.log('CATEGORY CHANGED:', newCategory)
  fetchProducts(newCategory)
})
</script>



<template>
  <div>
    <h1>Категория: {{ route.params.category }}</h1>

    <div v-if="products.length">
      <div
          v-for="product in products"
          :key="product.id_components"
          class="product"
      >
        <h2>{{ product.name_components }}</h2>
        <p>Цена: {{ product.price }} руб.</p>

        <div v-if="product.specs">
          <h4>Характеристики:</h4>
          <ul>
            <li
                v-for="(value, key) in JSON.parse(product.specs)"
                :key="key"
            >
              {{ key }}: {{ value }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else>
      <p>Нет товаров в этой категории.</p>
    </div>
  </div>
</template>
