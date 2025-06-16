<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import ProductImageViewer from '@/components/ProductImageViewer.vue'
import AddToCartButton from "~/components/AddToCartButton.vue";
import { useCartStore } from '@/stores/cart'

interface Product {
  id_components: number
  name_components: string
  specs: string
  category: string
  price: number
}


interface ConfigurationComponent {
  id_configuration: number
  name_configuration: string
  name_type: string
  id_component: number
  name_components: string
  specs: string
  image: string
  price_configuration: number
  type_configuration: number
  specss: string // JSON-строка
  category: 'pc'
  type_product: number
  // и любые другие поля из SQL-запроса
}

const configuration = ref<ConfigurationComponent[] | null>(null)


const specCategoriesMap: Record<string, Record<string, string[]>> = {
  cpu: {
    'Основные': ['производитель', 'модель', 'сокет', 'линейка', 'серия', 'количество_ядер', 'количество_потоков'],
    'Частотные характеристики': ['базовая_частота', 'максимальная_частота', 'tdp', 'техпроцесс'],
    'Кэш': ['кеш_L1', 'кеш_L2', 'кеш_L3'],
    'Поддержка': ['встроенная_графика', 'интегрированное_графическое_ядро', 'технологии'],
  },
  motherboard: {
    'Основные': ['производитель', 'модель', 'сокет', 'чипсет', 'форм-фактор'],
    'Память': ['тип_памяти', 'слоты_памяти', 'макс_объем_памяти'],
    'Интерфейсы': ['разъемы_SATA', 'разъемы_M2', 'слоты_PCIe'],
    'Сеть и звук': ['сетевая_карта', 'встроенное_аудио'],
  },
  gpu: {
    'Основные': ['производитель', 'модель', 'серия', 'разгон', 'интерфейс'],
    'Видеопроцессор': ['частота_ядра'],
    'Память': ['объем_памяти', 'тип_памяти', 'разрядность_шины', 'частота_памяти'],
    'Дополнительно': ['разъемы', 'охлаждение', 'длина', 'рекомендуемый_блок_питания'],
  },
  ram: {
    'Основные': ['производитель', 'модель', 'тип', 'объем'],
    'Частотные характеристики': ['частота', 'тайминги', 'напряжение'],
    'Физические параметры': ['количество_модулей', 'форм-фактор', 'радиатор', 'подсветка'],
  },
  psu: {
    'Основные': ['производитель', 'модель', 'мощность', 'сертификат', 'форм-фактор'],
    'Разъемы': ['разъемы'],
    'Особенности': ['модульный', 'вентилятор'],
  },
  case: {
    'Основные': ['производитель', 'модель', 'форм-фактор', 'материал', 'цвет'],
    'Размеры и компоновка': ['размеры', 'размещение_БП', 'поддержка_СЖО'],
    'Дополнительно': ['окно', 'вентиляторы', 'отсеки_HDD', 'отсеки_SSD'],
  },
  hdd: {
    'Основные': ['производитель', 'модель', 'объем', 'емкость', 'тип', 'форм-фактор'],
    'Характеристики': ['интерфейс', 'скорость', 'буфер'],
  },
  ssd: {
    'Основные': ['производитель', 'модель', 'объем', 'емкость', 'тип', 'форм-фактор'],
    'Интерфейс и скорость': ['интерфейс', 'чтение', 'запись'],
    'Дополнительно': ['ресурс', 'назначение'],
  },
  cooling: {
    'Основные': ['производитель', 'модель', 'тип', 'высота'],
    'Характеристики': ['уровень_шума', 'шум', 'вентилятор'],
    'Совместимость': ['сокет'],
    'Дополнительно': ['подсветка', 'рассеиваемая_мощность'],
  },
};

