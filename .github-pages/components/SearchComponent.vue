<script setup lang="ts">
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  mobile: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits({
  close: () => {},
})

const searchVisible = ref(props.show)
watch(searchVisible, (v) => {
  if (!v) {
    emits('close')
  }
})
watch(
  () => props.show,
  (v) => {
    searchVisible.value = v
  }
)
type MatchType = 'content' | 'title' | 'titles'
type ArrayItem<T> = T extends (infer U)[] ? U : never
type PromiseResult<T> = T extends Promise<infer U> ? U : never
type ComputedRefValue<T> = T extends ComputedRef<infer U> ? U : T
type SearchResults = ComputedRefValue<PromiseResult<ReturnType<typeof searchContent>>>
type SearchResult = ArrayItem<SearchResults>
type DisplayResult = {
  id: string
  title: string
  titleHtml: string
  matchType: MatchType
  content: string
  contentHtml?: string
  children?: DisplayResult[]
}
const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())
function getFolderTitle(path: string): string {
  path = path.replace(/#.*$/, '')
  for (const item of navigation.value!) {
    if (/^\/[^\/]+\/.+$/.test(path) && path.startsWith(item._path + '/')) {
      return item.title
    } else if (path === item._path) {
      return item.title
    }
  }
  return ''
}
function put(container: DisplayResult[], item: SearchResult) {
  for (const term of item.queryTerms) {
    const reg = new RegExp(term, 'ig')
    item.contentHtml = item.content.replace(reg, function (m: string) {
      return `<mark>${m}</mark>`
    })
    item.titleHtml = item.title.replaceAll(reg, function (m: string) {
      return `<mark>${m}</mark>`
    })
    item.titlesHtml = item.titles
    for (let i = 0; item.titles && i < item.titles.length; i++) {
      item.titlesHtml![i] = item.titles[i].replaceAll(reg, function (m: string) {
        return `<mark>${m}</mark>`
      })
    }
  }
  let matchType: MatchType | undefined = undefined
  {
    const t: MatchType[] = []
    for (const k of Object.keys(item.match)) {
      for (const m of item.match[k]) {
        t.push(m as MatchType)
      }
    }
    if (t.length === 0) {
      return
    }
    if (t.includes('content')) {
      matchType = 'content'
    } else if (t.includes('title')) {
      matchType = 'title'
    } else if (t.includes('titles')) {
      matchType = 'titles'
    }
  }
  if (matchType === 'content') {
    putContent(container, item)
  } else if (matchType === 'title') {
    putTitle(container, item)
  }
}
function putTitle(container: DisplayResult[], item: SearchResult) {
  const title = getFolderTitle(item.id)
  const child: DisplayResult = {
    id: item.id,
    title: item.titles ? item.titles.join('->') : item.title,
    titleHtml: item.titlesHtml ? item.titlesHtml!.join('->') : item.titleHtml!,
    matchType: 'title',
    content: item.title,
    contentHtml: item.titleHtml!,
  }
  for (const exist of container) {
    if (exist.title === title) {
      if (!exist.children) {
        exist.children = []
      }
      exist.children.push(child)
      return
    }
  }
  container.push({
    id: title,
    title,
    titleHtml: item.titleHtml!,
    matchType: 'title',
    content: item.contentHtml!,
    children: [child],
  })
}
function putContent(container: DisplayResult[], item: SearchResult) {
  const title = getFolderTitle(item.id)
  const child: DisplayResult = {
    id: item.id,
    title: item.titles ? item.titles.join('->') : item.title,
    titleHtml: item.titlesHtml ? item.titlesHtml.join('->') : item.titleHtml!,
    matchType: 'content',
    content: item.content,
    contentHtml: item.contentHtml,
  }
  for (const exist of container) {
    if (exist.title === title) {
      if (!exist.children) {
        exist.children = []
      }
      exist.children.push(child)
      return
    }
  }
  container.push({
    id: title,
    title,
    titleHtml: title,
    matchType: 'title',
    content: item.contentHtml!,
    children: [child],
  })
}
const search = ref('')

const results = await searchContent(search)
const displayResults = ref<DisplayResult[]>([])
watch(results, (v) => {
  const t: DisplayResult[] = []
  v.forEach((item) => {
    put(t, item)
  })
  displayResults.value = t
})
</script>

<template>
  <Dialog
    id="search-dialog"
    v-model:visible="searchVisible"
    modal
    :show-header="mobile"
    dismissableMask
    :class="`doc-search ${mobile ? 'mobile' : ''}`"
    :style="{
      width: mobile ? '100vw' : '35rem',
      height: mobile ? '100vh' : 'auto',
      borderRadius: mobile ? '0' : '1rem',
    }"
  >
    <template #header>
      <FloatLabel style="width: 100%">
        <InputText id="search-input" style="width: 100%" v-model="search" /><label for="search-input"
          >空格分隔可更好地进行模糊匹配</label
        >
      </FloatLabel>
    </template>
    <br />
    <FloatLabel v-if="!mobile" style="width: 100%">
      <InputText id="search-input" style="width: 100%" v-model="search" /><label for="search-input"
        >空格分隔可更好地进行模糊匹配</label
      >
    </FloatLabel>
    <div v-if="displayResults.length">
      <div v-for="lvl1 in displayResults" :key="lvl1.title">
        <div class="doc-search-hit-source">{{ lvl1.title }}</div>
        <Button
          v-if="lvl1.children"
          v-for="lvl2 in lvl1.children"
          class="doc-search-item"
          severity="secondary"
          :key="lvl2.id"
          raised
          :title="lvl2.content || lvl2.title"
          @click="
            () => {
              searchVisible = false
              $router.push(lvl2.id)
            }
          "
        >
          <i v-if="lvl2.matchType === 'content'" class="pi pi-bars"></i>
          <i v-else class="pi pi-hashtag"></i>
          <div class="doc-search-item-block">
            <div v-if="lvl2.contentHtml" v-html="lvl2.contentHtml" class="doc-search-item-content"></div>
            <div v-html="lvl2.titleHtml" class="doc-search-item-title"></div>
          </div>
        </Button>
      </div>
    </div>
    <div class="doc-search-empty" v-else><p>没有搜索结果</p></div>
  </Dialog>
</template>

<style lang="scss">
#search-dialog .p-dialog-content {
  border-radius: 1rem;
}
#search-dialog.mobile .p-dialog-content {
  margin-top: -44px;
}
.doc-search {
  top: 4rem;
  width: 35rem;
  mark {
    background: none;
    color: var(--docsearch-highlight-color);
  }
}
</style>
<style scoped lang="scss">
.doc-search {
  .doc-search-hit-source {
    color: var(--docsearch-highlight-color);
    font-size: 0.85em;
    font-weight: 600;
    line-height: 32px;
    margin: 0 -4px;
    padding: 8px 4px 0;
    position: sticky;
    top: 0;
    // z-index: 10;
  }
  .doc-search-item {
    width: 100%;
    margin-bottom: 4px;
    height: var(--docsearch-hit-height);
    i {
      margin-right: 8px;
    }
    .doc-search-item-block {
      width: 100%;
      text-align: left;
      color: var(--docsearch-hit-color);
    }
    .doc-search-item-title {
      font-size: 0.75em;
    }
    .doc-search-item-content {
      width: calc(100% - 24px);
      font-size: 0.9em;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .doc-search-empty {
    margin: 0 auto;
    padding: 36px 0;
    color: var(--docsearch-muted-color);
    p {
      font-size: 0.9em;
      text-align: center;
    }
  }
}
</style>
