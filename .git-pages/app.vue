<script setup lang="ts">
// ================ 多语言 ==================
const { setLocale } = useI18n()
const globalStore = useGlobal()
setLocale(globalStore.state.locale.value)
watch(globalStore.state.locale, (v) => {
  setLocale(v)
})
</script>

<template>
  <NuxtPage />
</template>
