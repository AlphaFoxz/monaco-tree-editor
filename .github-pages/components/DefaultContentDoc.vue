<script setup lang="ts">
import PanelMenu from 'primevue/panelmenu'
import Sidebar from 'primevue/sidebar'
const route = useRoute()

const globalStore = useGlobal()
//====================== 层 ======================
const layoutName = globalStore.state.layoutName
watch(layoutName, (v) => {
  globalStore.action.updateLayoutName(v)
})

//====================== TOC ======================
const tocVisible = globalStore.state.tocVisible
watch(tocVisible, (v) => {
  globalStore.action.updateTocVisible(v)
})
const tocItems = ref<any>([])
const expandedKeys = ref<{ [key: string]: boolean }>({})
const { toc } = useContent()

function initToc(tocValue: any): any {
  const result = []
  if (!tocValue) {
    return []
  }
  for (const item of tocValue) {
    const i: any = {
      key: item.id,
      label: item.text,
      command: () => {
        const element = document.getElementById(item.id)!
        const scroller = window.document.getElementsByClassName('ddd-doc')[0].parentElement!
        scroller.scrollTo(0, element.offsetTop)
      },
    }
    if (item.children) {
      i.items = initToc(item.children)
      expandedKeys.value[item.id] = true
    }
    result.push(i)
  }
  return result
}
onMounted(() => {
  tocItems.value = initToc(toc.value && toc.value.links)
})
watch(toc, (n, o) => {
  tocItems.value = initToc(toc.value && toc.value.links)
})

//====================== 锚点跳转 ======================
onMounted(() => {
  const scroller = window.document.getElementsByClassName('ddd-doc')[0].parentElement!
  if (route.hash) {
    const element = document.getElementById(route.hash.substring(1))
    if (element) {
      scroller.scrollTo(0, element.offsetTop)
    }
  } else {
    scroller.scrollTo(0, 0)
  }
})
</script>

<template>
  <main :style="{ width: layoutName === 'pc' ? 'calc(100% - 320px)' : '100%' }">
    <ContentDoc>
      <template #not-found>
        <p>
          {{ $t('contentDoc.notFound') }}: <b>{{ $router.currentRoute.value.fullPath }}</b>
        </p>
        <p>{{ $t('contentDoc.notFound.message1') }}</p>
        <p>{{ $t('contentDoc.notFound.message2') }}</p>
      </template>
      <template #empty>
        <p>{{ $t('contentDoc.empty') }}</p>
      </template>
    </ContentDoc>
  </main>
  <div v-if="layoutName === 'pc'" class="toc">
    <p class="title">{{ $t('toolbar.onThisPage') }}</p>
    <PanelMenu
      theme="dark"
      :expandedKeys="expandedKeys"
      :model="tocItems"
      style="margin-top: 10px; width: 300px"
    ></PanelMenu>
  </div>
  <Sidebar
    v-else
    v-model:visible="tocVisible"
    :header="$t('toolbar.onThisPage')"
    position="right"
    @click="tocVisible = false"
    ><PanelMenu
      theme="dark"
      :expandedKeys="expandedKeys"
      :model="tocItems"
      style="margin-top: 10px; width: 300px"
    ></PanelMenu
  ></Sidebar>
</template>

<style lang="scss">
.toc {
  * {
    background: none !important;
  }
}
</style>
<style scoped lang="scss">
main {
  width: calc(100% - 320px);
}
.toc {
  position: fixed;
  top: 3rem;
  right: 32px;
  width: 320px;
  height: 100%;
  * {
    background: none !important;
  }
  .title {
    font-weight: bold;
  }
}
</style>
