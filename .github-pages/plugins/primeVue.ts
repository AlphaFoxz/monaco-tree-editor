import { usePrimeVue } from 'primevue/config'
import Aura from '@primevue/themes/aura'

export default defineNuxtPlugin((nuxtApp) => {
  const PrimeVue = usePrimeVue()
  PrimeVue.config.theme = {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark-mode',
      cssLayer: false,
    },
  }
})
