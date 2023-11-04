<script setup lang="tsx">
import { ref, watch } from 'vue'
import TabItem from './TabItem.vue'
import { type FileInfo } from '../../define'
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
  pathChange: (_key: string) => true,
  closeFile: (_path: string) => true,
  saveFile: (_path: string) => true,
  abortSave: (_path: string) => true,
  closeOtherFiles: (_path: string) => true,
})

const monacoStore = useMonaco()
const openedFiles = ref(monacoStore.openedFiles)
watch(
  () => monacoStore.openedFiles,
  (n) => {
    openedFiles.value = n
  }
)
</script>

<template>
  <div class="music-monaco-editor-opened-tab-wrapper">
    <div class="music-monaco-editor-opened-tab">
      <span v-for="file in openedFiles">
        <TabItem
          @saveFile="(path) => emit('saveFile', path)"
          @abortSave="(path) => emit('abortSave', path)"
          :rootEl="rootEl"
          @closeFile="(path) => emit('closeFile', path)"
          :file="file"
          :key="file.path"
          @pathChange="(key) => emit('pathChange', key)"
          :currentPath="currentPath"
          @closeOtherFiles="(path) => emit('closeOtherFiles', path)"
        />
      </span>
    </div>
  </div>
</template>
