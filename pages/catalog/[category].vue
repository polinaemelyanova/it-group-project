<script setup lang="ts">

interface Product {
  id_components: number
  name_components: string
  specs: string
  price: number
}

const route = useRoute()
const products = ref<Product[]>([])


const customCategoryTitles: Record<string, string> = {
  cpu: 'Процессоры',
  gpu: 'Видеокарты',
  ram: 'Оперативная память',
  motherboard: 'Материнские платы',
  hdd: 'Жесткие диски',
  ssd: 'SSD-накопители',
  psu: 'Блоки питания',
  case: 'Корпуса',
  cooling: 'Системы охлаждения'
}

// Характеристики по категориям
const fieldOrderByCategory: Record<string, string[]> = {
  cpu: ['производитель', 'модель', 'сокет', 'базовая_частота', 'количество_ядер', 'tdp'],
  gpu: ['производитель', 'модель', 'объем_памяти', 'тип_памяти', 'частота_ядра'],
  ram: ['производитель', 'модель', 'объем', 'тип', 'частота'],
  motherboard: ['производитель', 'сокет', 'чипсет', 'форм_фактор'],
  hdd: ['производитель', 'объем', 'форм-фактор', 'интерфейс'],
  ssd: ['производитель', 'объем', 'тип', 'интерфейс'],
  psu: ['производитель', 'мощность', 'сертификат'],
  case: ['производитель', 'форм-фактор', 'материал'],
  cooling: ['производитель', 'тип', 'уровень_шума']
}


// Фильтрация


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

const readableCategory = computed(() => {
  const raw = route.params.category as string
  return customCategoryTitles[raw] || raw
})

// Получаем порядок полей по категории
const fieldOrder = computed(() => {
  const raw = route.params.category as string
  return fieldOrderByCategory[raw] ?? []
})

const fetchProducts = async (category: string) => {
  console.log('ЗАПРОС НА API. Категория:', category)
  try {
    const response = await fetch(`http://my-api/api.php?category=${category}`)
    if (!response.ok) throw new Error('Ошибка загрузки данных')
    const data = await response.json()
    products.value = data
  } catch (error) {
    console.error('Ошибка при получении данных:', error)
    products.value = []
  }
}

onMounted(() => {
  fetchProducts(route.params.category as string)
})

watch(() => route.params.category, (newCategory) => {
  fetchProducts(newCategory as string)
})
</script>

<template>
  <div class="container">
    <h1>{{ readableCategory }}</h1>

    <div v-if="products.length" class="products">
      <div
          v-for="product in products"
          :key="product.id_components"
          class="product"
      >
        <img
            :src="`/images/components/${product.name_components}.png`"
            :alt="product.name_components"
            class="images-component"
        />

        <div class="product-info">
          <div class="product-name">{{ product.name_components }}</div>

          <div v-if="product.specs">
            <ul class="list-components">
              <li
                  v-for="field in fieldOrder"
                  :key="field"
              >
                <span class="field-label">{{ formatLabel(field) }}:</span>
                {{ getSpecValue(product.specs, field) }}
              </li>
            </ul>
          </div>
        </div>

        <div class="price-button">
          <div class="price">{{ formatPrice(product.price) }} ₽</div>
          <button class="button button-cart">В корзину</button>
        </div>
      </div>
    </div>

    <div v-else>
      <p>Нет товаров в этой категории.</p>
    </div>
  </div>
</template>
