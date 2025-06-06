<script setup lang="ts">
// Импортируем стор корзины
import { useCartStore } from '@/stores/cart'
import { computed } from 'vue'

// Получаем доступ к стору
const cart = useCartStore()

// Функция для удаления товара
function removeFromCart(id: number) {
  cart.removeItem(id)
}

// Функция для очистки корзины
function clearCart() {
  cart.clear()
}
</script>

<template>
  <div class="container">
    <h1>Корзина</h1>
    <button @click="clearCart" class="button-text cart__button-clear">Очистить корзину</button>

    <div v-if="cart.items.length === 0">
      <p>Корзина пуста.</p>
    </div>

    <div v-else class="cart-container">
      <div class="cart__table"></div>
        <table class="cart-table" border="1" cellpadding="8" cellspacing="0">
          <thead>
          <tr>
            <th>Изображение</th>
            <th>Название</th>
            <th>Цена за шт.</th>
            <th>Количество</th>
            <th>Итого</th>
            <th>Действия</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in cart.items" :key="item.id">
            <td>
              <img
                  :src="item.image"
                  :alt="item.name"
                  class="cart-image"
              />
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.price.toLocaleString('ru-RU') }} ₽</td>
            <td>{{ item.quantity }}</td>
            <td>{{ (item.price * item.quantity).toLocaleString('ru-RU') }} ₽</td>
            <td>
              <button @click="removeFromCart(item.id)">Удалить</button>
            </td>
          </tr>
          </tbody>
        </table>

      <div class="cart-summary" style="margin-top: 20px;">
        <h3 class="h3">Ваш заказ</h3>
        <div><strong>Всего товаров:</strong> {{ cart.totalCount }}</div>
        <div><strong>Общая сумма:</strong> {{ cart.totalPrice.toLocaleString('ru-RU') }} ₽</div>

        <button class="button">Оформить заказ</button>
      </div>


    </div>
  </div>
</template>


