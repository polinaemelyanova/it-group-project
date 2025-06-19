import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Тип для товара в корзине
export interface CartItem {
    id: number
    name: string
    price: number
    quantity: number
    category: string
    image?: string // для обычных комплектующих
    type: 'component' | 'configuration'
    type_configuration?: number
    caseName?: string // для сборок ПК
}

// Определяем стор корзины с помощью setup-стиля
export const useCartStore = defineStore('cart', () => {
    // 1. Состояние — реактивный массив товаров
    const items = ref<CartItem[]>([])

    // 2. Геттеры — вычисляемые свойства, которые считаем из состояния
    // Общее количество товаров в корзине
    const totalCount = computed(() =>
        items.value.reduce((sum, item) => sum + item.quantity, 0)
    )

    // Общая цена всех товаров в корзине
    const totalPrice = computed(() =>
        items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    )


    // 3. Действия — функции для изменения состояния корзины

    // Добавить товар в корзину
    function addItem(item: CartItem) {

        // Ищем, есть ли уже такой товар в корзине
        const existing = items.value.find(i => i.id === item.id && i.category === item.category)
        if (existing) {
            // Если есть, увеличиваем количество
            existing.quantity += item.quantity
        } else {
            // Если нет — добавляем новый товар
            items.value.push(item)
        }
    }

    // Удалить товар по id
    function removeItem(id: number) {
        items.value = items.value.filter(i => i.id !== id);
    }

// Очистить корзину
    function clear() {
        items.value = [];
    }

// Увеличить количество товара по id
    function increaseQuantity(id: number) {
        const item = items.value.find(i => i.id === id);
        if (item) {
            item.quantity = (item.quantity ?? 0) + 1;
        }
    }

// Уменьшить количество товара по id
    function decreaseQuantity(id: number) {
        const item = items.value.find(i => i.id === id);
        if (item) {
            if ((item.quantity ?? 1) > 1) {
                item.quantity = item.quantity - 1;
            } else {
                // Если количество стало 1 и нужно уменьшить — удаляем товар из корзины
                removeItem(id);
            }
        }
    }


    // 4. Возвращаем все, что хотим использовать вне стора
    return {
        items,
        totalCount,
        totalPrice,
        addItem,
        removeItem,
        clear,
        increaseQuantity, // ← добавлено
        decreaseQuantity  // ← добавлено
    }
}, {
    persist: true, // Включаем сохранение в localStorage
})
