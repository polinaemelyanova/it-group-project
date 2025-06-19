<script setup lang="ts">
// Импортируем стор корзины
import {useCartStore} from '@/stores/cart'
import {computed} from 'vue'
import {useRouter} from 'vue-router'

// Получаем доступ к стору
const cart = useCartStore()
const router = useRouter()

// Функция для удаления товара
function removeFromCart(id: number) {
  cart.removeItem(id)
}

// Функция для очистки корзины
function clearCart() {
  cart.clear()
}

function increaseQuantity(id: number) {
  cart.increaseQuantity(id)
}

function decreaseQuantity(id: number) {
  cart.decreaseQuantity(id)
}

// переход на страницу оформления заказа
function goToCheckout() {
  router.push('/checkout')
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="container">
    <h1 class="h1">Корзина</h1>
    <button v-if="cart.items.length > 0" @click="clearCart" class="button-text cart__button-clear">Очистить корзину
    </button>


    <div style="display: flex; justify-content: center; flex-direction: column; align-items: center;"
         v-if="cart.items.length === 0">
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h1 class="h2">Ваша корзина пуста</h1>
        <p>Чтобы оформить заказ, добавьте товары в корзину.</p>
        <img src="../public/images/cart-background.png" alt=""
             style="background: none; width: 200px; margin-block: 50px;">
        <button @click="goHome" class="button">Вернуться на главную</button>
      </div>
    </div>

    <div v-else class="cart-container">
      <div class="cart__rows">
        <div
            v-for="item in cart.items"
            :key="item.id"
            class="cart__row"
        >
          <div class="cart__cell image">
            <NuxtLink :to="{
              path: `/catalog/${item.category}/${item.id}`,
              query: { caseName: item.caseName }
            }">
              <ProductImageViewer
                  v-if="(item.type === 'configuration') && (item.type_configuration === '0' || item.type_configuration === 0)"
                  :imageName="item.caseName"
                  category="case"
                  :alt="item.name"
                  className="cart-image"
              />
              <img
                  v-else
                  :src="item.image"
                  :alt="item.name"
                  class="cart-image"
              />
            </NuxtLink>
          </div>

          <div class="cart__cell name">
            <NuxtLink :to="`/catalog/${item.category}/${item.id}`" class="cart-link">
              {{ item.name }}
            </NuxtLink>
          </div>

          <div class="cart__cell quantity">
            <button @click="decreaseQuantity(item.id)" class="quantity-button" aria-label="Уменьшить количество"
                    :disabled="item.quantity <= 1">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon-minus" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>

            <span class="quantity-value">{{ item.quantity }}</span>

            <button @click="increaseQuantity(item.id)" class="quantity-button" aria-label="Увеличить количество">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon-plus" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>


          <div class="cart__cell total">
            {{ (item.price * item.quantity).toLocaleString('ru-RU') }} ₽
          </div>

          <div class="cart__cell actions">
            <button @click="removeFromCart(item.id)" class="remove-button" aria-label="Удалить товар">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon-cross" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

      </div>


      <div class="cart-summary">
        <h3 class="h3">Ваш заказ</h3>
        <div class="cart-summary__item">Всего товаров: <span>{{ cart.totalCount }}</span></div>
        <div class="cart-summary__item">Общая сумма: <span>{{ cart.totalPrice.toLocaleString('ru-RU') }} ₽</span></div>

        <button class="button cart-summary__button" @click="goToCheckout">Оформить заказ</button>
      </div>
    </div>
  </div>
</template>



