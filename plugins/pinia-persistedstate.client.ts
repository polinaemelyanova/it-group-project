import { defineNuxtPlugin } from '#app'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import type { PiniaPluginContext, Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
    // Приводим тип явно к Pinia
    const pinia = nuxtApp.$pinia as Pinia | undefined
    if (pinia) {
        pinia.use(piniaPluginPersistedstate as (context: PiniaPluginContext) => void)
    }
})