const specTypeMap: Record<string, Record<string, Record<string, string[]>>> = {
  '1': {
    'Процессор': {
      'Основные': [
        'производитель',
        'модель',
        'сокет',
        'линейка',
        'серия',
        'количество_ядер',
        'количество_потоков',
      ],
      'Частотные характеристики': [
        'базовая_частота',
        'максимальная_частота',
        'tdp',
        'техпроцесс',
      ],
      'Кэш': ['кеш_L1', 'кеш_L2', 'кеш_L3'],
      'Поддержка': [
        'встроенная_графика',
        'интегрированное_графическое_ядро',
        'технологии',
      ],
    },
  },
  '2': {
    'Материнская плата': {
      'Основные': [
        'производитель',
        'модель',
        'сокет',
        'чипсет',
        'форм-фактор',
      ],
      'Память': ['тип_памяти', 'слоты_памяти', 'макс_объем_памяти'],
      'Интерфейсы': ['разъемы_SATA', 'разъемы_M2', 'слоты_PCIe'],
      'Сеть и звук': ['сетевая_карта', 'встроенное_аудио'],
    },
  },
  '3': {
    'Видеокарта': {
      'Основные': [
        'производитель',
        'модель',
        'серия',
        'разгон',
        'интерфейс',
      ],
      'Видеопроцессор': ['частота_ядра'],
      'Память': [
        'объем_памяти',
        'тип_памяти',
        'разрядность_шины',
        'частота_памяти',
      ],
      'Дополнительно': [
        'разъемы',
        'охлаждение',
        'длина',
        'рекомендуемый_блок_питания',
      ],
    },
  },
  '4': {
    'Оперативная память': {
      'Основные': ['производитель', 'модель', 'тип', 'объем'],
      'Частотные характеристики': ['частота', 'тайминги', 'напряжение'],
      'Физические параметры': [
        'количество_модулей',
        'форм-фактор',
        'радиатор',
        'подсветка',
      ],
    },
  },
  '5': {
    'Блок питания': {
      'Основные': [
        'производитель',
        'модель',
        'мощность',
        'сертификат',
        'форм-фактор',
      ],
      'Разъемы': ['разъемы'],
      'Особенности': ['модульный', 'вентилятор'],
    },
  },
  '6': {
    'Корпус': {
      'Основные': [
        'производитель',
        'модель',
        'форм-фактор',
        'материал',
        'цвет',
      ],
      'Размеры и компоновка': [
        'размеры',
        'размещение_БП',
        'поддержка_СЖО',
      ],
      'Дополнительно': [
        'окно',
        'вентиляторы',
        'отсеки_HDD',
        'отсеки_SSD',
      ],
    },
  },
  '7': {
    'Жёсткий диск (HDD)': {
      'Основные': [
        'производитель',
        'модель',
        'объем',
        'емкость',
        'тип',
        'форм-фактор',
      ],
      'Характеристики': ['интерфейс', 'скорость', 'буфер'],
    },
  },
  '8': {
    'Твердотельный накопитель (SSD)': {
      'Основные': [
        'производитель',
        'модель',
        'объем',
        'емкость',
        'тип',
        'форм-фактор',
      ],
      'Интерфейс и скорость': ['интерфейс', 'чтение', 'запись'],
      'Дополнительно': ['ресурс', 'назначение'],
    },
  },
  '9': {
    'Охлаждение': {
      'Основные': ['производитель', 'модель', 'тип', 'высота'],
      'Характеристики': ['уровень_шума', 'шум', 'вентилятор'],
      'Совместимость': ['сокет'],
      'Дополнительно': ['подсветка', 'рассеиваемая_мощность'],
    },
  },
};

const cart = useCartStore()
const router = useRouter()

