<script setup lang="ts">
import { Editor as MonacoTreeEditor, useMonaco, type Files } from '#lib/index'
import { useMessage } from '../../../lib'
import { ref, onMounted } from 'vue'
import * as monaco from 'monaco-editor'
import * as server from './mock-server'

const messageAgg = useMessage()
onMounted(() => {
  const id = messageAgg.commands.info({
    content: 'testing..',
    loading: true,
  })
  setTimeout(() => {
    messageAgg.commands.close(id)
    messageAgg.commands.success({
      content: 'Hello Editor',
      closeable: true,
      timeoutMs: 15000,
      textTip: 'testing successed!',
    })
  }, 5000)
})

// ================ 初始化 init monaco-tree-editor ================
let monacoAgg: ReturnType<typeof useMonaco>
// 模拟延迟，测试健壮性 mock delay to test robustness
server.delay().then(() => {
  monacoAgg = useMonaco()
  monacoAgg.commands.setMonaco(monaco)
})

// ================ 回调函数 callback =================
const files = ref<Files>()
const handleReload = (resolve: () => void, reject: (msg?: string) => void) => {
  server
    .fetchFiles()
    .then((response) => {
      files.value = response
      resolve()
    })
    .catch((e: Error) => {
      reject(e.message)
    })
}
const handleSaveFile = (path: string, content: string, resolve: () => void, reject: (msg?: string) => void) => {
  server
    .createOrSaveFile(path, content)
    .then((_response) => {
      resolve()
    })
    .catch((e: Error) => {
      reject(e.message)
    })
}
const handleDeleteFile = (path: string, resolve: () => void, reject: (msg?: string) => void) => {
  server
    .deleteFile(path)
    .then((_response) => {
      resolve()
    })
    .catch((e: Error) => {
      reject(e.message)
    })
}
const handleDeleteFolder = (path: string, resolve: () => void, reject: (msg?: string) => void) => {
  reject('Operation of delete folder is not supported!')
}
const handleNewFile = (path: string, resolve: Function, reject: Function) => {
  server
    .newFile(path)
    .then((_response) => {
      resolve()
    })
    .catch((e: Error) => {
      reject(e.message)
    })
}
const handleNewFolder = (path: string, resolve: Function, reject: Function) => {
  server
    .newFolder(path)
    .then((_response) => {
      resolve()
    })
    .catch((e: Error) => {
      reject(e.message)
    })
}
const handleRename = (path: string, newPath: string, resolve: () => void, reject: (msg?: string) => void) => {
  server
    .rename(path, newPath)
    .then((_response) => {
      resolve()
    })
    .catch((e: Error) => {
      reject(e.message)
    })
}
</script>

<template>
  <MonacoTreeEditor
    :font-size="14"
    :files="files"
    :sider-min-width="240"
    filelist-title="文件列表"
    @reload="handleReload"
    @new-file="handleNewFile"
    @new-folder="handleNewFolder"
    @save-file="handleSaveFile"
    @delete-file="handleDeleteFile"
    @delete-folder="handleDeleteFolder"
    @rename-file="handleRename"
    @rename-folder="handleRename"
  ></MonacoTreeEditor>
</template>
