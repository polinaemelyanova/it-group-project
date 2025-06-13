<script setup lang="ts">
import '@vueform/slider/themes/default.css'
import Slider from '@vueform/slider'
import ProductImageViewer from '@/components/ProductImageViewer.vue'
import AddToCartButton from "~/components/AddToCartButton.vue"
import { ref, computed, watch, onMounted } from "vue"
import { useRoute } from "vue-router"
import { useCartStore } from "~/stores/cart"

interface Product {
  id_components: number
  name_components: string
  specs: string
  price: number
  category: string
}

interface Component {
  id_components: number
  name_components: string
  name_type: string
  specs: string
}

interface Configuration {
  id_configuration: number
  name_configuration: string
  image: string
  price_configuration: number
  components: Component[]
  category: 'pc'
}

interface FilterConfig {
  label: string
  field: string
  options: string[]
  selected: string[]
}

interface Specs {
  [key: string]: any
  производитель?: string
  модель?: string
}

// Улучшенная функция для парсинга JSON
const safeJsonParse = (str: string): Specs => {
  try {
    const parsed = JSON.parse(str)
    // Если specs уже являются строкой JSON
    if (typeof parsed === 'string') {
      try {
        return JSON.parse(parsed)
      } catch {
        return {}
      }
    }
    return parsed
  } catch {
    return {}
  }
}

const filterConfigByCategory = ref<Record<string, FilterConfig[]>>({})
const imageViewerRef = ref<InstanceType<typeof ProductImageViewer> | null>(null)
const cart = useCartStore()
const route = useRoute()
const products = ref<Product[]>([])
const filteredProducts = ref<Product[]>([])
const configurations = ref<Configuration[]>([])
const collapsedFilters = ref<Record<string, boolean>>({})


const sortOptions = [
  {label: 'Новинки', value: 'newest'},
  {label: 'Дешевле', value: 'priceAsc'},
  {label: 'Дороже', value: 'priceDesc'}
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
  cooling: 'Системы охлаждения',
  pc: 'Компьютеры',
}

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

const categoryFilters: Record<string, string[]> = {
  cpu: ['производитель', 'сокет', 'количество_ядер', 'линейка', 'tdp', 'интегрированное_графическое_ядро'],
  gpu: ['производитель', 'интерфейс', 'объем_памяти', 'серия'],
  ram: ['производитель', 'форм-фактор', 'объем', 'тип', 'частота', 'количество_модулей', 'подсветка'],
  motherboard: ['производитель', 'сокет', 'чипсет', 'форм-фактор', 'тип_памяти'],
  hdd: ['производитель', 'объем', 'форм-фактор', 'интерфейс'],
  ssd: ['производитель', 'объем', 'форм-фактор', 'назначение'],
  psu: ['производитель', 'мощность', 'сертификат'],
  case: ['производитель', 'форм-фактор', 'подсветка', 'цвет'],
  cooling: ['производитель', 'тип', 'сокет', 'подсветка']
}

const fields = [
  'cpu.производитель',
  'cpu.ядра',
  'cpu.название',
  'gpu.производитель',
  'gpu.модель',
  'ram.объем',
  'ram.тип',
  'ssd.объем',
  'motherboard.формат',
  'case.тип',
  'case.цвет',
  'cooling.тип'
]

const displayNames: Record<string, string> = {
  'cpu.производитель': 'Производитель процессора',
  'cpu.ядра': 'Количество ядер процессора',
  'cpu.название': 'Модель процессора',
  'gpu.производитель': 'Производитель видеокарты',
  'gpu.модель': 'Модель видеокарты',
  'ram.объем': 'Объём оперативной памяти',
  'ram.тип': 'Тип оперативной памяти',
  'ssd.объем': 'Объём SSD',
  'motherboard.формат': 'Формат материнской платы',
  'case.тип': 'Тип корпуса',
  'case.цвет': 'Цвет корпуса',
  'cooling.тип': 'Тип охлаждения'
}

const availableManufacturers = computed(() => {
  const currentCategory = route.params.category as string
  const manufacturers = new Set<string>()

  if (currentCategory === 'pc') {
    configurations.value.forEach(config => {
      config.components.forEach(component => {
        const specs = safeJsonParse(component.specs)
        if (specs?.производитель) manufacturers.add(specs.производитель)
      })
    })
  } else {
    products.value.forEach(product => {
      const specs = safeJsonParse(product.specs)
      if (specs?.производитель) manufacturers.add(specs.производитель)
    })
  }

  return Array.from(manufacturers).sort()
})

