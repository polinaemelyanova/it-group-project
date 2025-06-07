<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Option {
  value: string
  title: string
  description?: string
}

const props = defineProps<{
  options: Option[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function updateValue(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="selectable-options">
    <label
        v-for="option in options"
        :key="option.value"
        class="option"
        :class="{ active: modelValue === option.value }"
    >
      <input
          type="radio"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="updateValue(option.value)"
          class="hidden-input"
      />
      <div class="option-title">{{ option.title }}</div>
      <div v-if="option.description" class="option-description">
        {{ option.description }}
      </div>
    </label>
  </div>
</template>

<style scoped lang="scss">
.selectable-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
}

.option {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  flex: 1 1 0; // Каждый блок растягивается равномерно
  min-width: 0; // предотвращает переполнение

  &.active {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }

  .option-title {
    font-weight: 600;
  }

  .option-description {
    margin-top: 4px;
    color: #666;
    font-size: 14px;
  }

  .hidden-input {
    display: none;
  }
}
</style>
