// import * as monaco_define from 'monaco-editor/esm/vs/editor/editor.api'
import * as monaco_define from 'monaco-editor'
import DarkTheme from './themes/dark'
import LightTheme from './themes/light'
import { nextTick, ref, watch } from 'vue'
import { type FileInfo, type Files, BuiltInPage } from './define'
import { useGlobalVar } from './global-var-store'
import type { ThemeMode } from './themes/define'

const globalVarStore = useGlobalVar()
watch(globalVarStore.getThemeMode(), (themeMode) => {
  setTheme(themeMode)
})

const typeMap: {
  [key: string]: string
} = {
  js: 'javascript',
  ts: 'typescript',
  less: 'less',
  jsx: 'javascript',
  tsx: 'typescript',
  v: 'verilog',
  sv: 'systemverilog',
  restful: 'restful',
}
type OpenedFileInfo = { status?: string; path: string }

let originalFileTree: Files
let monaco: typeof monaco_define
const isReady = ref(false)
const valueListener = ref<monaco_define.IDisposable>()
let editor: monaco_define.editor.IStandaloneCodeEditor
let editorDom: HTMLElement
const prePath = ref<string | null>()
const editorStates = ref<Map<any, any>>(new Map())
const currentValue = ref('')
const currentPath = ref('')
const openedFiles = ref<Array<OpenedFileInfo>>([])
const prefix = ref('')
const fileSeparator = ref('/')
let fileTree = ref<FileInfo>({
  isFolder: true,
  children: {},
  path: '/',
})
async function monacoImported() {
  return new Promise<void>((resolve) => {
    if (monaco) {
      resolve()
      return
    }
    const interval = setInterval(() => {
      if (monaco) {
        resolve()
        clearInterval(interval)
      }
    }, 100)
  })
}
//初始化
async function init(dom: HTMLElement, options?: monaco_define.editor.IStandaloneEditorConstructionOptions) {
  await monacoImported()
  editor = monaco.editor.create(dom, { ...options, model: null })
  editorDom = dom
  const editorService = (editor as any)._codeEditorService
  const openEditorBase = editorService.openCodeEditor.bind(editorService)
  editorService.openCodeEditor = async (input: any, source: any, _sideBySide: any) => {
    const result = await openEditorBase(input, source)
    if (result == null) {
      const fullPath = input.resource.path
      source.setModel(monaco.editor.getModel(input.resource))
      openOrFocusPath(fullPath)
      source.setSelection(input.options.selection)
      source.revealLine(input.options.selection.startLineNumber)
    }
    return result
  }
  defineTheme('dark', DarkTheme)
  defineTheme('light', LightTheme)
  setTheme(globalVarStore.getThemeMode().value)
  isReady.value = true
}
function defineTheme(name: ThemeMode, theme: monaco_define.editor.IStandaloneThemeData) {
  monaco.editor.defineTheme(name, theme)
}
function setTheme(name: ThemeMode) {
  // 定义主题
  console.debug('切换monaco主题', name)
  // 设置主题
  monaco.editor.setTheme(name)
}
function updateOptions(options: monaco_define.editor.IStandaloneEditorConstructionOptions) {
  editor.updateOptions(options)
}
async function loadFileTree(files: Files) {
  originalFileTree = files
  const keys = Object.keys(files)
  const tree: FileInfo = {
    isFile: false,
    isFolder: true,
    children: {},
    path: '/',
  }
  keys.forEach((key) => {
    if (!key) {
      return
    }
    const path = key.startsWith('/') ? key.slice(1).split('/') : key.split('/')
    let temp: Files = tree.children!
    path.forEach((v, index) => {
      if (temp[v]) {
        temp = temp[v].children!
      } else if (index === path.length - 1) {
        temp[v] = {
          name: v,
          path: key,
          content: files[key].isFile ? files[key].content || '' : undefined,
          readonly: files[key].readonly,
          isFile: files[key].isFile,
          isFolder: files[key].isFolder,
          children: files[key].isFolder ? {} : undefined,
        }
      } else {
        temp[v] = {
          isFolder: true,
          children: {},
          path: '/' + path.slice(0, index + 1).join('/'),
          readonly: files[key].readonly,
          name: v,
        }
        temp = temp[v].children!
      }
    })
  })
  fileTree.value = tree
  await monacoImported()
  Object.keys(files).forEach((key) => {
    const value = files[key].content
    if (typeof value === 'string') {
      createOrUpdateModel(key, value, true)
    }
  })
  const tmpOpenedFiles: {
    status?: string | undefined
    path: string
  }[] = []
  const notExsist: string[] = []
  const builtInPages: string[] = Object.keys(BuiltInPage)
  for (const item of openedFiles.value) {
    const tmpPath = item.path
    if (files[tmpPath] || tmpPath[0] === '<') {
      tmpOpenedFiles.push(item)
    } else {
      notExsist.push(tmpPath)
    }
  }
  for (const key of notExsist) {
    closeFile(key)
  }
  openedFiles.value = tmpOpenedFiles
}
function createOrUpdateModel(path: string, value: string, force?: boolean) {
  // model 是否存在
  let model = monaco.editor.getModels().find((model) => model.uri.path === path)

  if (model) {
    const v = model.getValue()
    if (v !== value) {
      model.pushEditOperations(
        [],
        [
          {
            range: model?.getFullModelRange(),
            text: value,
          },
        ],
        () => []
      )
      if (force) {
        openedFiles.value.map((t) => {
          if (t.path === path) {
            t.status = undefined
          }
        })
      }
    } else {
      openedFiles.value.map((t) => {
        if (t.path === path) {
          t.status = undefined
        }
      })
    }
  } else if (path) {
    let type = ''
    let tabSize = 2
    if (path.indexOf('.') !== -1) {
      const extName = path.split('.').slice(-1)[0]
      type = extName
      if (['java', 'sql', 'py', 'sh', 'cpp', 'cs', 'c', 'h'].includes(extName)) {
        tabSize = 4
      }
    } else {
      type = 'javascript'
    }
    type = typeMap[type] || type
    model = monaco.editor.createModel(
      value ?? '',
      type,
      new monaco_define.Uri().with({ path, authority: 'server', scheme: 'file' })
    )
    model.updateOptions({
      tabSize,
    })
  }
}
function getEditor(): monaco_define.editor.IStandaloneCodeEditor {
  return editor
}
function getValue(path: string) {
  const model = monaco.editor.getModels().find((model) => model.uri.path === path)
  return model?.getValue()
}
//恢复视图
function restoreModel(path: string): monaco_define.editor.ITextModel | undefined {
  if (path[0] === '<') {
    currentPath.value = path
    return
  }
  const model = monaco.editor.getModels().find((model) => model.uri.path === path)
  if (path !== prePath.value && prePath.value) {
    editorStates.value.set(prePath.value, editor?.saveViewState())
  }
  if (valueListener.value && valueListener.value.dispose!) {
    valueListener.value.dispose()
  }
  if (model && editor) {
    editor.setModel(model)
    // 如果path改变，那么恢复上一次的状态
    if (path !== prePath.value) {
      const editorState = editorStates.value.get(path)
      if (editorState) {
        editor.restoreViewState(editorState)
      }
      // 聚焦editor
      editor.focus()
      valueListener.value = model.onDidChangeContent(() => {
        const v = model.getValue()
        openedFiles.value = openedFiles.value.map((v) => {
          if (v.path === path) {
            if (hasChanged(path)) {
              v.status = 'editing'
            } else {
              v.status = 'saved'
            }
          }
          return v
        })
        // emit('fileChange', path, v)
        currentValue.value = v
        // emit('valueChange', v)
      })
    }
    prePath.value = path
    currentPath.value = path
    return model
  }
  return undefined
}
function openOrFocusPath(path: string) {
  let exist = false
  openedFiles.value.forEach((v) => {
    if (v.path === path) {
      exist = true
    }
  })
  if (!exist) {
    openedFiles.value = [...openedFiles.value, { path }]
  }
  currentPath.value = path
  nextTick(() => {
    resize()
  })
}
function closeFile(path: string) {
  const pre = openedFiles.value
  let activePath = ''
  if (pre.length) {
    const res = pre.filter((v, index) => {
      if (v.path !== path) {
        return true
      }
      const m = monaco.editor.getModels().find((model) => model.uri.path === path)
      if (m?.uri.authority && originalFileTree[path]) {
        // 来自用户的文件
        m?.setValue(originalFileTree[path].content!)
      } else {
        // 可能是源码之类的，不存在当前项目中的文件，在关闭时直接销毁，不涉及保存
        m?.dispose()
      }
      if (pre[index + 1]) {
        activePath = pre[index + 1].path
      } else if (index > 0) {
        activePath = pre[index - 1].path
      }
      return false
    })
    // 目标文件是当前文件，且存在下一激活文件时，执行model及path切换的逻辑
    if (activePath) {
      restoreModel(activePath)
      currentPath.value = activePath
    }
    if (res.length === 0) {
      restoreModel('')
      currentPath.value = ''
      prePath.value = ''
    }
    openedFiles.value = res
  }
  nextTick(() => {
    resize()
  })
}
function newFile(path: string) {
  const paths = path.startsWith('/') ? path.slice(1).split('/') : path.split('/')
  const tree = fileTree.value
  let temp: Files = tree.children!
  paths.forEach((v, index) => {
    if (index === paths.length - 1) {
      temp[''] = {
        name: '',
        path,
        content: '',
        readonly: false,
        isFile: true,
        isFolder: false,
        children: undefined,
      }
    } else if (temp[v]) {
      temp = temp[v].children!
    }
  })
  fileTree.value = tree
}
function newFolder(path: string) {
  const paths = path.startsWith('/') ? path.slice(1).split('/') : path.split('/')
  const tree = fileTree.value
  let temp: Files = tree.children!
  paths.forEach((v, index) => {
    if (index === paths.length - 1) {
      temp[''] = {
        name: '',
        path,
        content: '',
        readonly: false,
        isFile: false,
        isFolder: true,
        children: {},
      }
    } else if (temp[v]) {
      temp = temp[v].children!
    }
  })
  fileTree.value = tree
}
function removeBlank(path: string) {
  const paths = path.startsWith('/') ? path.slice(1).split('/') : path.split('/')
  const tree = fileTree.value
  let temp: Files = tree.children!
  paths.forEach((v, index) => {
    if (index === paths.length - 1) {
      delete temp[v]
    } else if (temp[v]) {
      temp = temp[v].children!
    }
  })
  fileTree.value = tree
}
function hasChanged(path: string): boolean {
  const m = monaco.editor.getModels().find((model) => model.uri.path === path)
  if (!m?.uri.authority) {
    return false
  }
  return originalFileTree[path].content !== m?.getValue()
}
function format() {
  editor?.getAction('editor.action.formatDocument')?.run()
}
function resize() {
  editorDom.style.height = `calc(100% - ${globalVarStore.getOpenedTabsHeight() + 6}px)`
  editor?.layout()
}

export const useMonaco = (m?: typeof monaco_define) => {
  if (m) {
    monaco = m
  }
  return {
    monaco,
    init,
    restoreModel,
    updateOptions,
    openOrFocusPath,
    isReady,
    hasChanged,
    currentPath,
    prefix,
    fileSeparator,
    closeFile,
    newFile,
    newFolder,
    removeBlank,
    getEditor,
    getValue,
    format,
    resize,
    openedFiles,
    loadFileTree,
    fileTree,
  }
}
