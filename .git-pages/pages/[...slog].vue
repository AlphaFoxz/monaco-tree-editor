<script setup lang="ts">
const globalStore = useGlobal()
//====================== 主题 ======================
const layoutName = globalStore.state.layoutName
watch(layoutName, (v) => {
  globalStore.action.updateLayoutName(v)
})
const colorMode = useColorMode()
const existColorMode = window.localStorage.getItem('config.colorMode') || 'light'
colorMode.preference = existColorMode
watch(
  () => colorMode.preference,
  (n, o) => {
    if (n === o) {
      return
    }
    window.localStorage.setItem('config.colorMode', n)
  }
)
//====================== 布局 ======================
function onresize(_evt?: Event) {
  const isMobile = window.matchMedia('(max-width: 1024px)').matches
  const isPad = window.matchMedia('(max-width: 1280px)').matches
  if (isMobile) {
    globalStore.action.updateLayoutName('mobile')
  } else if (isPad) {
    globalStore.action.updateLayoutName('pad')
  } else {
    globalStore.action.updateLayoutName('pc')
  }
}
window.onresize = onresize
onresize()
</script>
<template>
  <NuxtLayout :name="layoutName">
    <DefaultContentDoc />
  </NuxtLayout>
</template>
