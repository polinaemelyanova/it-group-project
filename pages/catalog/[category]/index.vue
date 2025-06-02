<script setup lang="ts">
// import component
import '@vueform/slider/themes/default.css'
import Slider from '@vueform/slider'
import {categories} from "@vueuse/metadata";
import ProductImageViewer from '@/components/ProductImageViewer.vue'


interface Product {
  id_components: number
  name_components: string
  specs: string
  price: number
}

interface FilterConfig {
  label: string
  field: string
  options: string[]
  selected: string[]
}

const filterConfigByCategory = ref<Record<string, FilterConfig[]>>({})


const route = useRoute()
const products = ref<Product[]>([])
const filteredProducts = ref<Product[]>([])

const collapsedFilters = ref<Record<string, boolean>>({})


const sortOptions = [
  { label: 'Новинки', value: 'newest' },
  { label: 'Дешевле', value: 'priceAsc' },
  { label: 'Дороже', value: 'priceDesc' }
]

const sortDropdownVisible = ref(false)
const selectedSort = ref('newest')

const toggleSortDropdown = () => {
  sortDropdownVisible.value = !sortDropdownVisible.value
}

const applySort = (value: string) => {
  selectedSort.value = value
  sortDropdownVisible.value = false

  switch (value) {
    case 'priceAsc':
      filteredProducts.value.sort((a, b) => a.price - b.price)
      break
    case 'priceDesc':
      filteredProducts.value.sort((a, b) => b.price - a.price)
      break
    case 'newest':
      filteredProducts.value.sort((a, b) => b.id_components - a.id_components)
      break
  }
}


// Фильтры
// Добавляем переменные для пределов цен
const minPrice = ref(0)
const maxPrice = ref(250000)
const priceRange = ref<[number, number]>([0, 250000])
const selectedManufacturers = ref<string[]>([])

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

// Характеристики фильтров по категориям
const categoryFilters: Record<string, string[]> = {
  cpu: ['производитель', 'сокет', 'количество_ядер', 'линейка' , 'tdp', 'интегрированное_графическое_ядро'],
  gpu: ['производитель', 'интерфейс', 'объем_памяти', 'серия'],
  ram: ['производитель', 'форм-фактор', 'объем', 'тип', 'частота', 'количество_модулей', 'подсветка'],
  motherboard: ['производитель', 'сокет', 'чипсет', 'форм-фактор', 'тип_памяти'],
  hdd: ['производитель', 'объем', 'форм-фактор', 'интерфейс'],
  ssd: ['производитель', 'объем', 'форм-фактор', 'назначение'],
  psu: ['производитель', 'мощность', 'сертификат'],
  case: ['производитель', 'форм-фактор', 'подсветка', 'цвет'],
  cooling: ['производитель', 'тип', 'сокет', 'подсветка']
}


// Получаем уникальных производителей для текущей категории
const availableManufacturers = computed(() => {
  const manufacturers = new Set<string>()
  products.value.forEach(product => {
    try {
      const specs = JSON.parse(product.specs)
      if (specs?.производитель) {
        manufacturers.add(specs.производитель)
      }
    } catch {}
  })
  return Array.from(manufacturers).sort()
})

const toggleFilterCollapse = (field: string) => {
  collapsedFilters.value[field] = !collapsedFilters.value[field]
}


// Применяем фильтры
const applyFilters = () => {
  const currentCategory = route.params.category as string
  const filters = filterConfigByCategory.value[currentCategory] ?? []

  filteredProducts.value = products.value.filter(product => {
    try {
      const specs = JSON.parse(product.specs)
      const price = product.price
      const manufacturer = specs?.производитель || ''

      const priceInRange = price >= priceRange.value[0] && price <= priceRange.value[1]
      const manufacturerMatch =
          selectedManufacturers.value.length === 0 ||
          selectedManufacturers.value.includes(manufacturer)

      const additionalFiltersMatch = filters.every(f => {
        const specValue = specs?.[f.field]

        // Если значение — массив, проверим есть ли пересечение
        if (Array.isArray(specValue)) {
          return f.selected.length === 0 || specValue.some((val: string) => f.selected.includes(val))
        }

        // Если значение — обычное (строка / число)
        return f.selected.length === 0 || f.selected.includes(specValue)
      })

      return priceInRange && manufacturerMatch && additionalFiltersMatch
    } catch {
      return false
    }
  })
}


