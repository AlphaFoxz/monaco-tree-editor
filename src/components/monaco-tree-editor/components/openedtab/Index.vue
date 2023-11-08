<script setup lang="tsx">
import { ref, watch } from 'vue'
import TabItem from './TabItem.vue'
import './index.less'
import { useMonaco } from '../../monaco-store'
defineProps({
  currentPath: {
    type: String,
    default: '',
  },
  rootEl: HTMLElement,
})
const emit = defineEmits({
  saveFile: (_path: string) => true,
  abortSave: (_path: string) => true,
})

const monacoStore = useMonaco()
const openedFiles = ref(monacoStore.openedFiles)
watch(
  () => monacoStore.openedFiles,
  (n) => {
    openedFiles.value = n
  }
)
const handlePathChange = (key: string) => {
  console.debug('pathChange', key)
  monacoStore.restoreModel(key)
}
const handleCloseFile = (path: string) => {
  monacoStore.closeFile(path)
}
const handleCloseOtherFiles = (path?: string) => {}
</script>

<template>
  <div class="music-monaco-editor-opened-tab-wrapper">
    <div class="music-monaco-editor-opened-tab">
      <span v-for="file in openedFiles">
        <TabItem
          @saveFile="(path) => emit('saveFile', path)"
          @abortSave="(path) => emit('abortSave', path)"
          :rootEl="rootEl"
          @closeFile="handleCloseFile"
          :file="file"
          :key="file.path"
          @pathChange="handlePathChange"
          :currentPath="currentPath"
          @closeOtherFiles="handleCloseOtherFiles"
        />
      </span>
    </div>
  </div>
</template>
