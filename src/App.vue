<script setup lang="ts">
import Editor from '@/components/monaco-tree-editor/Index.vue'
import { onMounted, ref } from 'vue'

const handleAddFile = (path: string) => {}
const editorRef = ref()
const files = ref({
  '/src/': { isDirectory: true, children: [] },
  '/index.ts': {
    content: 'import * as components from "./components"',
    isFile: true,
  },
  '/define.ts': {
    content: 'define',
    isFile: true,
  },
})
const handleSaveFile = () => {}
onMounted(() => {
  window.onresize = () => {
    setTimeout(() => {
      editorRef.value.resize()
    }, 30)
  }
})
</script>

<template>
  <Editor :files="files" @delete-file="" @save-file="handleSaveFile" @add-file="handleAddFile" ref="editorRef"></Editor>
</template>

<style scoped></style>
