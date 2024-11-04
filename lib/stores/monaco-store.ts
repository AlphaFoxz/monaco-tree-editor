// import * as monaco_define from 'monaco-editor/esm/vs/editor/editor.api'
import * as monaco_lib from 'monaco-editor'
import DarkTheme from '../themes/dark'
import LightTheme from '../themes/light'
import { nextTick, ref, shallowRef, watch } from 'vue'
import { useGlobalSettings } from './global-settings-store'
import type { ThemeMode } from '../themes/define'
import { defineApi } from '../common'

type MonacoLib = typeof monaco_lib
export type Files = {
  [path: string]: FileInfo
}
export type FileInfo = {
  path?: string
  name?: string
  content?: string
  editing?: boolean
  status?: string
  isFile?: boolean
  isFolder?: boolean
  readonly?: boolean
  children?: { [path: string]: FileInfo } | null
}
type OpenedFileInfo = { status?: 'editing' | 'saved'; path: string }
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

function getTabSizeByExtension(ext: string): number {
  return ['java', 'sql', 'py', 'sh', 'cpp', 'cs', 'c', 'h'].includes(ext) ? 4 : 2
}

namespace data {
  let originalFileTree: Files
  let monaco = shallowRef<MonacoLib>()
  const globalSettingsStore = useGlobalSettings()
  setTheme(globalSettingsStore.state.themeMode.value)
  watch(globalSettingsStore.state.themeMode, async (n) => {
    await untilMonacoImported()
    setTheme(n)
  })
  /**
   * It will be true when monaco-editor has been initialized
   */
  const isReady = ref(false)
  const valueListener = ref<monaco_lib.IDisposable>()
  let editor: monaco_lib.editor.IStandaloneCodeEditor
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
  /**
   * Asynchronously waits until the monaco-editor library has been imported.
   * @returns A Promise that resolves when monaco-editor is imported.
   */
  async function untilMonacoImported(): Promise<void> {
    if (monaco.value !== undefined) {
      return
    }
    return new Promise<void>((resolve) => {
      const stop = watch(monaco, (newValue) => {
        if (newValue !== undefined) {
          stop() // 停止监听
          resolve() // 返回数据
        }
      })
    })
  }
  /**
   * Initialize
   * @param dom
   * @param options
   */
  async function init(dom: HTMLElement, options?: monaco_lib.editor.IStandaloneEditorConstructionOptions) {
    await untilMonacoImported()
    editor = monaco.value!.editor.create(dom, { ...options, model: null })
    editorDom = dom
    const editorService = (editor as any)._codeEditorService
    const openEditorBase = editorService.openCodeEditor.bind(editorService)
    editorService.openCodeEditor = async (input: any, source: any, _sideBySide: any) => {
      const result = await openEditorBase(input, source)
      if (result == null) {
        const fullPath = input.resource.path
        source.setModel(monaco.value!.editor.getModel(input.resource))
        openOrFocusPath(fullPath)
        source.setSelection(input.options.selection)
        source.revealLine(input.options.selection.startLineNumber)
      }
      return result
    }
    defineTheme('dark', DarkTheme)
    defineTheme('light', LightTheme)
    setTheme(globalSettingsStore.state.themeMode.value)
    isReady.value = true
  }
  /**
   * Define a theme for monaco editor
   * @param name The name of the theme
   * @param theme The theme data
   */
  function defineTheme(name: ThemeMode, theme: monaco_lib.editor.IStandaloneThemeData) {
    monaco.value!.editor.defineTheme(name, theme)
  }

