<script setup lang="ts">
import Select from 'primevue/select'

const globalStore = useGlobal()
const currentLocale = ref(globalStore.state.locale.value)
const options = ref(useRuntimeConfig().public.NUXT_APP_LOCALE_LIST)
watch(currentLocale, (v) => {
  globalStore.action.updateLocale(v)
})
</script>

<template>
  <Select v-model="currentLocale" :options="options" option-label="name" option-value="code"></Select>
</template>

<style scoped lang="scss">
.p-select {
  height: 100%;
  width: 8rem;
}
</style>
