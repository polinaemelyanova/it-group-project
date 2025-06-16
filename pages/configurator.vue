<template>
  <div class="container">
    <div class="configurator-container">
      <div class="components-list">
        <h2>Системный блок</h2>
        <p class="required-note">* Обязательные комплектующие</p>
        <ul>
          <li v-for="(component, index) in components" :key="index" class="component-item">
            <div class="component-icon">
              <img :src="component.icon" :alt="component.name" />
            </div>
            <div class="component-info">
              <span class="component-name">{{ component.name }}<span v-if="component.required">*</span></span>
              <span class="component-count">{{ component.count }} товаров</span>
            </div>

            <button @click="openModal(component.category)">
              + Добавить
            </button>
          </li>
        </ul>
      </div>

      <div class="summary">
        <div class="progress-ring">
          <div class="circle">
            <span>Добавьте комплектующие</span>
          </div>
        </div>
        <div class="total-cost">
          <span>Итого стоимость ПК:</span>
          <span class="cost">0 ₽</span>
        </div>
        <button class="build-button">Собрать</button>
      </div>
    </div>

    <!-- Модальное окно теперь вне основного контейнера -->
    <Teleport to="body">
      <Modal
          v-if="isModalOpen"
          :category="selectedCategory"
          @close="closeModal"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Teleport } from 'vue';
import Modal from '@/components/Modal.vue';

const isModalOpen = ref(false);
const selectedCategory = ref('');

const components = ref([
  { name: 'Процессор', count: 168, icon: '/icons/icon_cpu.svg', category: 'cpu', required: true },
  { name: 'Охлаждение', count: 257, icon: '/icons/icon_cooling.svg', category: 'cooling', required: false },
  { name: 'Материнская плата', count: 211, icon: '/icons/icon_motherboard.svg', category: 'motherboard', required: true },
  { name: 'Оперативная память', count: 306, icon: '/icons/icon_ram.svg', category: 'ram', required: true },
  { name: 'SSD', count: 160, icon: '/icons/icon_ssd.svg', category: 'ssd', required: false },
  { name: 'Жёсткий диск', count: 42, icon: '/icons/icon_hdd.svg', category: 'hdd', required: false },
  { name: 'Видеокарта', count: 235, icon: '/icons/icon_gpu.svg', category: 'gpu', required: false },
  { name: 'Блок питания', count: 235, icon: '/icons/icon_psu.svg', category: 'psu', required: false },
  { name: 'Корпус', count: 235, icon: '/icons/icon_case.svg', category: 'case', required: false },
]);

const openModal = (category) => {
  selectedCategory.value = category;
  isModalOpen.value = true;
  document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
};

const closeModal = () => {
  isModalOpen.value = false;
  document.body.style.overflow = ''; // Восстанавливаем прокрутку
};
</script>

<style scoped>
.container {
  position: relative;
}

.configurator-container {
  display: flex;
  gap: 2rem;
  font-family: Arial, sans-serif;
}

.components-list {
  flex: 1;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}

.required-note {
  color: red;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.component-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.component-icon img {
  width: 40px;
}

.component-info {
  flex: 1;
  margin-left: 1rem;
}

.component-name {
  font-weight: bold;
}

.component-count {
  display: block;
  font-size: 0.9rem;
  color: #555;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #0056b3;
}

.summary {
  width: 300px;
  text-align: center;
}

.progress-ring {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 150px;
  height: 150px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  font-size: 0.9rem;
  color: #555;
}

.total-cost {
  margin: 1rem 0;
  font-size: 1.2rem;
}

.cost {
  font-weight: bold;
  font-size: 1.4rem;
  color: #333;
}

.build-button {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  margin-bottom: 1rem;
  font-weight: bold;
  width: 100%;
  transition: background-color 0.2s;
}

.build-button:hover {
  background-color: #218838;
}

.build-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>