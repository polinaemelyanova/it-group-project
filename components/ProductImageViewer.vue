<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  imageName: string
  alt?: string
  disableModal?: boolean // <--- новый проп
}

const props = defineProps<Props>()

const availableExtensions = ['png', 'jpg', 'jpeg', 'webp']
const emit = defineEmits<{ (e: 'loaded', src: string): void }>()
const imageSrc = ref<string | undefined>(undefined)
const showModal = ref(false)

const basePath = '/images/components/'

const checkImageExists = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = url
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
  })
}


const findValidImage = async () => {
  for (const ext of availableExtensions) {
    const url = `${basePath}${props.imageName}.${ext}`
    if (await checkImageExists(url)) {
      imageSrc.value = url
      return
    }
  }
  imageSrc.value = '/images/components/placeholder.png' // дефолт
}

onMounted(() => {
  findValidImage()
})

const openModal = () => {
  if (props.disableModal) return
  if (imageSrc.value) {
    showModal.value = true
    document.body.classList.add('no-scroll')
  }
}

const closeModal = () => {
  showModal.value = false
  document.body.classList.remove('no-scroll')  // Восстановить прокрутку
}

defineExpose({
  imageSrc,
})
</script>

<template>
  <div>
    <img
        :src="imageSrc"
        :alt="props.alt || 'Product Image'"
        @click="openModal"
        style="cursor: pointer;"
    />

    <transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <button class="modal-close" @click="closeModal">×</button>
        <div class="modal-content">
          <img :src="imageSrc" :alt="props.alt || 'Product Image Large'" />
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95); /* почти белый фон */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.no-scroll {
  overflow: hidden;
  height: 100%;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

.modal-content img {
  max-width: 700px;
  max-height: 100%;
  border-radius: 4px;
}

.modal-close {
  position: fixed;
  top: 10px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 2.5rem;
  color: black;
  cursor: pointer;
  z-index: 1100; /* выше модалки */
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>



