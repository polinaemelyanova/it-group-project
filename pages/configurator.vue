<template>
  <div class="container">
    <div class="configurator-container">
      <div class="components-list">
        <h2>Системный блок</h2>
        <p class="required-note">* Обязательные комплектующие</p>
        <ul>
          <li
              v-for="(component, index) in components"
              :key="index"
              class="component-item"
          >
            <div class="component-icon">
              <img :src="component.icon" :alt="component.name"/>
            </div>
            <div class="component-info">
              <span class="component-name">
                {{ component.name }}
                <span v-if="component.required">*</span>
              </span>
              <span class="component-count">{{ categoryCounts[component.category] || 0 }} товаров</span>
            </div>
            <div class="configurator__component-title-price" v-if="configuratorComponents[component.category]">
              <div class="selected-component">
                <span class="selected-name">
                  {{ configuratorComponents[component.category].name_components }}
                </span>
                <span class="selected-price">
                  {{ formatPrice(configuratorComponents[component.category].price) }} ₽
                </span>
                <span class="selected-component__buttons">
                  <button class="icon-button" @click="openModal(component.category)">
                    <img src="/icons/arrows-couple.svg" alt="Заменить"/>
                  </button>
                  <button class="icon-button delete-button" @click="onRemoveComponent(component.category)">
                    <img src="/icons/cross.svg" alt="Удалить"/>
                  </button>
                </span>
              </div>
            </div>
            <template v-else>
              <button class="button add-button" @click="openModal(component.category)">
                + Добавить
              </button>
            </template>
          </li>
        </ul>
      </div>

      <div class="summary">
        <div class="progress-ring">
          <div class="circle">
            <span v-if="!hasRequiredComponents">Добавьте комплектующие</span>
            <span v-else>Готово к сборке!</span>
          </div>
        </div>
        <div class="total-cost">
          <span>Итого стоимость ПК: </span>
          <span class="cost">{{ formatPrice(totalPrice) }} ₽</span>
        </div>
        <button
            class="build-button button"
            :disabled="!hasRequiredComponents"
            @click="onBuild"
        >Собрать</button>
      </div>
    </div>

    <!-- Модальное окно теперь вне основного контейнера -->
    <Teleport to="body">
      <Modal
          v-if="isModalOpen"
          :category="selectedCategory"
          @close="closeModal"
          @add-component="onAddComponent"
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { Teleport } from 'vue';
import Modal from '@/components/Modal.vue';
import { useCartStore } from '@/stores/cart'

interface Component {
  name: string
  icon: string
  category: string
  required: boolean
}
interface ConfiguratorComponent {
  id_components: number
  name_components: string
  price: number
  specs?: string
  image?: string
  category?: string
}
type ConfiguratorComponentsMap = Record<string, ConfiguratorComponent>
type CategoryCountsMap = Record<string, number>

const router = useRouter()
const cart = useCartStore()

const isModalOpen = ref(false);
const selectedCategory = ref('');
const categoryCounts = ref<CategoryCountsMap>({});
const configuratorComponents = ref<ConfiguratorComponentsMap>({});

const components = ref<Component[]>([
  {name: 'Процессор', icon: '/icons/icon_cpu.svg', category: 'cpu', required: true},
  {name: 'Охлаждение', icon: '/icons/icon_cooling.svg', category: 'cooling', required: false},
  {name: 'Материнская плата', icon: '/icons/icon_motherboard.svg', category: 'motherboard', required: true},
  {name: 'Оперативная память', icon: '/icons/icon_ram.svg', category: 'ram', required: true},
  {name: 'SSD', icon: '/icons/icon_ssd.svg', category: 'ssd', required: false},
  {name: 'Жёсткий диск', icon: '/icons/icon_hdd.svg', category: 'hdd', required: false},
  {name: 'Видеокарта', icon: '/icons/icon_gpu.svg', category: 'gpu', required: false},
  {name: 'Блок питания', icon: '/icons/icon_psu.svg', category: 'psu', required: true},
  {name: 'Корпус', icon: '/icons/icon_case.svg', category: 'case', required: true},
]);

const requiredCategories = computed(() =>
    components.value.filter(c => c.required).map(c => c.category)
);

const hasRequiredComponents = computed(() =>
    requiredCategories.value.every(cat => !!configuratorComponents.value[cat])
);

const totalPrice = computed(() => {
  return Object.values(configuratorComponents.value)
      .reduce((sum, component) => sum + (Number((component as ConfiguratorComponent)?.price) || 0), 0);
});