// Сбрасываем фильтры
const resetFilters = () => {
  priceRange.value = [minPrice.value, maxPrice.value]
  selectedManufacturers.value = []

  const currentCategory = route.params.category as string
  const filters = filterConfigByCategory.value[currentCategory] ?? []

  for (const filter of filters) {
    filter.selected = []
  }

  applyFilters()
}

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

// При изменении продуктов или фильтров - применяем фильтрацию
watch(
    [products, priceRange, selectedManufacturers, filterConfigByCategory],
    () => applyFilters(),
    { deep: true }
)

const fetchProducts = async (category: string) => {
  console.log('ЗАПРОС НА API. Категория:', category)
  try {
    const response = await fetch(`http://my-api/api.php?category=${category}`)
    if (!response.ok) throw new Error('Ошибка загрузки данных')
    const data = await response.json()
    products.value = data

    // Генерация фильтров по категории
    const generateFilters = (category: string) => {
      const specsList = products.value.map(p => {
        try { return JSON.parse(p.specs) }
        catch { return {} }
      })

      const fieldConfigs: FilterConfig[] = []
      const categoryFields = categoryFilters[category] ?? []

      for (const field of categoryFields) {
        if (field === 'производитель') continue

        // Собираем все значения (учитывая и массивы)
        let options = Array.from(new Set(
            specsList.flatMap(s => {
              const v = s[field]
              return Array.isArray(v) ? v : (v != null ? [v] : [])
            })
        ))

        // Спец. список для cooling-сокетов (если нужен вручную):
        if (category === 'cooling' && field === 'сокет') {
          options = [
            'AM5','AM4','LGA1851','LGA1700','LGA1200','LGA1151-v2','LGA1151',
            'LGA1366','AM3+','LGA1156','LGA2011','LGA2011-3','LGA1150','LGA1155',
            'LGA2066','754','939','940','AM2+','AM3','FM2','FM2+','LGA775',
            'SP3','TR4','sTRX4'
          ]
        }

        // Естественная (натуральная) сортировка
        options.sort((a, b) =>
            String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
        )

        if (options.length) {
          fieldConfigs.push({
            label: formatLabel(field),
            field,
            options,
            selected: [],
          })
        }
      }

      filterConfigByCategory.value[category] = fieldConfigs
    }


    generateFilters(category)

    // Вычисляем минимальную и максимальную цену
    const prices = data.map((p: Product) => p.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    minPrice.value = min
    maxPrice.value = max
    priceRange.value = [min, max] // Инициализируем фильтр диапазоном цен

    filteredProducts.value = data
    applyFilters()
  } catch (error) {
    console.error('Ошибка при получении данных:', error)
    products.value = []
    filteredProducts.value = []
  }
}

onMounted(() => {
  fetchProducts(route.params.category as string)
})

watch(() => route.params.category, (newCategory) => {
  if (newCategory) {
    fetchProducts(newCategory as string)
  }
})
</script>


<template>
  <div class="container">
    <h1>{{ readableCategory }}</h1>

    <div class="category__wrapper">

      <!-- Фильтры -->
      <div class="filters">

        <div class="filters__caption">
          <div class="h3">Фильтры</div>
          <button class="button-text" @click="resetFilters">Очистить</button>
        </div>

        <div class="h4">Цена</div>


        <div class="price-values">
          <input v-model.number="priceRange[0]" class="price-field" type="text"/>
          <div class="h4">−</div>
          <input v-model.number="priceRange[1]" class="price-field" type="text"/>
        </div>


        <Slider
            v-model="priceRange"
            :min="minPrice"
            :max="maxPrice"
            :tooltips="false"
            :lazy="false"
            :step="1000"
            :range="true"
            class="custom-slider"
        />

        <div
            class="filter-header mb15"
            @click="toggleFilterCollapse('производитель')"
        >
          <span class="filter-label">Производитель</span>
          <svg
              class="filter-arrow"
              :class="{ 'rotated': !collapsedFilters['производитель'] }"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              width="24"
              height="24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <transition name="collapse">
          <div
              v-show="!collapsedFilters['производитель']"
              class="checkboxes mb30 scrollable-filter collapse-content"
          >
            <label
                v-for="manufacturer in availableManufacturers"
                :key="manufacturer"
                class="checkbox-label"
            >
              <input
                  type="checkbox"
                  :value="manufacturer"
                  v-model="selectedManufacturers"
              />
              {{ manufacturer }}
            </label>
          </div>
        </transition>



        <!-- Дополнительные фильтры -->
        <div
            v-for="filter in filterConfigByCategory[route.params.category as string] ?? []"
            :key="filter.field"
            class="mb15"
        >
          <div
              class="filter-header"
              @click="toggleFilterCollapse(filter.field)"
          >
            <span class="filter-label"> {{filter.label}} </span>
            <svg
                class="filter-arrow"
                :class="{ 'rotated': !collapsedFilters[filter.field] }"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                width="24"
                height="24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <transition name="collapse">
            <div
                v-show="!collapsedFilters[filter.field]"
                class="checkboxes mb30 scrollable-filter collapse-content"
            >
              <label
                  v-for="option in filter.options"
                  :key="option"
                  class="checkbox-label"
              >
                <input
                    type="checkbox"
                    :value="option"
                    v-model="filter.selected"
                />
                {{ option }}
              </label>
            </div>
          </transition>
        </div>




      </div>



      <div v-if="filteredProducts.length" class="products">
        <div class="dropdown" style="position: relative;">
          <button class="button dropdown-button" @click="toggleSortDropdown" style="display: flex; align-items: center; gap: 6px;">
            Сортировка: {{ sortOptions.find(o => o.value === selectedSort)?.label }}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                :style="{ transform: sortDropdownVisible ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
                viewBox="0 0 24 24"
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          <transition name="fade">
            <ul
                v-if="sortDropdownVisible"
                class="dropdown-menu"
            >
              <li
                  v-for="option in sortOptions"
                  :key="option.value"
                  @click="applySort(option.value)"
                  style="padding: 8px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;"
                  @mouseover="($event.target as HTMLElement).style.background = '#eee'"
                  @mouseleave="($event.target as HTMLElement).style.background = 'transparent'"
              >
                <span>{{ option.label }}</span>
                <span v-if="selectedSort === option.value" style="color: var(--color-purple); font-weight: bold;">✓</span>
              </li>
            </ul>

          </transition>
        </div>


        <div
            v-for="product in filteredProducts"
            :key="product.id_components"
            class="product"
        >

          <NuxtLink :to="`/catalog/${route.params.category}/${product.id_components}`">
            <ProductImageViewer
                :imageName="product.name_components"
                :alt="product.name_components"
                class="images-component"
                :disableModal="true"
            />
          </NuxtLink>



          <div class="product-info">
            <NuxtLink :to="`/catalog/${route.params.category}/${product.id_components}`"><div class="product-name">{{ product.name_components }}</div></NuxtLink>



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

      <div v-else-if="products.length">
        <p>Нет товаров, соответствующих выбранным фильтрам.</p>
      </div>

      <div v-else>
        <p class="h3">Нет товаров в этой категории.</p>
      </div>
    </div>
  </div>

</template>