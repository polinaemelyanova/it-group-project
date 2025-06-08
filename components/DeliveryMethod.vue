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