const buildName = computed(() => {
  let cpu = configuratorComponents.value['cpu']?.name_components || '';
  let gpu = '';
  if (configuratorComponents.value['gpu']) {
    try {
      const specs = JSON.parse(configuratorComponents.value['gpu'].specs || '{}');
      gpu = specs.серия || specs.модель || '';
    } catch {
      gpu = configuratorComponents.value['gpu'].name_components || '';
    }
  }
  let ram = '';
  if (configuratorComponents.value['ram']) {
    try {
      const specs = JSON.parse(configuratorComponents.value['ram'].specs || '{}');
      const ramType = specs.тип || '';
      const ramSize = specs.объем || specs['объем памяти'] || '';
      ram = [ramType, ramSize].filter(Boolean).join(' ');
    } catch {
      ram = configuratorComponents.value['ram'].name_components || '';
    }
  }
  let ssd = '';
  if (configuratorComponents.value['ssd']) {
    try {
      const specs = JSON.parse(configuratorComponents.value['ssd'].specs || '{}');
      const ssdType = specs.тип || '';
      const ssdSize = specs.объем || specs['объем памяти'] || '';
      ssd = [ssdType, ssdSize].filter(Boolean).join(' ');
    } catch {
      ssd = configuratorComponents.value['ssd'].name_components || '';
    }
  }
  return [cpu, gpu, ram, ssd].filter(Boolean).join(', ');
});

const openModal = (category: string) => {
  selectedCategory.value = category;
  isModalOpen.value = true;
  document.body.style.overflow = 'hidden';
};

function onAddComponent(product: ConfiguratorComponent) {
  product.price = Number(product.price) || 0;
  if (product.category) {
    configuratorComponents.value[product.category] = product;
  }
  closeModal();
}

function onRemoveComponent(category: string) {
  delete configuratorComponents.value[category];
}

function formatPrice(price: number) {
  const num = Number(price);
  if (isNaN(num) || !isFinite(num)) return "0";
  return num.toLocaleString("ru-RU");
}

const closeModal = () => {
  isModalOpen.value = false;
  document.body.style.overflow = '';
};

async function fetchCategoryCount(category: string) {
  try {
    const response = await fetch(`http://my-api/configurator.php?category=${category}`);
    if (!response.ok) throw new Error("Ошибка загрузки количества");
    const data = await response.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

function addBuildToCart(configId: number, buildName: string, price: number, components: any[]) {
  // Используем картинку корпуса, если есть
  let caseImage = '/images/components/placeholder.png';
  if (configuratorComponents.value['case'] && configuratorComponents.value['case'].image) {
    caseImage = configuratorComponents.value['case'].image;
  }
  cart.addItem({
    id: configId,
    name: buildName,
    price: price,
    quantity: 1,
    category: 'pc',
    type: 'configuration',
    image: caseImage,
  })
  router.push('/cart')
}

onMounted(async () => {
  const counts: CategoryCountsMap = {};
  for (const component of components.value) {
    counts[component.category] = await fetchCategoryCount(component.category);
  }
  categoryCounts.value = counts;
});

const autoTypeConfiguration = computed(() => {
  const hasGPU = !!configuratorComponents.value['gpu'];
  const hasSSD = !!configuratorComponents.value['ssd'];
  const price = totalPrice.value;

  if (hasGPU && hasSSD && price > 45000 && price < 60000) {
    return 2;
  }
  if (hasGPU && hasSSD && price > 60001) {
    return 3;
  }
  return 1;
});

// --- СОЗДАНИЕ СБОРКИ, ОТПРАВКА НА БЭКЕНД, ДОБАВЛЕНИЕ В КОРЗИНУ И ПЕРЕНОС ---
async function onBuild() {
  if (!hasRequiredComponents.value) return;
  const buildData = {
    name_configuration: buildName.value || 'Компьютер',
    type_configuration: autoTypeConfiguration.value,
    price_configuration: totalPrice.value,
    components: Object.values(configuratorComponents.value).map((c: any) => ({
      id_component: c.id_components,
      quantity: 1
    })),
    specss: {}
  };
  const missingId = buildData.components.some((c: any) => !c.id_component);
  if (missingId) {
    alert('Некоторые компоненты не содержат id_components. Проверьте загрузку данных!');
    return;
  }
  try {
    const response = await fetch('http://my-api/send_configuration.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildData)
    });
    const result = await response.json();
    if (result.success && result.id_configuration) {
      addBuildToCart(
          result.id_configuration,
          buildName.value || 'Компьютер',
          totalPrice.value,
          buildData.components
      );
    } else {
      alert('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
    }
  } catch (e: any) {
    alert('Ошибка при отправке: ' + e.message);
  }
}
</script>