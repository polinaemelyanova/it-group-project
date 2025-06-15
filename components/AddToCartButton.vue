<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'

interface Props {
  id: number
  name: string
  price: number
  category: string
  image?: string
}

const props = defineProps<Props>()

const cart = useCartStore()
const router = useRouter()

const isInCart = computed(() => {
  return cart.items.some(item => item.id === props.id && item.category === props.category)
})

function handleClick() {
  if (!isInCart.value) {
    cart.addItem({
      id: props.id,
      name: props.name,
      price: props.price,
      quantity: 1,
      category: props.category,
      type: props.category !== 'pc'? 'component' : 'configuration',
      image: props.image || '/images/components/placeholder.png',
    })
  } else {
    router.push('/cart')
  }
}
</script>

<template>
  <button @click="handleClick" class="button button-cart">
    {{ isInCart ? 'Оформить заказ' : 'В корзину' }}
  </button>
</template>

<style scoped>
.button-cart {
  margin-top: 10px;
}
</style>