const imageViewerRef = ref<InstanceType<typeof ProductImageViewer> | null>(null)

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const specFields = ref<string[]>([])
const allSpecsSection = ref<HTMLElement | null>(null)


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
  if (category != 'pc') {
    try {
      const response = await fetch(`http://my-api/product.php?category=${category}&id=${id}`)
      if (!response.ok) throw new Error('Ошибка загрузки данных')
      const data = await response.json()
      if (data.length === 0) {
        error.value = 'Товар не найден'
        product.value = null
      } else {
        product.value = data[0]

        if (product.value) {
          product.value.category = category;
        }

        const specsObj = JSON.parse(product.value?.specs || '{}')
        specFields.value = Object.keys(specsObj)
      }
    } catch (e) {
      error.value = (e as Error).message || 'Ошибка при загрузке'
      product.value = null
    } finally {
      loading.value = false
    }
  } else {
    try {
      const response = await fetch(`http://my-api/configuration.php?id=${id}`)
      if (!response.ok) throw new Error('Ошибка загрузки данных')
      const data = await response.json()

      if (data.length === 0) {
        error.value = 'Сборка не найдена'
        configuration.value = null
      } else {
        configuration.value = data.map((item: ConfigurationComponent) => ({
          ...item,
          specs: item.specs || '{}',
          category: category,
        }))
      }
    } catch (e) {
      error.value = (e as Error).message || 'Ошибка при загрузке'
      configuration.value = null
    } finally {
      loading.value = false
    }
  }
}


  const scrollToSpecs = () => {
  nextTick(() => {
    allSpecsSection.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

const categorizedSpecs = computed(() => {
  if (!product.value) return {}

  try {
    const specs = JSON.parse(product.value.specs || '{}')
    const category = route.params.category as string
    const mapping = specCategoriesMap[category] || {}

    const result: Record<string, string[]> = {}
    const usedKeys = new Set<string>()

    for (const [section, keys] of Object.entries(mapping)) {
      const presentKeys = keys.filter(key => specs[key] !== undefined)
      if (presentKeys.length > 0) {
        result[section] = presentKeys
        presentKeys.forEach(key => usedKeys.add(key))
      }
    }

    // Добавим оставшиеся поля в "Дополнительно"
    const remaining = Object.keys(specs).filter(k => !usedKeys.has(k))
    if (remaining.length > 0) {
      result['Дополнительно'] = remaining
    }

    return result
  } catch {
    return {}
  }
})

const categorizedComponentSpecs = (component: ConfigurationComponent) => {
  try {
    const specs = JSON.parse(component.specs || '{}');
    const typeMap = specTypeMap[component.type_product];
    if (!typeMap) return { typeName: 'Неизвестно', sections: {} };

    const [typeName] = Object.keys(typeMap);
    const mapping = typeMap[typeName] || {};

    const result: Record<string, string[]> = {};
    const usedKeys = new Set<string>();

    for (const [section, keys] of Object.entries(mapping)) {
      const presentKeys = keys.filter(key => specs[key] !== undefined);
      if (presentKeys.length > 0) {
        result[section] = presentKeys;
        presentKeys.forEach(key => usedKeys.add(key));
      }
    }

    const remaining = Object.keys(specs).filter(k => !usedKeys.has(k));
    if (remaining.length > 0) {
      result['Дополнительно'] = remaining;
    }

    // Возвращаем и название типа, и секции
    return { typeName, sections: result };
  } catch {
    return { typeName: 'Неизвестно', sections: {} };
  }
};

onMounted(() => {
  fetchProduct(route.params.category as string, route.params.id as string)
})

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
        <ProductImageViewer
            ref="imageViewerRef"
            :imageName="product.name_components"
            :alt="product.name_components"
            class="product-image"
            :category="product.category"
        />

        <div class="product-details">
          <ul class="mb10">
            <li v-for="field in specFields.slice(0, 8)" :key="field">
              <span class="field-label ">{{ formatLabel(field) }}:</span> {{ getSpecValue(product.specs, field) }}
            </li>
          </ul>

          <button @click="scrollToSpecs" class="button-text field-label button-specs">
            Все характеристики ↓
          </button>
        </div>

        <div class="product-price">
          <div class="price">{{ formatPrice(product.price) }} ₽</div>
          <AddToCartButton
              :id="product.id_components"
              :name="product.name_components"
              :price="product.price"
              :image="imageViewerRef?.imageSrc"
              :category="product.category"
              :type="'component'"
          />
        </div>
      </div>

      <!-- Характеристики внизу -->
      <div ref="allSpecsSection" class="all-specs-section">
        <h2 class="h2">Все характеристики</h2>
        <div
            v-for="(fields, category) in categorizedSpecs"
            :key="category"
            class="spec-category"
        >
          <h2 class="h3 features-title">{{ category }}</h2>
          <ul class="spec-list">
            <li v-for="field in fields" :key="field" class="spec-row">
              <span class="field-label">{{ formatLabel(field) }}:</span>
              <span class="field-value">{{ getSpecValue(product.specs, field) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>




    <div v-else-if="configuration && configuration.length" class="product-page-container">
      <h1 class="h1 product-title">{{ configuration[0].name_configuration }}</h1>

      <div class="product-page">
        <ProductImageViewer
            ref="imageViewerRef"
            :imageName="configuration[0].name_configuration"
            :alt="configuration[0].name_configuration"
            class="product-image"
            :category="configuration[0].category"
        />

        <div class="product-details">
          <ul class="mb10">
            <li v-for="component in configuration" :key="component.id_component">
              <span class="field-label ">{{ formatLabel(component.name_components)}}</span>
            </li>
          </ul>

          <button @click="scrollToSpecs" class="button-text field-label button-specs">
            Все характеристики ↓
          </button>
        </div>

        <div class="product-price">
          <div class="price">{{ formatPrice(configuration[0].price_configuration) }} ₽</div>
          <AddToCartButton
              :image="imageViewerRef?.imageSrc"
              :id="configuration[0].id_configuration"
              :name="configuration[0].name_configuration"
              :price="configuration[0].price_configuration"
              :category="configuration[0].category"
              :type="'configuration'"
          />
        </div>

      </div>


      <!-- Характеристики внизу -->
      <div ref="allSpecsSection" class="all-specs-section">
        <div v-for="component in configuration" :key="component.id_component">
          <div class="component-details">
            <!-- Получаем название комплектующего -->
            <h3 class="component-spec-title h3">
              {{
                Object.keys(
                    specTypeMap[component.type_product] || { 'Неизвестно': {} }
                )[0]
              }}
            </h3>
            <div
                v-for="(fields, category) in (() => {
          // Берём первый (и единственный) ключ — это название типа (например, 'процессор')
          const typeMap = specTypeMap[component.type_product];
          if (!typeMap) return {};
          const [typeName] = Object.keys(typeMap);
          return typeMap[typeName] || {};
        })()"
                :key="category"
                class="spec-category"
            >
              <h4 class="h4 component-spec-title">{{ category }}</h4>
              <ul class="component-spec-list">
                <li v-for="field in fields" :key="field" class="spec-row">
                  <span class="field-label">{{ formatLabel(field) }}:</span>
                  <span class="field-value">{{ JSON.parse(component.specs || '{}')[field] || '—' }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>


    <div v-else>
      <p>Товар не найден.</p>
    </div>
  </div>
</template>



