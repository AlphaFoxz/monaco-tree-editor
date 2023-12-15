import { loadWASM } from 'onigasm'
// import * as monaco_define from 'monaco-editor/esm/vs/editor/editor.api'
import * as monaco_define from 'monaco-editor'
import wasmUrl from '/monaco-tree-editor-statics/bin/onigasm.wasm?url'
import oneDarkProUrl from '/monaco-tree-editor-statics/themes/OneDarkPro.json?url'
import eslintStr from '/monaco-tree-editor-statics/eslint.worker.js.txt?raw'
import { ref, nextTick } from 'vue'
import { type FileInfo, type Files } from './define'

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
const worker = new Promise<Worker>(async (resolve) => {
  const codeString = eslintStr //await fetch(eslintUrl).then((res) => res.text())
  const localWorkerUrl = window.URL.createObjectURL(
    new Blob([codeString], {
      type: 'application/javascript',
    })
  )
  resolve(new Worker(localWorkerUrl))
})
type OpenedFileInfo = { status?: string; path: string }

let originalFileTree: Files
let monaco: typeof monaco_define
const isReady = ref(false)
const valueListener = ref<monaco_define.IDisposable>()
let editor: monaco_define.editor.IStandaloneCodeEditor
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
//初始化
async function init(dom: HTMLElement, options?: monaco_define.editor.IStandaloneEditorConstructionOptions) {
  editor = monaco.editor.create(dom, { ...options, model: null })
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
  await configTheme('oneDarkPro', oneDarkProUrl)
  await loadWASM(wasmUrl)
  isReady.value = true
}
async function configTheme(name: string, themeUrl: string) {
  let theme = JSON.parse(await (await fetch(themeUrl)).text())
  // 定义主题
  monaco.editor.defineTheme(name, theme)
  console.debug('加载monaco主题', name)
  const prefix = '--monaco-'
  Object.keys(theme.colors).forEach((v) => {
    document.documentElement.style.setProperty(`${prefix}${v.replace('.', '-')}`, theme.colors[v] || 'rgba(0, 0, 0, 0)')
  })
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
  openedFiles.value.map((item) => {
    const tmpPath = item.path
    if (files[tmpPath]) {
      tmpOpenedFiles.push(item)
    }
  })
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
    model = monaco.editor.createModel(value ?? '', type, new monaco_define.Uri().with({ path, scheme: 'music' }))
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

        nextTick(() => {
          worker.then((res) =>
            res.postMessage({
              code: model.getValue(),
              version: model.getVersionId(),
              path,
            })
          )
        })
      })
    }
    worker.then((res) =>
      res.postMessage({
        code: model.getValue(),
        version: model.getVersionId(),
        path,
      })
    )
    prePath.value = path
    currentPath.value = path
    return model
  }
  return undefined
}
const openOrFocusPath = (path: string) => {
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
}
function closeFile(path: string) {
  const pre = openedFiles.value
  let targetPath = ''
  if (pre.length) {
    const res = pre.filter((v, index) => {
      if (v.path === path) {
        const m = monaco.editor.getModels().find((model) => model.uri.path === path)
        m?.setValue(originalFileTree[path].content!)
        if (index === 0) {
          if (pre[index + 1]) {
            targetPath = pre[index + 1].path
          }
        } else {
          targetPath = pre[index - 1].path
        }
      }
      return v.path !== path
    })
    // 目标文件是当前文件，且存在下一激活文件时，执行model及path切换的逻辑
    if (targetPath && currentPath.value === path) {
      restoreModel(targetPath)
      currentPath.value = targetPath
    }
    if (res.length === 0) {
      restoreModel('')
      currentPath.value = ''
      prePath.value = ''
    }
    openedFiles.value = res
  }
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
  return originalFileTree[path].content !== m?.getValue()
}
function format() {
  editor?.getAction('editor.action.formatDocument')?.run()
}
function resize() {
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
