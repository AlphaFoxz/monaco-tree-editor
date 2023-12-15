# monaco-tree-editor

## 这个库做了什么 What this repo did?

- [x] 提供 VSCode 风格的文件树 Provide FileTree with VSCode style.
- [x] 回调函数采用异步处理 async callback functions
- [x] 提供一个浮动的全局消息 hook。 A hook for global float message box.

## 前置要求 Prerequisites

- vue3 (推荐版本 recommend v.3.3.4+)

## 如何安装 How to install

### 1.执行命令 Execute command to install

```shell
pnpm add monaco-tree-editor
#or
npm i monaco-tree-editor
```

### 2.复制必要的静态文件 Copy the necessary static files

{root}/node_modules/monaco-tree-editor/`assets` => {root}/public/`assets`

{root}/node_modules/monaco-tree-editor/`monaco-tree-editor-statics` => {root}/public/`monaco-tree-editor-statics`

## TODO

- [ ] 导出内部 monaco api
- [ ] 将组件内部钩子中的变量局部化

## 示例代码 Demo Code (Beta)

```vue
<script setup lang="ts">
import { Editor as MonacoTreeEditor, useMessage, useHotkey, useMonaco, type Files } from 'monaco-tree-editor'
import 'monaco-tree-editor/index.css'
import { onMounted, ref } from 'vue'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'

// ================ 初始化 init monaco-tree-editor ================
window.MonacoEnvironment = {
  getWorker: function (_moduleId, label: string) {
    if (label === 'json') {
      return new jsonWorker()
    } else if (label === 'ts' || label === 'typescript') {
      return new tsWorker()
    } else if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    } else if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    return new editorWorker()
  },
  globalAPI: true,
}
let monacoStore
// 模拟初始化延迟，测试健壮性 simulation delay
server.delay().then(() => {
  monacoStore = useMonaco(monaco)
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
      isFolder: true,
    },
    'F:\\test_project\\index.ts': {
      isFile: true,
      content: 'console.log("hello world")',
    },
    'F:\\test_project\\api\\TestApi.ts': {
      isFile: true,
      content: 'console.log("hello world")',
    },
    'F:\\test_project\\dto\\TestDto.ts': {
      isFile: true,
      content: 'console.log("hello world")',
    },
  }
  // 模拟延迟，测试健壮性 simulation delay
  export const delay = async (maxMs = 3000) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, Math.random() * maxMs)
    })
  }
  export const fetchFiles = async () => {
    await delay(1000)
    return await JSON.parse(JSON.stringify(responseFiles))
  }
  export const createOrSaveFile = async (path: string, content: string) => {
    await delay()
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
    await delay()
    if (responseFiles[path]) {
      throw new Error(`new file: [ ${path} ] already exists!`)
    }
    responseFiles[path] = {
      isFile: true,
      content: '',
    }
  }
  export const newFolder = async (path: string) => {
    await delay()
    if (responseFiles[path]) {
      throw new Error(`new folder: [ ${path} ] already exists!`)
    }
    responseFiles[path] = {
      isFolder: true,
    }
  }
  export const rename = async (path: string, newPath: string) => {
    await delay()
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
    await delay()
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
不论服务端的文件名是什么，组件内会统一去掉最长公共前缀，而在回调方法中的路径则会拼接回原路径
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
const settingsMenu = ref([
  {
    label: 'exit',
    handler: () => {
      alert('exit')
    },
  },
])

const handleContextMenuSelect = (path: string, item: { label: string; value: string }) => {
  alert('path: ' + path + '\nitem: ' + JSON.stringify(item))
}

// ================ 拖拽事件 drag event =================
/**
 * 当把拖动文件树中的数据拖进编辑器时，在当前光标处插入自定义的import语句
 * When drag filelist data into monaco editor, insert custom statement at cursor position
 */
function _longestCommonPrefix(strs: string[]): string {
  if (!strs.length) return ''
  let [a, ...b] = strs
  let result = ''
  for (let i = 0; i < a.length; i++) {
    let flag = b.every((item) => item[i] === a[i])
    if (flag) result += a[i]
    else break
  }
  return result
}

const handleDragInEditor = (srcPath: string, targetPath: string, type: 'file' | 'folder') => {
  if (!targetPath.endsWith('.ts')) {
    return
  }
  const editor = monacoStore.getEditor()
  const lineIndex = editor.getPosition()?.lineNumber!
  let str = 'import "' + relativePathFrom(srcPath, targetPath) + '"'
  editor.executeEdits('drop', [{ range: new monaco.Range(lineIndex, 0, lineIndex, 0), text: str }])
}

//计算相对路径 getRelativePath
const relativePathFrom = (returnPath: string, fromPath: string): string => {
  const prefix = _longestCommonPrefix([returnPath, fromPath])
  returnPath = returnPath.replace(prefix, '').replace(/\\/g, '/')
  fromPath = fromPath.replace(prefix, '').replace(/\\/g, '/')
  const fromPathArr = fromPath.split('/')
  let relativePath = ''
  if (fromPathArr.length === 1) {
    relativePath = './'
  } else {
    for (let i = fromPathArr.length - 2; i >= 0; i--) {
      relativePath += '../'
    }
  }
  return (relativePath += returnPath)
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
    :settings-menu="settingsMenu"
    @drag-in-editor="handleDragInEditor"
    ref="editorRef"
  ></MonacoTreeEditor>
</template>
```
