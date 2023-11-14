import { defineStore } from 'pinia'
import { loadWASM } from 'onigasm'
// import * as monaco_define from 'monaco-editor/esm/vs/editor/editor.api'
import * as monaco_define from 'monaco-editor'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.api?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import { ref, nextTick } from 'vue'
import { ASSETSPATH } from './constants'
import { type FileInfo, type Files } from './define'

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
const worker = new Promise<Worker>(async (resolve) => {
  const codeString = await fetch(`${ASSETSPATH}eslint.worker.js`).then((res) => res.text())

  // 在这里我没有使用 new Worker(`data:application/javascript, ${codeString}`) 这种方式
  // 而是使用了 URL.createObjectURL 以及 new Blob, 会将 JavaScript 字符串转换为如下格式
  // blob:http://same-domain/cd2930c0-f4ca-4a9f-b6b1-8242e520dd62
  // 因此不再会有跨域问题
  const localWorkerUrl = window.URL.createObjectURL(
    new Blob([codeString], {
      type: 'application/javascript',
    })
  )
  resolve(new Worker(localWorkerUrl))
})
type OpenedFileInfo = { status?: string; path: string }

const themes: {
  [key: string]: any
} = {}
export const useMonaco = defineStore('__monaco', () => {
  let originalFileTree: Files
  const monaco = monaco_define
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
    isDirectory: true,
    children: {},
    path: '/',
  })
  //初始化
  async function init(dom: HTMLElement) {
    editor = monaco.editor.create(dom, { readOnly: true })
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
    await loadWASM(`${ASSETSPATH}onigasm.wasm`)
    await configTheme('OneDarkPro')
    isReady.value = true
  }
  async function configTheme(name: string) {
    let theme = themes[name]
    if (!theme) {
      theme = JSON.parse(await (await fetch(`${ASSETSPATH}themes/${name}.json`)).text())
      themes[name] = theme
      // 定义主题
      monaco.editor.defineTheme(name, theme)
      console.debug('加载monaco主题', name)
    }
    const prefix = '--monaco-'
    Object.keys(theme.colors).forEach((v) => {
      document.documentElement.style.setProperty(
        `${prefix}${v.replace('.', '-')}`,
        theme.colors[v] || themes.OneDarkPro.colors[v] || 'rgba(0, 0, 0, 0)'
      )
    })
    // 设置主题
    monaco.editor.setTheme(name)
  }
  async function loadFileTree(files: Files) {
    originalFileTree = files
    const keys = Object.keys(files)
    const tree: FileInfo = {
      isFile: false,
      isDirectory: true,
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
            isDirectory: files[key].isDirectory,
            children: files[key].isDirectory ? {} : undefined,
          }
        } else {
          temp[v] = {
            isDirectory: true,
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
      if (path.indexOf('.') !== -1) {
        type = path.split('.').slice(-1)[0]
      } else {
        type = 'javascript'
      }
      const config: {
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
      model = monaco.editor.createModel(
        value ?? '',
        config[type] || type,
        new monaco_define.Uri().with({ path, scheme: 'music' })
      )
      model.updateOptions({
        tabSize: 2,
      })
    }
  }
  function getEditor() {
    return editor
  }
  function getValue(path: string) {
    const model = monaco.editor.getModels().find((model) => model.uri.path === path)
    return model?.getValue()
  }
  //恢复视图
  function restoreModel(path: string) {
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
                v.status = undefined
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
    return false
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
          isDirectory: false,
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
          isDirectory: true,
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
  return {
    monaco,
    init,
    restoreModel,
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
})