const toggleFilterCollapse = (field: string) => {
  collapsedFilters.value[field] = !collapsedFilters.value[field]
}

const applyFilters = () => {
  const currentCategory = route.params.category as string
  const filters = filterConfigByCategory.value[currentCategory] ?? []

  if (currentCategory === 'pc') {
    const filteredConfigs = configurations.value.filter(config => {
      const price = config.price_configuration
      const priceInRange = price >= priceRange.value[0] && price <= priceRange.value[1]

      const manufacturerMatch = selectedManufacturers.value.length === 0 ||
          config.components.some(component => {
            const specs = safeJsonParse(component.specs)
            return selectedManufacturers.value.includes(specs?.производитель || '')
          })

      const additionalFiltersMatch = filters.every(f => {
        return config.components.some(component => {
          const specs = safeJsonParse(component.specs)
          const [type, prop] = f.field.includes('.') ? f.field.split('.') : [f.field]

          // Для конфигураций ПК проверяем соответствие типа компонента
          if (type !== component.name_type) return false

          const specValue = prop ? specs?.[prop] : specs

          if (Array.isArray(specValue)) {
            return f.selected.length === 0 || specValue.some((val: string) => f.selected.includes(val))
          }
          return f.selected.length === 0 || (specValue && f.selected.includes(specValue))
        })
      })

      return priceInRange && manufacturerMatch && additionalFiltersMatch
    })

    filteredProducts.value = filteredConfigs.map(config => ({
      id_components: config.id_configuration,
      name_components: config.name_configuration,
      specs: JSON.stringify({
        ...config.components.reduce((acc, component) => ({
          ...acc,
          [component.name_type]: safeJsonParse(component.specs)
        }), {}),
        components: config.components.map(c => ({
          type: c.name_type,
          name: c.name_components,
          id: c.id_components
        }))
      }),
      price: config.price_configuration,
      category: 'pc'
    }))
    return
  }

  filteredProducts.value = products.value.filter(product => {
    const specs = safeJsonParse(product.specs)
    const price = product.price
    const manufacturer = specs?.производитель || ''

    const priceInRange = price >= priceRange.value[0] && price <= priceRange.value[1]
    const manufacturerMatch =
        selectedManufacturers.value.length === 0 ||
        selectedManufacturers.value.includes(manufacturer)

    const additionalFiltersMatch = filters.every(f => {
      const specValue = specs?.[f.field]
      if (Array.isArray(specValue)) {
        return f.selected.length === 0 || specValue.some((val: string) => f.selected.includes(val))
      }
      return f.selected.length === 0 || (specValue && f.selected.includes(specValue))
    })

    return priceInRange && manufacturerMatch && additionalFiltersMatch
  })

  applySort(selectedSort.value)
}

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
  const parsed = safeJsonParse(specs)
  return parsed?.[field] ?? '—'
}

const readableCategory = computed(() => {
  const raw = route.params.category as string
  return customCategoryTitles[raw] || raw
})

const fieldOrder = computed(() => {
  const raw = route.params.category as string
  return fieldOrderByCategory[raw] ?? []
})

watch(
    [products, priceRange, selectedManufacturers, filterConfigByCategory],
    () => applyFilters(),
    {deep: true}
)

