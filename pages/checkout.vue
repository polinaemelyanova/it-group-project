<template>
  <div class="container checkout-container">
    <h1 class="h1">Оформление заказа</h1>

    <div v-if="cart.items.length === 0">
      <p>Ваша корзина пуста. <NuxtLink to="/catalog" class="link">Перейти в каталог</NuxtLink></p>
    </div>

    <div v-else class="order-container">
      <form @submit.prevent="submitOrder" class="checkout-form">
        <div class="order__fields">
          <label>
            Город доставки
            <input v-model="city" placeholder="Введите город" required />
          </label>

          <label>
            Способ доставки
            <!-- Подключаем компонент выбора доставки -->
            <DeliveryMethod v-model="deliveryMethod" :options="deliveryOptions"/>
          </label>


          <label>
            Адрес доставки:
            <textarea v-model="address" placeholder="Введите адрес" required></textarea>
          </label>


          <label>
            Данные получателя
            <input v-model="name" placeholder="ФИО" required />
            <input v-model="phone" placeholder="Телефон" type="tel" required />
            <input v-model="email" type="email" placeholder="Электронная почта" required />
          </label>

          <label>
            Способы оплаты
            <!-- Подключаем компонент выбора оплаты -->
            <DeliveryMethod v-model="paymentMethod" :options="paymentOptions" />
          </label>

          <label>
            Комментарий к заказу
            <textarea class="order__comment" v-model="comment" placeholder="Ваш комментарий" required></textarea>
          </label>
        </div>

        <div class="order-summary">
          <div class="summary-row">
            <span class="summary-row__left">Ваши товары ({{ cart.totalCount }})</span>
            <span class="summary-row__right">{{ cart.totalPrice.toLocaleString('ru-RU') }} ₽</span>
          </div>

          <div class="summary-row">
            <span class="summary-row__left">Способ получения</span>
            <span class="summary-row__right">{{ selectedDeliveryMethodLabel }}</span>
          </div>

          <hr class="divider" />

          <div class="summary-total">
            <span>Итого к оплате:</span>
            <span>{{ cart.totalPrice.toLocaleString('ru-RU') }} ₽</span>
          </div>

          <button type="submit" class="button confirm-button">Подтвердить заказ</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'

const cart = useCartStore()
const router = useRouter()

const name = ref('')
const phone = ref('')
const email = ref('')
const address = ref('')
const city = ref('')
const comment = ref('')

const deliveryMethod = ref('courier')
const paymentMethod = ref('card')

const deliveryOptions = [
  {
    value: 'courier',
    title: 'Доставка до двери (ТК)',
    description: 'от 380 ₽ / до 4 дней'
  },
  {
    value: 'pickup',
    title: 'Самовывоз',
    description: 'г. Нижний Новгород, Дзержинского ул., д. 7, 2 этаж, пав 157'
  }
]

const paymentOptions = [
  { value: 'card', title: 'Картой онлайн', description: 'После оформления заказа вы перейдете на платежную страницу для завершения оплаты' },
  { value: 'cash', title: 'Наличные курьеру', description: 'Оплата при получении курьеру и самовывозе из пункта выдачи.' },
  { value: 'bank', title: 'Безналичный расчет', description: 'Для юр. лиц и ИП' }
]


const selectedDeliveryMethodLabel = computed(() => {
  switch (deliveryMethod.value) {
    case 'pickup':
      return 'Самовывоз'
    case 'courier':
      return 'Доставка транспортной компанией'
    default:
      return 'Не выбран'
  }
})



function submitOrder() {
  // Здесь можно сделать отправку заказа на сервер (POST запрос)
  alert('Спасибо за заказ!')

  // Очистить корзину
  cart.clear()

  // Перенаправить на главную или страницу благодарности
  router.push('/')
}
</script>

<style scoped>


</style>
