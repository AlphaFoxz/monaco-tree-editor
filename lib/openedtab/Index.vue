<script setup lang="ts">
import { onMounted, ref, watch, getCurrentInstance, type ComponentInternalInstance, nextTick } from 'vue'
import TabItem from './TabItem.vue'
import './index.scss'
import { useMonaco } from '../stores/monaco-store'

defineProps({
  rootEl: HTMLElement,
  fontSize: {
    type: Number,
    default: 14,
  },
})
const emit = defineEmits({
  saveFile: (_path: string, _value?: string, _resolve?: () => void, _reject?: () => void) => true,
})

//========================= 初始化 init =========================
const monacoStore = useMonaco()
const openedFiles = ref(monacoStore.state.openedFiles.value)
const currentPath = ref('')
let instanceRef: ComponentInternalInstance | null
watch(monacoStore.state.openedFiles, (n) => {
  openedFiles.value = n
})
watch(monacoStore.state.currentPath, (n) => {
  currentPath.value = n
})
onMounted(() => {
  instanceRef = getCurrentInstance()
})

//========================= 回调 callback =========================
const handleSaveFile = (path: string, value: string, resolve?: () => void, reject?: () => void) => {
  emit('saveFile', path, value, resolve, reject)
}
const handlePathChange = (key: string) => {
  console.debug('pathChange', key)
  monacoStore._action.restoreModel(key)
}
const handleCloseFile = (path: string) => {
  monacoStore._action.closeFile(path)
}
const handleCloseOtherFiles = async (path?: string) => {
  console.debug('handleCloseOtherFiles', path)
  if (!instanceRef || !instanceRef.refs) {
    return
  }
  for (const key of Object.keys(instanceRef.refs)) {
    if (path === key) {
      return
    }
    if (!instanceRef?.refs[key] || (instanceRef?.refs[key] as Array<any>).length === 0) {
      delete instanceRef?.refs[key]
      return
    }
    const target = instanceRef?.refs[key] as any
    if (target) {
      await target[0].tryClose()
      delete instanceRef?.refs[key]
    }
  }
}

//========================= 拖动 drag =========================
const handleDragStart = (e: DragEvent, index: number) => {
  console.debug('tab dragstart')
  e.dataTransfer?.setData('component', 'openedtab')
  e.dataTransfer?.setData('index', index.toString())
}
const handleDrop = (e: DragEvent, index: number) => {
  e.preventDefault()
  const componentName = e.dataTransfer?.getData('component')
  const srcIndex: number = parseInt(e.dataTransfer?.getData('index')!)
  if (componentName !== 'openedtab' || srcIndex === index) {
    return
  }
  swap(srcIndex, index)
}
const swap = (srcIndex: number, tarIndex: number) => {
  const result = openedFiles.value
  const tmp = result[srcIndex]
  result.splice(srcIndex, 1)
  result.splice(tarIndex, 0, tmp)
  monacoStore.state.openedFiles.value = result
  flush()
}
const visible = ref(true)
const flush = () => {
  visible.value = false
  nextTick(() => {
    visible.value = true
  })
}
</script>

<template>
  <div class="monaco-tree-editor-opened-tab-wrapper">
    <div class="monaco-tree-editor-opened-tab" v-if="visible" :style="{ fontSize: `${fontSize}px` }">
      <span
        draggable="true"
        @dragstart="(e) => handleDragStart(e, index)"
        @dragover.prevent
        @drop="(e) => handleDrop(e, index)"
        v-for="(file, index) in openedFiles"
      >
        <TabItem
          :rootEl="rootEl"
          :file="file"
          :key="file.path"
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
