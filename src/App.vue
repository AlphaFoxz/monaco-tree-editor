<script setup lang="ts">
import { Editor as MonacoTreeEditor, useMessage, useHotkey, useMonaco, type Files } from '@'
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
        throw new Error(`save file:[ ${path} ] is not a file!`)
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
      throw new Error(`new file: [ ${path} ] already exists!`)
    }
    responseFiles[path] = {
      isFile: true,
      content: '',
    }
  }
  export const newFolder = async (path: string) => {
    if (responseFiles[path]) {
      throw new Error(`new folder: [ ${path} ] already exists!`)
    }
    responseFiles[path] = {
      isDirectory: true,
    }
  }
  export const rename = async (path: string, newPath: string) => {
    if (!responseFiles[path]) {
      throw new Error(`rename: source file/folder name [ ${path} ] not exists!`)
    } else if (responseFiles[newPath]) {
      throw new Error(`rename: target file/folder name [ ${newPath} ] already exists!`)
    }
    responseFiles[newPath] = responseFiles[path]
    if (path !== newPath) {
      delete responseFiles[path]
    }
    return true
  }
  export const deleteFile = async (path: string) => {
    if (!responseFiles[path]) {
      throw new Error(`delete: file name [ ${path} ] not exists!`)
    }
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
/*
不论服务端的文件名是什么，组件内会统一取最长公共前缀，而在回调方法中的路径则会拼接回原路径
Whaterver the server's file name is,
the component will take the longest common prefix,
and the path in the callback method will be concatenated with the original path
例如 For example:
const serverFiles = {
  'F:\\test_project\\index.ts': {...},
  'F:\\test_project\\components\\template.ts': {...}
}
在组件内会转换为 In component, it will be converted to:
const serverFiles = {
  '/index.ts': {...},
  '/components/template.ts': {...},
}
回调中会拼接回来 In your callback functions:
const handleSaveFile = (path: string, resolve: () => void, reject: (msg?: string) => void) => {
  console.log(path) // will print 'F:\\test_project\\index.ts'
}
*/
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

// ================ 自定义菜单 custom menu =================
/**
 * fileMenu and folderMenu Will insert into the context menu of sider file list
 */
const fileMenu = ref([
  { label: 'Custom Selection 1', value: 'any type that not null' },
  { label: 'Custom Selection 2', value: 2 },
  { label: '自定义文件选项 3', value: { id: 3, decription: 'value可以是任意非空值' } },
])
const folderMenu = ref([{ label: 'backup', value: 'backupFolder' }])

const handleContextMenuSelect = (path: string, item: { label: string; value: string }) => {
  alert('path: ' + path + '\nitem: ' + JSON.stringify(item))
}
</script>

<template>
  <MonacoTreeEditor
    :fontSize="14"
    :files="files"
    @reload="handleReload"
    @new-file="handleNewFile"
    @new-folder="handleNewFolder"
    @save-file="handleSaveFile"
    @delete-file="handleDeleteFile"
    @delete-folder="handleDeleteFolder"
    @rename-file="handleRename"
    @rename-folder="handleRename"
    :file-menu="fileMenu"
    :folder-menu="folderMenu"
    @contextmenu-select="handleContextMenuSelect"
    ref="editorRef"
  ></MonacoTreeEditor>
</template>