const fetchProducts = async (category: string) => {
  console.log('Запрос данных для категории:', category)

  if (category !== 'pc') {
    try {
      const response = await fetch(`http://my-api/api.php?category=${category}`)
      if (!response.ok) throw new Error('Ошибка загрузки данных')
      const data = await response.json()

      products.value = data.map((item: any) => ({
        ...item,
        category
      }))

      const generateFilters = (category: string) => {
        const specsList = products.value.map(p => safeJsonParse(p.specs))
        const fieldConfigs: FilterConfig[] = []
        const categoryFields = categoryFilters[category] ?? []

        for (const field of categoryFields) {
          if (field === 'производитель') continue

          let options = Array.from(new Set(
              specsList.flatMap(s => {
                const v = s[field]
                return Array.isArray(v) ? v : (v != null ? [v] : [])
              })
          ))

          if (category === 'cooling' && field === 'сокет') {
            options = [
              'AM5', 'AM4', 'LGA1851', 'LGA1700', 'LGA1200', 'LGA1151-v2', 'LGA1151',
              'LGA1366', 'AM3+', 'LGA1156', 'LGA2011', 'LGA2011-3', 'LGA1150', 'LGA1155',
              'LGA2066', '754', '939', '940', 'AM2+', 'AM3', 'FM2', 'FM2+', 'LGA775',
              'SP3', 'TR4', 'sTRX4'
            ]
          }

          options.sort((a, b) =>
              String(a).localeCompare(String(b), undefined, {numeric: true, sensitivity: 'base'})
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

      const prices = data.map((p: Product) => p.price)
      minPrice.value = Math.min(...prices)
      maxPrice.value = Math.max(...prices)
      priceRange.value = [minPrice.value, maxPrice.value]

      filteredProducts.value = products.value
      applyFilters()
      applySort(selectedSort.value)
    } catch (error) {
      console.error('Ошибка при получении данных:', error)
      products.value = []
      filteredProducts.value = []
    }
  } else {
    try {
      const response = await fetch(`http://my-api/configurations.php`)
      if (!response.ok) throw new Error('Ошибка загрузки данных')
      const data = await response.json()

      // Группируем компоненты по конфигурациям
      const configMap = new Map<number, Configuration>()

      data.forEach((row: any) => {
        if (!configMap.has(row.id_configuration)) {
          configMap.set(row.id_configuration, {
            id_configuration: row.id_configuration,
            name_configuration: row.name_configuration,
            image: row.image || '',
            price_configuration: row.price_configuration,
            components: [],
            category: 'pc'
          })
        }

        if (row.id_components) {
          configMap.get(row.id_configuration)?.components.push({
            id_components: row.id_components,
            name_components: row.name_components,
            name_type: row.name_type,
            specs: row.specs
          })
        }
      })

      configurations.value = Array.from(configMap.values())
      console.log('Processed configurations:', configurations.value)

      // Генерируем фильтры для ПК
      const specsList = configurations.value.map(config => {
        return config.components.reduce((acc: Record<string, Specs>, component) => {
          acc[component.name_type] = safeJsonParse(component.specs)
          return acc
        }, {})
      })

      const fieldConfigs: FilterConfig[] = []
      for (const field of fields) {
        const [type, prop] = field.split('.')
        const values = specsList
            .map(specs => specs[type]?.[prop])
            .filter(Boolean)
            .flat() // На случай, если значение массив

        const uniqueValues = Array.from(new Set(values))
            .sort((a, b) => String(a).localeCompare(String(b), undefined, {numeric: true, sensitivity: 'base'}))

        if (uniqueValues.length > 0) {
          fieldConfigs.push({
            label: displayNames[field] ?? formatLabel(prop),
            field,
            options: uniqueValues,
            selected: []
          })
        }
      }

      filterConfigByCategory.value['pc'] = fieldConfigs
      console.log('Generated PC filters:', fieldConfigs)

      // Обновляем ценовой диапазон
      const prices = configurations.value.map(c => c.price_configuration)
      minPrice.value = Math.min(...prices)
      maxPrice.value = Math.max(...prices)
      priceRange.value = [minPrice.value, maxPrice.value]

      // Формируем filteredProducts
      filteredProducts.value = configurations.value.map(config => ({
        id_components: config.id_configuration,
        name_components: config.name_configuration,
        specs: JSON.stringify({
          ...config.components.reduce((acc, component) => ({
            ...acc,
            [component.name_type]: safeJsonParse(component.specs)
          }), {}),
          components: config.components.map(c => ({
            type: c.name_type,
            name: c.name_components,
            id: c.id_components
          }))
        }),
        price: config.price_configuration,
        category: 'pc'
      }))

      applyFilters()
      applySort(selectedSort.value)

      console.log('Generated PC filters:', fieldConfigs);
      console.log('Filter config by category:', filterConfigByCategory.value);
    } catch (error) {
      console.error('Ошибка при получении данных:', error)
      configurations.value = []
      filteredProducts.value = []
    }
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

        <div v-if="route.params.category != 'pc'"
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </div>

        <transition name="collapse">
          <div v-if="route.params.category != 'pc'"
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
            <span class="filter-label"> {{ filter.label }} </span>
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
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
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
          <button class="button dropdown-button" @click="toggleSortDropdown"
                  style="display: flex; align-items: center; gap: 6px;">
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
                <span v-if="selectedSort === option.value"
                      style="color: var(--color-purple); font-weight: bold;">✓</span>
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
                  ref="imageViewerRef"
              />
            </NuxtLink>


            <div class="product-info">
              <NuxtLink :to="`/catalog/${route.params.category}/${product.id_components}`">
                <div class="product-name">{{ product.name_components }}</div>
              </NuxtLink>


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
              <AddToCartButton
                  :id="product.id_components"
                  :name="product.name_components"
                  :price="product.price"
                  :image="imageViewerRef?.imageSrc"
                  :category="product.category"
              />
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