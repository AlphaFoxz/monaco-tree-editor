<script setup lang="ts">
import Editor from '@/components/monaco-tree-editor/Index.vue'
import { useMessage } from '@/components/monaco-tree-editor/message-store'
import { useHotkey } from '@/components/monaco-tree-editor/hotkey-store'
import { useMonaco } from '@/components/monaco-tree-editor/monaco-store'
import { type Files } from '@/components/monaco-tree-editor/define'
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
    content: 'testing..',
    loading: true,
  })
  setTimeout(() => {
    messageStore.close(id)
    messageStore.success({
      content: 'Hello Editor',
      closeable: true,
      timeoutMs: 15000,
      textTip: 'testing successed!',
    })
  }, 5000)
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
  if (event.ctrlKey && !event.shiftKey && !event.altKey && event.key === 's') {
    // do something...
  }
})

// ================ 模拟服务端 mock server ================
namespace server {
  let fileSeparator = '\\'
  let responseFiles: Files = {
    'F:\\test_project\\components': {
      isDirectory: true,
    },
    'F:\\test_project\\index.ts': {
      isFile: true,
      content: 'console.log("hello world")',
    },
  }
  export const fetchFiles = async () => {
    return await JSON.parse(JSON.stringify(responseFiles))
  }
  export const createOrSaveFile = async (path: string, content: string) => {
    if (responseFiles[path]) {
      if (!responseFiles[path].isFile) {
        throw new Error(`[ ${path} ] is not a file!`)
      }
      responseFiles[path].content = content
    } else {
      responseFiles[path] = {
        isFile: true,
        content,
      }
    }
  }
  export const newFile = async (path: string) => {
    if (responseFiles[path]) {
      throw new Error(`[ ${path} ] already exists!`)
    }
    responseFiles[path] = {
      isFile: true,
      content: '',
    }
  }
  export const newFolder = async (path: string) => {
    if (responseFiles[path]) {
      throw new Error(`[ ${path} ] already exists!`)
    }
    responseFiles[path] = {
      isDirectory: true,
    }
  }
  export const rename = async (path: string, newName: string) => {
    if (!responseFiles) {
      throw new Error(`[ ${path} ] not exists!`)
    }
    let tmp = path.split(fileSeparator)
    tmp[tmp.length - 1] = newName
    responseFiles[tmp.join(fileSeparator)] = responseFiles[path]
    delete responseFiles[path]
    return true
  }
  export const deleteFile = async (path: string) => {
    delete responseFiles[path]
    return true
  }
}

// ================ 加载文件 load files ================
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

// ================ 回调函数 callback =================
// TODO need to optimize
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
const handleRename = (path: string, name: string, resolve: () => void, reject: (msg?: string) => void) => {
  server
    .rename(path, name)
    .then((_response) => {
      resolve()
    })
    .catch((e: Error) => {
      reject(e.message)
    })
}
</script>

<template>
  <Editor
    :files="files"
    @reload="handleReload"
    @new-file="handleNewFile"
    @new-folder="handleNewFolder"
    @save-file="handleSaveFile"
    @delete-file="handleDeleteFile"
    @delete-folder="handleDeleteFolder"
    @rename-file="handleRename"
    @rename-folder="handleRename"
    ref="editorRef"
  ></Editor>
</template>
