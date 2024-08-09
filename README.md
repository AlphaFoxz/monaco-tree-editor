# monaco-tree-editor

English | [简体中文](https://github.com/AlphaFoxz/monaco-tree-editor/blob/main/README.CN.md)

## What this repo did?

- [x] Provide FileTree with VSCode style.
- [x] Use async api for vue events
- [x] A hook for global float message box.

## Prerequisites

- [vue3 v3.3.4+](https://vuejs.org/) or [nuxt3 v3.0+](https://nuxt.com/)
- [monaco-editor v0.44.0+](https://microsoft.github.io/monaco-editor/)
- \[Recommended][pnpm package manager](https://pnpm.io/)

## Preview online

[Run with Stackblitz](https://stackblitz.com/~/github.com/AlphaFoxz/monaco-tree-editor)

## How to install

### 1.Execute command to install

```shell
pnpm add monaco-tree-editor
#or
npm i monaco-tree-editor
```

### 2.Copy the necessary static files

{root}/node_modules/monaco-tree-editor/`monaco-tree-editor-statics` => {root}/public/`monaco-tree-editor-statics`

## Demo Code

### mock server

`mock-server.ts`

```typescript
import { type Files } from 'monaco-tree-editor'

const fileSeparator = '\\'
let responseFiles: Files = {
  'F:\\test_project\\test.html': {
    isFile: true,
    content: '<html><body><h1>Hello World!</h1></body></html>',
  },
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
// mock delay to test robustness
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
```

### Basic Usage

```typescript
import { Editor as MonacoTreeEditor, useMonaco, type Files } from 'monaco-tree-editor'
import 'moanco-tree-editor/index.css'
import { ref } from 'vue'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import * as server from './mock-server'

// ================ init monaco-tree-editor ================
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
// mock delay to test robustness
server.delay().then(() => {
  monacoStore = useMonaco(monaco)
})

// ================ callback =================
/*
Whaterver the server's file name is,
the component will take the longest common prefix,
and the path in the callback method will be concatenated with the original path

For example:
const serverFiles = {
  'F:\\test_project\\index.ts': {...},
  'F:\\test_project\\components\\template.ts': {...}
}
In component, it will be converted to:
const serverFiles = {
  '/index.ts': {...},
  '/components/template.ts': {...},
}
And in your callback functions:
const handleSaveFile = (path: string, resolve: () => void, reject: (msg?: string) => void) => {
  console.log(path) // will print 'F:\\test_project\\index.ts'
}
*/
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
```

```vue
<template>
  <MonacoTreeEditor
    :font-size="14"
    :files="files"
    :sider-min-width="240"
    filelist-title="FileList"
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
```

### Print messages

```typescript
import { useMessage } from 'monaco-tree-editor'
import { onMounted } from 'vue'

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
```

### ~~Hotkeys~~

- unrecommended, this api will be deprecated
- in the future, a new interactive shortcut key setting feature will be integrated

```typescript
import { useHotkey } from 'monaco-tree-editor'

const hotkeyStore = useHotkey()
// Trigger when the focus is on the root component
hotkeyStore.listen('root', (event: KeyboardEvent) => {})
// Trigger when the focus is in the editor
hotkeyStore.listen('editor', (event: KeyboardEvent) => {
  if (event.ctrlKey && !event.shiftKey && !event.altKey && (event.key === 's' || event.key === 'S')) {
    // do something...
  }
})
```

### Custom menus

```typescript
import { ref } from 'vue'
// ================ custom menu =================
/**
 * Custom fileMenu and folderMenu Will insert into the context menu of sider file list
 */
const fileMenu = ref([
  { label: 'Custom Selection 1', value: 'any type that not null' },
  { label: 'Custom Selection 2', value: 2 },
  { label: 'Custom Selection 3', value: { id: 3, decription: 'value could be any type without null or undefined' } },
])
const folderMenu = ref([{ label: 'backup', value: 'backupFolder' }])
/*
 * Click the settings icon in the lower left corner to display custom menus
 */
const settingsMenu = ref([
  {
    label: 'exit',
    handler: () => {
      alert('exit')
    },
  },
])
const handleContextMenuSelect = (path: string, item: { label: string | ComputedRef<string>; value: string }) => {
  console.warn('path: ' + path + '\nitem: ' + item)
}
```

```vue
<template>
  <MonacoTreeEditor
    :file-menu="fileMenu"
    :folder-menu="folderMenu"
    :settings-menu="settingsMenu"
    @contextmenu-select="handleContextMenuSelect"
  ></MonacoTreeEditor>
</template>
```

### I18n

language currently has two options: `en-US` and `zh-CN`.
If not specified language, the default language is `en-US`, and the settings menu will display the language switch function.
If specified language, the settings menu will not display the language switch function, and it will be controlled by the outside.

```vue
<!--
en-US: English (Default)
zh-CN: 简体中文
-->
<MonacoTreeEditor language="en-US"></MonacoTreeEditor>
```

### Custom drag and drop

```typescript
/*
 * For example, When the user drags a file to the editor, the file will be imported into the editor
 */
const handleDragInEditor = (srcPath: string, targetPath: string, type: 'file' | 'folder') => {
  if (!targetPath.endsWith('.ts') && !srcPath.endsWith('.js')) {
    return
  }
  const editor = monacoStore.getEditor()
  const lineIndex = editor.getPosition()?.lineNumber!
  let str = 'import "' + _relativePathFrom(srcPath, targetPath) + '"'
  editor.executeEdits('drop', [{ range: new monaco.Range(lineIndex, 0, lineIndex, 0), text: str }])
}

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

// getRelativePath
const _relativePathFrom = (returnPath: string, fromPath: string): string => {
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
```

```vue
<template>
  <MonacoTreeEditor @drag-in-editor="handleDragInEditor"></MonacoTreeEditor>
</template>
```

## TODO Known bugs and To be optimized

[monaco-tree-editor/issues](https://github.com/AlphaFoxz/monaco-tree-editor/issues)
