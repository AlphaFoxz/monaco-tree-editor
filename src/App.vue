<script setup lang="ts">
import Editor from '@/components/monaco-tree-editor/Index.vue'
import { useMessage } from '@/components/monaco-tree-editor/message-store'
import { useHotkey } from '@/components/monaco-tree-editor/hotkey-store'
import { useMonaco } from '@/components/monaco-tree-editor/monaco-store'
import { onMounted, ref } from 'vue'

// ================ 调整大小 resize ================
const editorRef = ref()
onMounted(() => {
  window.onresize = () => {
    setTimeout(() => {
      editorRef.value.resize()
    }, 30)
  }
})

// ================ 推送消息 push message ================
const messageStore = useMessage()
onMounted(() => {
  const id = messageStore.info({
    content: 'loading..',
    loading: true,
  })
  setTimeout(() => {
    messageStore.close(id)
    messageStore.success({
      content: 'loading successed!',
      closeable: true,
      timeoutMs: 5000,
    })
  }, 3000)
})

// ================ 原生功能 original modules of monaco-editor ================
const monacoStore = useMonaco()
monacoStore.monaco.languages.register
onMounted(() => {
  monacoStore.getEditor().setValue
})

// ================ 快捷键 hotkey ==================
const hotkeyStore = useHotkey()
hotkeyStore.listen('root', (event: KeyboardEvent) => {})
hotkeyStore.listen('editor', (event: KeyboardEvent) => {
  if (event?.ctrlKey && !event.shiftKey && !event.altKey && event.key === '1') {
    // do something...
  }
})

// ================ 加载文件 load files ================
const files = ref({
  '/src': { isDirectory: true, children: [] },
  '/index.ts': {
    content: 'import * as components from "./components"',
    isFile: true,
  },
  '/define.ts': {
    content: 'define',
    isFile: true,
  },
})

// ================ 回调函数 callback =================
// TODO need to optimize
const handleSaveFile = () => {}
const handleDeleteFile = () => {}
const handleAddFile = (path: string, resolve: Function, reject: Function) => {}
</script>

<template>
  <Editor
    :files="files"
    @delete-file="handleDeleteFile"
    @save-file="handleSaveFile"
    @add-file="handleAddFile"
    ref="editorRef"
  ></Editor>
</template>

<style scoped></style>