  async function setTheme(name: ThemeMode) {
    await untilMonacoImported()
    // 定义主题
    console.debug('切换monaco主题', name)
    // 设置主题
    monaco.value!.editor.setTheme(name)
  }
  /**
   * Equals to function of 'updateOptions' in monaco-editor.editor
   * @param options
   */
  function updateOptions(options: monaco_lib.editor.IStandaloneEditorConstructionOptions) {
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
    await untilMonacoImported()
    Object.keys(files).forEach((key) => {
      const value = files[key].content
      if (typeof value === 'string') {
        createOrUpdateModel(key, value, true)
      }
    })
    const tmpOpenedFiles: OpenedFileInfo[] = []
    const notExsist: string[] = []
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
  /**
   * Creates or updates a model in the Monaco editor.
   * @param path The path of the model.
   * @param value The value of the model.
   * @param force If true, forces the model to be updated even if the value is the same.
   */
  function createOrUpdateModel(path: string, value: string, force?: boolean) {
    // Check if the model already exists
    let model = monaco.value!.editor.getModels().find((model) => model.uri.path === path)

    if (model) {
      // If the value of the model is different, update it
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
        // If force is true, reset the status of the opened file
        if (force) {
          openedFiles.value.map((t) => {
            if (t.path === path) {
              t.status = undefined
            }
          })
        }
      } else {
        // If the value is the same, reset the status of the opened file
        openedFiles.value.map((t) => {
          if (t.path === path) {
            t.status = undefined
          }
        })
      }
    } else if (path) {
      // If the model does not exist, create a new one
      let type = ''
      let tabSize = 2

      // Determine the type of the model based on the file extension
      if (path.indexOf('.') !== -1) {
        const extName = path.split('.').slice(-1)[0]
        type = extName
        tabSize = getTabSizeByExtension(extName)
      } else {
        type = 'javascript'
      }

      // Map the file extension to the corresponding language type
      type = typeMap[type] || type

      // Create the model with the specified value and options
      model = monaco.value!.editor.createModel(
        value ?? '',
        type,
        new monaco_lib.Uri().with({ path, authority: 'server', scheme: 'file' })
      )

      // Set the tab size for the model
      model.updateOptions({
        tabSize,
      })
    }
  }
  function getEditor(): monaco_lib.editor.IStandaloneCodeEditor {
    return editor
  }
  function getValue(path: string) {
    const model = monaco.value!.editor.getModels().find((model) => model.uri.path === path)
    return model?.getValue()
  }
  //恢复视图
  function restoreModel(path: string): monaco_lib.editor.ITextModel | undefined {
    if (path[0] === '<') {
      currentPath.value = path
      return
    }
    const model = monaco.value!.editor.getModels().find((model) => model.uri.path === path)
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
          openedFiles.value = openedFiles.value.map((item) => {
            if (item.path === path) {
              if (hasChanged(path)) {
                item.status = 'editing'
              } else {
                item.status = 'saved'
              }
            }
            return item
          })
          currentValue.value = v
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
    nextTick(resize)
  }
  function closeFile(path: string) {
    const pre = openedFiles.value
    let activePath = ''
    if (pre.length) {
      const res = pre.filter((v, index) => {
        if (v.path !== path) {
          return true
        }
        const m = monaco.value!.editor.getModels().find((model) => model.uri.path === path)
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
    nextTick(resize)
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
  /**
   * remove file or folder witch name is blank
   * @param path
   */
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
    const m = monaco.value!.editor.getModels().find((model) => model.uri.path === path)
    if (!m?.uri.authority) {
      return false
    }
    return originalFileTree[path].content !== m?.getValue()
  }
  /**
   * Execute format command with current model
   */
  function format() {
    editor?.getAction('editor.action.formatDocument')?.run()
  }
  /**
   * Resize the editor to fit the available height after the opened tabs.
   * We use "calc" to subtract the height of the opened tabs from the
   * available height, and add 6px for the border.
   * @returns {void}
   */
  function resize(): void {
    editorDom.style.height = `calc(100% - ${globalSettingsStore._action.getOpenedTabsHeight() + 6}px)`
    editor?.layout()
  }

  // ========================== expose api ==========================
  export const api = defineApi({
    _state: {
      prefix: prefix,
      fileSeparator: fileSeparator,
      fileTree: fileTree,
    },
    state: {
      monaco: monaco,
      currentPath: currentPath,
      openedFiles: openedFiles,
      isReady: isReady,
    },
    _action: {
      init,
      restoreModel,
      openOrFocusPath,
      hasChanged,
      closeFile,
      newFile,
      newFolder,
      removeBlank,
      getValue,
      resize,
      loadFileTree,
      untilMonacoImported,
      setPrefix(p: string) {
        prefix.value = p
      },
      setFileSeparator(s: string) {
        fileSeparator.value = s
      },
      setMonaco(m: MonacoLib) {
        monaco.value = m
      },
      getAbsolutePath(relativePath: string): string {
        let path = prefix.value + relativePath
        if (fileSeparator.value === '\\') {
          path = path.replace(/\//g, '\\')
        }
        return path
      },
    },
    action: {
      defineTheme,
      getEditor,
      updateOptions,
      format,
      setOpenedFiles(v: Array<OpenedFileInfo>) {
        openedFiles.value = v
      },
    },
  })
}

/**
 * A hook that provides access to the monaco editor instance.
 * @param m - Optional monaco instance to set.
 * @returns An object with properties for state and actions related to the monaco editor.
 */
export const useMonaco = (m?: typeof monaco_lib) => {
  if (m) {
    data.api._action.setMonaco(m)
  }

  /**
   * An object containing the internal state of the monaco editor.
   */
  return data.api
}
