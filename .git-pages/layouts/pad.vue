<script setup lang="ts">
import ScrollPanel from 'primevue/scrollpanel'
import Button from 'primevue/button'
import ToggleButton from 'primevue/togglebutton'

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

//====================== 搜索 ======================
const searchVisible = ref(false)

//====================== toc ======================
</script>

<template>
  <div class="root">
    <div class="header">
      <SearchComponent :show="searchVisible" @close="searchVisible = false"></SearchComponent>
      <Button
        icon="pi pi-search"
        style="height: 3rem"
        :label="$t('toolbar.search')"
        @click="searchVisible = true"
      ></Button>
      <ToggleButton
        style="height: 3rem"
        v-model="lightTheme"
        :onLabel="$t('toolbar.theme.light')"
        :offLabel="$t('toolbar.theme.dark')"
      ></ToggleButton>
      <DefaultLanguageSwitcher></DefaultLanguageSwitcher>
      <Button
        icon="pi pi-align-center"
        style="height: 3rem; float: right"
        severity="secondary"
        :label="$t('toolbar.onThisPage')"
        @click="globalStore.action.updateTocVisible(true)"
      ></Button>
    </div>
    <div class="container">
      <aside class="sider">
        <DefaultI18nNavigation></DefaultI18nNavigation>
      </aside>
      <ScrollPanel
        style="
          position: absolute;
          right: 0;
          width: calc(100% - var(--nuxtcontent-sidebar-width-small));
          height: calc(100vh - 3rem);
        "
        :pt="{
          wrapper: {
            style: { 'border-right': '10px solid var(    --gray-300)' },
          },
          bary: 'hover:bg-primary-400 bg-primary-300 opacity-100',
        }"
      >
        <div class="ddd-doc">
          <slot></slot>
        </div>
      </ScrollPanel>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ddd-doc {
  -webkit-overflow-scrolling: touch;
}
.header {
  border-bottom: 1px solid var(--nuxtcontent-c-divider-light);
  height: 3rem;
  width: 100%;
  top: 0;
  position: relative;
}
.sider {
  border-right: 1px solid var(--nuxtcontent-c-divider-light);
  position: fixed;
  top: calc(var(--nuxtcontent-nav-height) + var(--nuxtcontent-banner-height, 0px));
  z-index: 1;
  width: var(--nuxtcontent-sidebar-width-small);
  height: calc(100vh - 3rem);
  max-width: 100%;
  opacity: 1;
  visibility: visible;
  box-shadow: none;
  transform: translate(0);
  transition:
    border-color 0.25s,
    background-color 0.25s;
  overflow-y: auto;
}
.ddd-doc {
  padding: 64px 64px 96px;
}
</style>
