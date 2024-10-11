<script setup lang="ts">
import Button from 'primevue/button'
import ToggleButton from 'primevue/togglebutton'
import Sidebar from 'primevue/sidebar'

const globalStore = useGlobal()
//====================== 主题 ======================
const colorMode = useColorMode()
const lightTheme = ref(colorMode.value === 'light')
watch(lightTheme, (v) => {
  if (v) {
    colorMode.preference = 'light'
  } else {
    colorMode.preference = 'dark'
  }
})

//====================== 导航 ======================
const navVisible = ref(false)

//====================== 搜索 ======================
const searchVisible = ref(false)

//====================== toc ======================
</script>

<template>
  <div class="root">
    <div class="header">
      <SearchComponent mobile :show="searchVisible" @close="searchVisible = false"></SearchComponent>
      <Button
        icon="pi pi-align-center"
        style="height: 3rem"
        severity="secondary"
        :label="$t('toolbar.menu')"
        @click="navVisible = true"
      ></Button>
      <Button icon="pi pi-search" style="height: 3rem" @click="searchVisible = true"></Button>
      <ToggleButton
        style="height: 3rem"
        v-model="lightTheme"
        :onLabel="$t('toolbar.theme.light')"
        :offLabel="$t('toolbar.theme.dark')"
      ></ToggleButton>
      <DefaultLanguageSwitcher></DefaultLanguageSwitcher>
      <Button
        icon="pi pi-align-center"
        style="height: 3rem; float: right; z-index: 1"
        severity="secondary"
        :label="$t('toolbar.onThisPage')"
        @click="globalStore.action.updateTocVisible(true)"
      ></Button>
    </div>
    <div class="container">
      <Sidebar v-model:visible="navVisible">
        <aside class="sider">
          <DefaultI18nNavigation @click="navVisible = false"></DefaultI18nNavigation>
        </aside>
      </Sidebar>
      <div class="ddd-doc">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ddd-doc pre.shiki {
  margin: 14px -24px;
  border-radius: unset;
}
.ddd-doc {
  -webkit-overflow-scrolling: touch;
}
.header {
  height: 3rem;
  width: 100%;
  top: 0;
  position: relative;
}
.container {
  position: fixed;
  right: 0;
  padding: 32px 24px 96px;
  width: 100%;
  /* padding-left: calc(100% - var(--nuxtcontent-sidebar-width-small)); */
  max-height: calc(100vh - 3rem);
  overflow-y: scroll;
}
</style>
<style scoped lang="scss">
.sider {
  top: calc(var(--nuxtcontent-nav-height) + var(--nuxtcontent-banner-height, 0px));
  z-index: 1;
  height: 100%;
  opacity: 1;
  visibility: visible;
  box-shadow: none;
  transform: translate(0);
  transition:
    border-color 0.25s,
    background-color 0.25s;
  overflow-y: auto;
}
</style>
