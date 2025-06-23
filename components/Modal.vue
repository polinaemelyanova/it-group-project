<script setup lang="ts">
import '@vueform/slider/themes/default.css'
import Slider from '@vueform/slider'
import ProductImageViewer from '@/components/ProductImageViewer.vue'
import AddToCartButton from "~/components/AddToCartButton.vue"
import { ref, computed, watch, onMounted } from "vue"
import { useRoute } from "vue-router"
import { useCartStore } from "~/stores/cart"
import { defineProps, defineEmits } from 'vue'

interface Product {
  id_components: number
  name_components: string
  specs: string
  price: number
  category: string
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

const props = defineProps({
  category: String,
  selectedComponents: Object
})

const emit = defineEmits(['close', 'add-component'])

function closeModal() {
  emit('close')
  document.body.style.overflow = ''
}

function addToConfigurator(product: Product) {
  emit('add-component', product)
}

// Улучшенная функция для парсинга JSON
const safeJsonParse = (str: string): Specs => {
  try {
    const parsed = JSON.parse(str)
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
  motherboard: ['производитель', 'сокет', 'чипсет', 'форм-фактор'],
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
  'процессор.производитель',
  'процессор.модель',
  'процессор.серия',
  'процессор.сокет',
  'процессор.разгон',
  'процессор.техпроцесс',
  'процессор.количество_ядер',
  'процессор.количество_потоков',
  'процессор.интегрированное_графическое_ядро',
  'видеокарта.производитель',
  'видеокарта.серия',
  'видеокарта.объем_памяти',
  'видеокарта.тип_памяти',
  'видеокарта.интерфейс',
  'оперативная память.производитель',
  'оперативная память.тип',
  'оперативная память.объем',
  'оперативная память.количество_модулей',
  'материнская плата.производитель',
  'материнская плата.чипсет',
  'материнская плата.сокет',
  'твердотельный накопитель.производитель',
  'твердотельный накопитель.объем',
  'твердотельный накопитель.тип',
  'блок питания.производитель',
  'блок питания.мощность',
  'корпус.производитель',
  'корпус.цвет',
  'корпус.форм-фактор',
  'система охлаждения.производитель',
  'система охлаждения.тип'
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


const caseSupportedFormFactors: Record<string, string[]> = {
  "Full-Tower": ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"],
  "Mid-Tower": ["ATX", "Micro-ATX", "Mini-ITX"],
  "Mini-Tower": ["Micro-ATX", "Mini-ITX"],
  "Micro-ATX": ["Micro-ATX", "Mini-ITX"],
  "Mini-ITX": ["Mini-ITX"],
}


function filterCompatibleProducts(products: Product[], selectedComponents: Record<string, any>, currentCategory: string): Product[] {
  // CPU: показать только те, что подходят к выбранной материнке (по сокету)
  if (currentCategory === 'cpu' && selectedComponents['motherboard']) {
    const mbSpecs = safeJsonParse(selectedComponents['motherboard'].specs || '{}');
    const mbSocket = mbSpecs['сокет'];
    return products.filter(product => {
      const cpuSpecs = safeJsonParse(product.specs);
      return cpuSpecs['сокет'] === mbSocket;
    });
  }

  // Motherboard: показать только те, что подходят к выбранному процессору (по сокету)
  if (currentCategory === 'motherboard' && selectedComponents['cpu']) {
    const cpuSpecs = safeJsonParse(selectedComponents['cpu'].specs || '{}');
    const cpuSocket = cpuSpecs['сокет'];
    return products.filter(product => {
      const mbSpecs = safeJsonParse(product.specs);
      return mbSpecs['сокет'] === cpuSocket;
    });
  }

  // RAM: фильтрация по типу памяти материнской платы
  if (currentCategory === 'ram' && selectedComponents['motherboard']) {
    const mbSpecs = safeJsonParse(selectedComponents['motherboard'].specs || '{}');
    const ramType = mbSpecs['тип_памяти'];
    return products.filter(product => {
      const ramSpecs = safeJsonParse(product.specs);
      return ramSpecs['тип'] === ramType;
    });
  }

  // Motherboard: фильтрация по типу RAM, если уже выбрана память
  if (currentCategory === 'motherboard' && selectedComponents['ram']) {
    const ramSpecs = safeJsonParse(selectedComponents['ram'].specs || '{}');
    const ramType = ramSpecs['тип'];
    return products.filter(product => {
      const mbSpecs = safeJsonParse(product.specs);
      return mbSpecs['тип_памяти'] === ramType;
    });
  }

  // GPU: фильтрация по PCIe интерфейсу материнской платы
  if (currentCategory === 'gpu' && selectedComponents['motherboard']) {
    const mbSpecs = safeJsonParse(selectedComponents['motherboard'].specs || '{}');
    const mbPcieSlots: string[] = mbSpecs['слоты_PCIe'] || [];

    function normalizePcie(str: string) {
      return str
          .toLowerCase()
          .replace(/express/g, '')   // убираем express
          .replace(/pcie/g, 'pci')  // приводим pcie к pci
          .replace(/\s+/g, '')      // убираем пробелы
          .replace(/-/g, '');       // убираем дефисы
    }

    return products.filter(product => {
      const gpuSpecs = safeJsonParse(product.specs);
      const gpuIf = normalizePcie(gpuSpecs['интерфейс'] || '');

      // Для "PCI Express 4.0" получится "pci4.0"
      // Для "1 x PCIe 4.0 x16" получится "1xpci4.0x16"
      return mbPcieSlots.some(slotRaw => {
        const slot = normalizePcie(slotRaw);
        // Совпадение по "pci4.0" и т.д.
        return slot.includes(gpuIf);
      });
    });
  }

  // PSU: фильтрация по требуемой мощности видеокарты или проц
  if (currentCategory === 'psu' && selectedComponents['gpu']) {
    const gpuSpecs = safeJsonParse(selectedComponents['gpu'].specs || '{}');
    let required = gpuSpecs['рекомендуемый_блок_питания'];
    if (typeof required === 'string') {
      required = parseInt(required);
    }
    return products.filter(product => {
      const psuSpecs = safeJsonParse(product.specs);
      const psuWatts = parseInt(psuSpecs['мощность']);
      return !isNaN(psuWatts) && !isNaN(required) && psuWatts >= required;
    });
  }

  // SSD: фильтрация по наличию M.2 разъёмов на материнке
  if (currentCategory === 'ssd' && selectedComponents['motherboard']) {
    const mbSpecs = safeJsonParse(selectedComponents['motherboard'].specs || '{}');
    const mbM2 = mbSpecs['разъемы_M2'] || 0;
    return products.filter(product => {
      const ssdSpecs = safeJsonParse(product.specs);
      // если SSD форм-фактор M.2, то должны быть свободные M.2
      if (ssdSpecs['форм-фактор'] && ssdSpecs['форм-фактор'].toLowerCase().includes('m.2')) {
        return mbM2 > 0;
      }
      return true;
    });
  }

  // Корпус: фильтрация по форм-фактору материнской платы
  if (currentCategory === 'case' && selectedComponents['motherboard']) {
    const mbSpecs = safeJsonParse(selectedComponents['motherboard'].specs || '{}');
    const mbForm = mbSpecs['форм-фактор'];
    return products.filter(product => {
      const caseSpecs = safeJsonParse(product.specs);
      const caseType = caseSpecs['форм-фактор'];
      return caseSupportedFormFactors[caseType]?.includes(mbForm);
    });
  }

  // Корпус: длина видеокарты
  if (currentCategory === 'case' && selectedComponents['gpu']) {
    products = products.filter(product => {
      const caseSpecs = safeJsonParse(product.specs);
      const gpuSpecs = safeJsonParse(selectedComponents['gpu'].specs || '{}');

      // Длина видеокарты
      const gpuLengthRaw = gpuSpecs['длина'] || '';
      const gpuLength = typeof gpuLengthRaw === 'string'
          ? parseInt(gpuLengthRaw.replace(/[^\d]/g, ''))
          : Number(gpuLengthRaw);

      // Первая длина корпуса из "размеры"
      let caseLength = 0;
      if (caseSpecs['размеры']) {
        const match = String(caseSpecs['размеры']).match(/^(\d+)/);
        if (match) caseLength = parseInt(match[1]);
      }

      if (!caseLength || isNaN(caseLength) || !gpuLength || isNaN(gpuLength)) return true;
      return gpuLength <= caseLength;
    });
  }


  // Кулер: фильтрация по сокету CPU/материнской платы
  if (currentCategory === 'cooling' && selectedComponents['cpu']) {
    const cpuSpecs = safeJsonParse(selectedComponents['cpu'].specs || '{}');
    const cpuSocket = cpuSpecs['сокет'];
    return products.filter(product => {
      const coolingSpecs = safeJsonParse(product.specs);
      // у кулеров иногда массив сокетов!
      if (Array.isArray(coolingSpecs['сокет'])) {
        return coolingSpecs['сокет'].includes(cpuSocket);
      }
      return coolingSpecs['сокет'] === cpuSocket;
    });
  }


  return products;
}



const availableManufacturers = computed(() => {
  const currentCategory = props.category as string
  const manufacturers = new Set<string>()

  products.value.forEach(product => {
    const specs = safeJsonParse(product.specs)
    if (specs?.производитель) manufacturers.add(specs.производитель)
  })

  return Array.from(manufacturers).sort()
})

const toggleFilterCollapse = (field: string) => {
  collapsedFilters.value[field] = !collapsedFilters.value[field]
}

const applyFilters = () => {
  const currentCategory = props.category as string
  const filters = filterConfigByCategory.value[currentCategory] ?? []

  // Сначала применяем пользовательские фильтры (цена, производитель и т.д.)
  let candidates = products.value.filter(product => {
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

  // Затем фильтрация по совместимости
  candidates = filterCompatibleProducts(candidates, props.selectedComponents || {}, currentCategory)

  filteredProducts.value = candidates
  applySort(selectedSort.value)
}

const resetFilters = () => {
  priceRange.value = [minPrice.value, maxPrice.value]
  selectedManufacturers.value = []

  const currentCategory = props.category as string
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
  const raw = props.category as string
  return customCategoryTitles[raw] || raw
})

const fieldOrder = computed(() => {
  const raw = props.category as string
  return fieldOrderByCategory[raw] ?? []
})

watch(
    [products, priceRange, selectedManufacturers, filterConfigByCategory],
    () => applyFilters(),
    {deep: true}
)

const fetchProducts = async (category: string) => {
  console.log('Запрос данных для категории:', category)

  try {
    const response = await fetch(`http://my-api/configurator.php?category=${category}`)
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
  } catch (error) {
    console.error('Ошибка при получении данных:', error)
    products.value = []
    filteredProducts.value = []
  }
}

function getImageUrl(name: string): string {
  const extensions = ['png', 'jpg', 'jpeg', 'webp']
  for (const ext of extensions) {
    return `/images/components/${name}.${ext}`;
  }
  return '/images/components/placeholder.png'
}

onMounted(() => {
  if (props.category) fetchProducts(props.category as string)
})

watch(() => props.category, (newCategory) => {
  if (newCategory) fetchProducts(newCategory as string)
})
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

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
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
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
              v-for="filter in filterConfigByCategory[props.category as string] ?? []"
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
              <ProductImageViewer
                  :imageName="product.name_components"
                  :alt="product.name_components"
                  class="images-component"
                  :disableModal="true"
                  ref="imageViewerRef"
                  :category="product.category"
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
              <button class="add-btn button" @click="addToConfigurator(product)">Добавить</button>
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
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  z-index: 1001;
  color: #333;
  transition: color 0.2s;
}

.close-button:hover {
  color: #f00;
}

.close-button svg {
  display: block;
}

.category__wrapper {
  display: flex;
  gap: 20px;
}

.filters {
  width: 250px;
  flex-shrink: 0;
}

.products {
  flex-grow: 1;
}

.images-component {
  width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.images-component img) {
  width: 100%;
  height: 100%;
  max-width: 150px;
  max-height: 180px;
  object-fit: contain;
  display: block;
}


</style>