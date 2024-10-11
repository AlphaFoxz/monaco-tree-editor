<script setup lang="ts">
const globalStore = useGlobal()
const router = useRouter()
if (globalStore.state.locale.value === 'zh') {
  router.replace({ path: '/zh/' })
} else {
  router.replace({ path: '/en/' })
}
</script>
<template></template>
