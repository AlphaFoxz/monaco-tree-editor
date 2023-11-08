# monaco-tree-editor

这个我的第一个 npm 库。**_抱歉。这个组件现在还不能用。_** 我会尽可能快地搞定它，并提供一个预发布版本。

It's my first npm repo. **_Sorry. It still not work now._** I'll try fast that i can to make it and publish a rc-version

# 这个库做了什么 What this repo did?

- [x] 提供 VSCode 风格的文件树 Provide FileTree with VSCode style.
- [ ] 回调函数采用异步处理（开发中） async callback functions (developing)
- [ ] 支持自定义的热键处理 hook（开发中） A hook for Hotkey (developing)
- [x] 提供一个浮动的全局消息 hook。 A hook for global float message box.

## 前置要求 Prerequisites

- vue3 (推荐版本 recommend v.3.3.4+)

## 如何安装 How to install

```shell
pnpm add monaco-tree-editor
```

## 示例代码 Demo Code (Alpha)

```vue
<script setup lang="ts">
import Editor from 'monaco-tree-editor/src/components/monaco-tree-editor/Index.vue'
import { useMessage } from 'monaco-tree-editor/src/components/monaco-tree-editor/message-store'
import { useHotkey } from 'monaco-tree-editor/src/components/monaco-tree-editor/hotkey-store'
import { useMonaco } from 'monaco-tree-editor/src/components/monaco-tree-editor/monaco-store'
import { onMounted, ref, watch } from 'vue'

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
// TODO need to optimize
// hotkeyStore.init(monacoStore.getEditorDom(), {
//   preventCtrlKeys: ['r', 'R'], // prevent Ctrl + R
//   preventKeys: ['F12'], // prevent F12
// })
watch(
  () => hotkeyStore.currentEvent,
  (event) => {
    if (event?.ctrlKey && !event.shiftKey && !event.altKey && event.key === '1') {
      // do something...
    }
  }
)

// ================ 加载文件 load files ================
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

// ================ 回调函数 callback =================
// TODO need to optimize
const handleSaveFile = (path: string, resolve: Function, reject: Function) => {}
const handleDeleteFile = (path: string, resolve: Function, reject: Function) => {}
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
```
