<template>
  <div class="container checkout-container">
    <h1 class="h1">Оформление заказа</h1>

    <div v-if="cart.items.length === 0">
      <p>Ваша корзина пуста. <NuxtLink to="/catalog" class="link">Перейти в каталог</NuxtLink></p>
    </div>

    <div v-else class="order-container">
      <form @submit.prevent="submitOrder" class="checkout-form">
        <div class="order__fields">

          <div class="city-autocomplete">
            <label>
              Город доставки
              <input
                  v-model="city"
                  @input="onCityInput"
                  @focus="showCitySuggestions = true"
                  @blur="hideCitySuggestionsWithDelay"
                  placeholder="Введите город"
                  required
              />
            </label>
            <ul v-if="showCitySuggestions && citySuggestions.length" class="suggestions">
              <li
                  v-for="s in citySuggestions"
                  :key="s"
                  @mousedown.prevent="selectCity(s)"
              >
                {{ s }}
              </li>
            </ul>
          </div>

          <label>
            Способ доставки
            <DeliveryMethod v-model="deliveryMethod" :options="deliveryOptions" />
          </label>

          <div class="city-autocomplete" v-if="pickupSelect">
            <label>
              Адрес доставки:
              <input
                  v-model="address"
                  @input="onAddressInput"
                  @focus="showSuggestions = true"
                  @blur="hideSuggestionsWithDelay"
                  placeholder="Введите адрес"
                  required
              />
            </label>
            <ul v-if="showSuggestions && suggestions.length" class="suggestions">
              <li
                  v-for="s in suggestions"
                  :key="s"
                  @mousedown.prevent="selectAddress(s)"
              >
                {{ s }}
              </li>
            </ul>
          </div>

          <label>
            Данные получателя
            <input v-model="name" placeholder="ФИО" required />
            <div class="combined-fields">
              <input v-model="phone" ref="phoneInput" placeholder="+7 (___) ___-__-__" type="tel" required />
              <input v-model="email" type="email" placeholder="Электронная почта" required />
            </div>
          </label>

          <label>
            Способы оплаты
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
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import debounce from 'lodash/debounce'
import IMask from 'imask'

const phoneInput = ref<HTMLInputElement | null>(null)

const cart = useCartStore()
const router = useRouter()

const name = ref('')
const phone = ref('')
const email = ref('')
const address = ref('')
const city = ref('')
const comment = ref('')

const suggestions = ref<string[]>([])
const showSuggestions = ref(false)
const citySuggestions = ref<string[]>([])
const showCitySuggestions = ref(false)

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
  { value: 'cash', title: 'Картой или наличными', description: 'Оплата при получении курьеру и самовывозе из пункта выдачи.' },
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

const pickupSelect = computed(() => deliveryMethod.value === 'courier')

async function fetchSuggestions(query: string) {
  if (query.length < 3 || !city.value.trim()) {
    suggestions.value = []
    return
  }

  const token = '514e40c7c0d47f9926ce6531eaa563c8f489f7a9'
  const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({
      query: `${city.value}, ${query}`,
      from_bound: { value: 'street' },
      // to_bound: { value: 'house' }, // старый вариант — убираем или меняем
      to_bound: { value: 'flat' } // расширяем до квартир
    })
  })

  const data = await response.json()
  suggestions.value = data.suggestions.map((s: any) => s.value)
}


async function fetchCitySuggestions(query: string) {
  if (query.length < 3) {
    citySuggestions.value = []
    return
  }

  const token = '514e40c7c0d47f9926ce6531eaa563c8f489f7a9'
  const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({
      query,
      locations: [{ country: 'Россия' }],
      from_bound: { value: 'city' },
      to_bound: { value: 'city' }
    })
  })

  const data = await response.json()
  citySuggestions.value = data.suggestions.map((s: any) => s.value)
}

const fetchSuggestionsDebounced = debounce(fetchSuggestions, 1000)
const fetchCitySuggestionsDebounced = debounce(fetchCitySuggestions, 500)

function onAddressInput() {
  showSuggestions.value = true
  fetchSuggestionsDebounced(address.value)
}

function onCityInput() {
  showCitySuggestions.value = true
  fetchCitySuggestionsDebounced(city.value)
}

function selectAddress(val: string) {
  address.value = val
  showSuggestions.value = false
}

function selectCity(val: string) {
  city.value = val
  showCitySuggestions.value = false
}

function hideSuggestionsWithDelay() {
  window.setTimeout(() => (showSuggestions.value = false), 200)
}

function hideCitySuggestionsWithDelay() {
  window.setTimeout(() => (showCitySuggestions.value = false), 200)
}

function submitOrder() {
  alert('Спасибо за заказ!')
  cart.clear()
  router.push('/')
}

onMounted(() => {
  if (phoneInput.value) {
    IMask(phoneInput.value, {
      mask: '+{7} (000) 000-00-00'
    })
  }
})
</script>
