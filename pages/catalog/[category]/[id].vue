<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, watch, onMounted } from 'vue'
import ProductImageViewer from '@/components/ProductImageViewer.vue'


interface Product {
  id_components: number
  name_components: string
  specs: string
  price: number
}

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const specFields = ref<string[]>([])

const formatLabel = (field: string): string => {
  const label = field.replace(/_/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const formatPrice = (price: number | string): string => {
  const numberPrice = typeof price === 'string' ? Number(price) : price
  return numberPrice.toLocaleString('ru-RU')
}

const getSpecValue = (specs: string, field: string): string => {
  try {
    const parsed = JSON.parse(specs)
    return parsed?.[field] ?? '—'
  } catch {
    return '—'
  }
}


const fetchProduct = async (category: string, id: string) => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`http://my-api/product.php?category=${category}&id=${id}`)
    if (!response.ok) throw new Error('Ошибка загрузки данных')
    const data = await response.json()
    if (data.length === 0) {
      error.value = 'Товар не найден'
      product.value = null
    } else {
      product.value = data[0]
      const specsObj = JSON.parse(product.value?.specs || '{}')
      specFields.value = Object.keys(specsObj)
    }
  } catch (e) {
    error.value = (e as Error).message || 'Ошибка при загрузке'
    product.value = null
  } finally {
    loading.value = false
  }
}

// Загружаем товар при монтировании
onMounted(() => {
  fetchProduct(route.params.category as string, route.params.id as string)
})

// Обновляем товар при изменении параметров маршрута
watch(
    () => [route.params.category, route.params.id],
    ([newCategory, newId]) => {
      fetchProduct(newCategory as string, newId as string)
    }
)
</script>


<template>
  <div class="container">
    <button @click="$router.back()" class="button-text back-button">← Назад</button>

    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">{{ error }}</div>


    <div v-else-if="product" class="product-page-container">
      <h1 class="h1 product-title">{{ product.name_components }}</h1>
      <div class="product-page">
        <ProductImageViewer :imageName="product.name_components" :alt="product.name_components" class="product-image"/>


        <div class="product-details">
          <ul>
            <li v-for="field in specFields" :key="field">
              <strong>{{ formatLabel(field) }}:</strong> {{ getSpecValue(product.specs, field) }}
            </li>
          </ul>
        </div>

        <div class="product-price">
          <div class="price">
            {{ formatPrice(product.price) }} ₽
          </div>

          <button class="button button-cart">В корзину</button>
        </div>
      </div>
    </div>

    <div v-else>
      <p>Товар не найден.</p>
    </div>
  </div>
</template>


