import * as monaco_lib from 'monaco-editor'
import { nextTick, reactive, ref, shallowRef, watch } from 'vue'
import { useGlobalSettings } from '../global-settings-agg'
import { createBroadcastEvent, createUnmountableAgg, Utils as AggUtils } from 'vue-fn/domain'
import { type ThemeMode, BuiltInPage } from '../define'
import { type Files, type MonacoLib, type OpenedFileInfo, type FileInfo, TYPE_MAP } from './types'
import { prepareFiles, getTabSizeByExtension } from './functions'
export * from './types'

// ============================= 定义聚合 =============================
const aggMap: Record<string, ReturnType<typeof createAgg>> = {}

function createAgg(monacoInstanceId: string, m: MonacoLib) {
  return createUnmountableAgg(monacoInstanceId, (context) => {
    context.onScopeDispose(() => {
      delete aggMap[monacoInstanceId]
    })

    // ================================= 声明变量 ===============================
    const { promise: untilDomMounted, callback: domMontedCallback } = AggUtils.createPromiseCallback(() => {})
    const {} = context

    const projectName = ref<any>('project')
    let originalFileTree: Files
    const monaco = shallowRef(m)
    const globalSettingsStore = useGlobalSettings()
    setTheme(globalSettingsStore.states.themeMode.value)
    watch(globalSettingsStore.states.themeMode, (n) => {
      setTheme(n)
    })

    const valueListener = shallowRef<monaco_lib.IDisposable>()
    let editor: monaco_lib.editor.IStandaloneCodeEditor
    let editorDom: HTMLElement
    const prePath = ref<string>()
    const editorStates = reactive<Map<string, monaco_lib.editor.ICodeEditorViewState | null>>(new Map())
    const currentPath = ref<string>()
    const openedFiles = ref<OpenedFileInfo[]>([])
    const prefix = ref('')
    const fileSeparator = ref('/')
    let fileTree = ref<FileInfo>({
      isFolder: true,
      children: {},
      path: '/',
    })

    // ================================= 聚合初始化 =================================
    async function mountMonacoToDom(
      dom: HTMLElement,
      options?: monaco_lib.editor.IStandaloneEditorConstructionOptions
    ) {
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
      domMontedCallback()
    }

    async function defineTheme(name: ThemeMode, theme: monaco_lib.editor.IStandaloneThemeData) {
      await untilDomMounted
      monaco.value!.editor.defineTheme(name, theme)
    }

    async function setTheme(name: ThemeMode) {
      await untilDomMounted
      // 定义主题
      console.debug('切换monaco主题', name)
      // 设置主题
      monaco.value!.editor.setTheme(name)
    }

    function updateOptions(options: monaco_lib.editor.IStandaloneEditorConstructionOptions) {
      editor.updateOptions(options)
    }

    const fileTreeLoadedEvent = createBroadcastEvent({})
    async function loadFileTree(fs: Files) {
      const {
        prefix: nPrefix,
        fileSeparator: nFileSeparator,
        files: nfiles,
        projectName: nProjectName,
      } = prepareFiles(fs)
      prefix.value = nPrefix
      fileSeparator.value = nFileSeparator
      projectName.value = nProjectName
      originalFileTree = nfiles
      const keys = Object.keys(nfiles)
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
              content: nfiles[key].isFile ? nfiles[key].content || '' : undefined,
              readonly: nfiles[key].readonly,
              isFile: nfiles[key].isFile,
              isFolder: nfiles[key].isFolder,
              children: nfiles[key].isFolder ? {} : undefined,
            }
          } else {
            temp[v] = {
              isFolder: true,
              children: {},
              path: '/' + path.slice(0, index + 1).join('/'),
              readonly: nfiles[key].readonly,
              name: v,
            }
            temp = temp[v].children!
          }
        })
      })
      fileTree.value = tree
      await untilDomMounted
      keys.forEach((key) => {
        const value = nfiles[key].content
        if (typeof value === 'string') {
          createOrUpdateModel(key, value, true)
        }
      })
      const tmpOpenedFiles: OpenedFileInfo[] = []
      const notExsist: string[] = []
      for (const item of openedFiles.value) {
        const tmpPath = item.path
        if (nfiles[tmpPath] || tmpPath in BuiltInPage) {
          tmpOpenedFiles.push(item)
        } else {
          notExsist.push(tmpPath)
        }
      }
      for (const key of notExsist) {
        closeFile(key)
      }
      openedFiles.value = tmpOpenedFiles
      fileTreeLoadedEvent.publish({})
    }
    function createOrUpdateModel(path: string, value: string, force?: boolean) {
      let model = monaco.value!.editor.getModels().find((model) => model.uri.path === path)
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
          tabSize = getTabSizeByExtension(extName)
        } else {
          type = 'javascript'
        }
        type = TYPE_MAP[type] || type
        model = monaco.value!.editor.createModel(
          value ?? '',
          type,
          new monaco_lib.Uri().with({ path, authority: 'server', scheme: 'file' })
        )
        model.updateOptions({
          tabSize,
        })
      }
    }
    //恢复视图
    function restoreModel(path: string | undefined): monaco_lib.editor.ITextModel | undefined {
      if (path === undefined || path in BuiltInPage) {
        currentPath.value = path
        return
      }
      const model = monaco.value!.editor.getModels().find((model) => model.uri.path === path)
      if (path !== prePath.value && prePath.value) {
        editorStates.set(prePath.value, editor?.saveViewState())
      }
      valueListener.value?.dispose?.()
      if (model && editor) {
        editor.setModel(model)
        // 如果path改变，那么恢复上一次的状态
        if (path !== prePath.value) {
          const editorState = editorStates.get(path)
          if (editorState) {
            editor.restoreViewState(editorState)
          }
          // 聚焦editor
          editor.focus()
          valueListener.value = model.onDidChangeContent(() => {
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
      let activePath = currentPath.value === path ? undefined : currentPath.value
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
          if (activePath) {
            return false
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
          restoreModel(undefined)
          currentPath.value = ''
          prePath.value = undefined
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
    function resize(): void {
      editorDom.style.height = `calc(100% - ${globalSettingsStore.actions._getOpenedTabsHeight() + 6}px)`
      editor?.layout()
    }

    return {
      events: {
        fileTreeLoaded: fileTreeLoadedEvent,
      },
      states: {
        _prefix: prefix,
        _fileSeparator: fileSeparator,
        _fileTree: fileTree,
        currentPath,
        openedFiles,
        initialized: context.initialized,
        prefix,
        fileSeparator,
        projectName,
      },
      actions: {
        _mount: mountMonacoToDom,
        _restoreModel: restoreModel,
        _openOrFocusPath: openOrFocusPath,
        _hasChanged: hasChanged,
        _closeFile: closeFile,
        _newFile: newFile,
        _newFolder: newFolder,
        _removeBlank: removeBlank,
        _getValue(path: string) {
          const model = monaco.value!.editor.getModels().find((model) => model.uri.path === path)
          return model?.getValue()
        },
        _resize: resize,
        _loadFileTree: loadFileTree,
        _setProjectName(p: string) {
          projectName.value = p
        },
        _setPrefix(p: string) {
          prefix.value = p
        },
        _setFileSeparator(s: string) {
          fileSeparator.value = s
        },
        _getAbsolutePath(relativePath: string): string {
          if (relativePath in BuiltInPage) {
            return relativePath
          }
          let path = prefix.value + relativePath
          if (fileSeparator.value === '\\') {
            path = path.replace(/\//g, '\\')
          }
          return path
        },
        untilDomMounted: async () => {
          await untilDomMounted
        },
        getMonaco() {
          return monaco.value
        },
        defineTheme,
        setTheme,
        getEditor(): monaco_lib.editor.IStandaloneCodeEditor {
          return editor
        },
        updateOptions,
        format() {
          editor?.getAction('editor.action.formatDocument')?.run()
        },
        setOpenedFiles(v: Array<OpenedFileInfo>) {
          openedFiles.value = v
        },
        setMonaco(m: typeof monaco_lib) {
          monaco.value = m
        },
      },
    }
  })
}

function useAgg(monacoInstanceId: string, monaco?: MonacoLib) {
  if (!aggMap[monacoInstanceId]) {
    if (!monaco) {
      throw new Error('monaco is required')
    }
    const agg = createAgg(monacoInstanceId, monaco)
    aggMap[monacoInstanceId] = agg
  }
  return aggMap[monacoInstanceId]
}

export function useMonaco(monaco?: MonacoLib, monacoInstanceId: string = 'default') {
  return useAgg(monacoInstanceId, monaco).api
}
