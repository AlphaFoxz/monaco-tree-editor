<script setup lang="ts">
import { onMounted, ref, watch, getCurrentInstance, type ComponentInternalInstance } from 'vue'
import TabItem from './TabItem.vue'
import './index.less'
import { useMonaco } from '../../monaco-store'
defineProps({
  rootEl: HTMLElement,
})
const emit = defineEmits({
  saveFile: (_path: string, _value?: string, _resolve?: () => void, _reject?: () => void) => true,
})

//========================= 初始化 init =========================
const monacoStore = useMonaco()
const openedFiles = ref(monacoStore.openedFiles)
const currentPath = ref('')
let instanceRef: ComponentInternalInstance | null
watch(
  () => monacoStore.openedFiles,
  (n) => {
    openedFiles.value = n
  }
)
watch(
  () => monacoStore.currentPath,
  (n) => {
    currentPath.value = n
  }
)
onMounted(() => {
  instanceRef = getCurrentInstance()
})

//========================= 回调 callback =========================
const handleSaveFile = (path: string, value: string, resolve?: () => void, reject?: () => void) => {
  emit('saveFile', path, value, resolve, reject)
}
const handlePathChange = (key: string) => {
  console.debug('pathChange', key)
  monacoStore.restoreModel(key)
}
const handleCloseFile = (path: string) => {
  monacoStore.closeFile(path)
}
const handleCloseOtherFiles = (path?: string) => {
  console.debug('handleCloseOtherFiles', path)
  if (!instanceRef) {
    return
  }
  Object.keys(instanceRef.refs).forEach((key) => {
    if (path === key) {
      return
    }
    const target = instanceRef?.refs[key] as any
    if (target) {
      target[0].tryClose()
    }
  })
}
</script>

<template>
  <div class="music-monaco-editor-opened-tab-wrapper">
    <div class="music-monaco-editor-opened-tab">
      <span v-for="(file, index) in openedFiles">
        <TabItem
          :rootEl="rootEl"
          :file="file"
          :key="index"
          :ref="file.path"
          :currentPath="currentPath"
          @saveFile="handleSaveFile"
          @closeFile="handleCloseFile"
          @pathChange="handlePathChange"
          @closeOtherFiles="handleCloseOtherFiles"
        />
      </span>
    </div>
  </div>
</template>
