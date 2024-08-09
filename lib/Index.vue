<script setup lang="tsx">
import './index.scss'
import { onMounted, ref, watch, nextTick, onBeforeUnmount, type ComputedRef } from 'vue'
import { type Files, BuiltInPage } from './define'
import { longestCommonPrefix, throttle } from './common'
import { useMonaco } from './stores/monaco-store'
import { useHotkey } from './stores/hotkey-store'
import { useMessage } from './stores/message-store'
import { useGlobalSettings } from './stores/global-settings-store'
import type { ThemeMode } from './themes/define'
import * as monaco_define from 'monaco-editor'
import Prettier from './prettier/Index.vue'
import LeftSiderBar from './left-sider-bar/Index.vue'
import FileList from './folders/Index.vue'
import OpenedTab from './openedtab/Index.vue'
import GithubFilled from './icons/GithubFilled.vue'
import MessagePopup from './message-popup/Index.vue'
import { useI18n, type Language } from './locale'
import SettingsPage from './pages/SettingsPage.vue'
import KeyboardShortcutsPage from './pages/KeyboardShortcuts.vue'

const props = defineProps({
  files: {
    type: Object,
    default: () => ({}),
  },
  prefix: {
    type: String,
  },
  siderMinWidth: {
    type: Number,
    default: 170,
  },
  filelistTitle: {
    type: String,
  },
  fileMenu: {
    type: Array<any>,
    default: () => [],
  },
  folderMenu: {
    type: Array<any>,
    default: () => [],
  },
  settingsMenu: {
    type: Array<any>,
    default: () => [],
  },
  fontSize: {
    type: Number,
    default: 14,
  },
  language: String,
  theme: String,
})
const emit = defineEmits({
  reload: (_resolve: () => void, _reject: (msg?: string) => void) => true,
  newFile: (_path: string, _resolve: () => void, _reject: (msg?: string) => void) => true,
  saveFile: (_path: string, _value: string, _resolve: () => void, _reject: (msg?: string) => void) => true,
  renameFile: (_path: string, _newPath: string, _resolve: () => void, _reject: (msg?: string) => void) => true,
  deleteFile: (_path: string, _resolve: () => void, _reject: (msg?: string) => void) => true,
  newFolder: (_path: string, _resolve: () => void, _reject: (msg?: string) => void) => true,
  renameFolder: (_path: string, _newPath: string, _resolve: () => void, _reject: (msg?: string) => void) => true,
  deleteFolder: (_path: string, _resolve: () => void, _reject: (msg?: string) => void) => true,
  contextmenuSelect: (_path: string, _item: { label: string | ComputedRef<string>; value: any }) => true,
  dragInEditor: (_srcPath: string, _targetPath: string, _type: 'file' | 'folder') => true,
})

// ================ 国际化 i18n ================
const globalSettingsStore = useGlobalSettings({
  currentThemeMode: props.theme as ThemeMode,
})
const { t } = useI18n((props.language || 'en-US') as Language)
watch(
  () => props.language,
  (n) => {
    if (n) {
      globalSettingsStore.action.changeLanguage(n as Language)
    }
  }
)

// ================ 主题 theme ================
watch(
  () => props.theme,
  (n) => {
    if (n) {
      globalSettingsStore.action.changeTheme(n as ThemeMode)
    }
  }
)

// ================ 拖拽功能 dragging ================
const filelistWidth = ref(props.siderMinWidth)
const throttleResize = throttle((e: MouseEvent) => {
  if (dragInfo.start && e.pageX != 0) {
    const w = dragInfo.width + (e.pageX - dragInfo.pageX)
    console.debug('Dragging', w)
    if (w < props.siderMinWidth / 2) {
      globalSettingsStore.action.switchCurrentLeftSiderBar(null)
    } else if (w >= props.siderMinWidth / 2) {
      globalSettingsStore.action.switchCurrentLeftSiderBar('Explorer', false)
    }
    filelistWidth.value = w < props.siderMinWidth ? props.siderMinWidth : w
    monacoStore._action.resize()
  }
}, 5)
let dragInfo = {
  pageX: 0,
  width: 0,
  start: false,
}
const handleDragStart = (e: MouseEvent) => {
  console.debug('dragStart')
  dragInfo = {
    pageX: e.pageX,
    width: currentLeftSiderBar.value === 'Explorer' ? filelistWidth.value : 0,
    start: true,
  }
}
const handleDrag = (e: MouseEvent) => {
  e.stopPropagation()
  throttleResize(e)
}
const handleDragEnd = (_e: MouseEvent) => {
  console.debug('dragEnd')
  dragInfo.start = false
}
watch(
  () => props.siderMinWidth,
  (n) => {
    filelistWidth.value = filelistWidth.value < n ? n : filelistWidth.value
  }
)

// =============== 左边栏 left-sider-bar ================
const currentLeftSiderBar = globalSettingsStore.state.currentLeftSiderBar
watch(globalSettingsStore.state.currentLeftSiderBar, (n) => {
  currentLeftSiderBar.value = n
})

// ================ 编辑器部分 editor ================
const projectName = ref<any>('project')
let fileSeparator = '/'
let projectPrefix = ''
const openedCount = ref(0)
const monacoStore = useMonaco()
monacoStore._action.loadFileTree(props.files)
const editorRef = ref<HTMLElement>()
const handleFormat = () => {
  monacoStore.action.format()
}
const fixFilesPath = (files: Files): Files => {
  const fixedFiles: Files = {}
  projectPrefix = longestCommonPrefix(Object.keys(files))
  if (projectPrefix.endsWith('\\') || projectPrefix.endsWith('/')) {
    projectPrefix = projectPrefix.substring(0, projectPrefix.length - 1)
  }
  let _projectName = projectPrefix.replace(/\\/g, '/')
  _projectName = _projectName.substring(_projectName.lastIndexOf('/') + 1)
  projectName.value = _projectName || undefined
  console.debug('projectName', _projectName)
  Object.keys(files).forEach((path) => {
    if (path.includes('\\')) {
      fileSeparator = '\\'
    }
    const info = files[path]
    path = path.replace(projectPrefix, '')
    path = path.replace(/\\/g, '/')
    fixedFiles[path] = {
      ...info,
      path: path,
    }
  })
  files = fixedFiles
  monacoStore._state.prefix.value = projectPrefix
  monacoStore._state.fileSeparator.value = fileSeparator
  return files
}
watch(
  () => props.files,
  (n) => {
    monacoStore._action.loadFileTree(fixFilesPath(n))
  }
)
watch(
  () => props.fontSize,
  (n) => {
    monacoStore.action.updateOptions({ fontSize: n })
  }
)
watch(monacoStore.state.openedFiles, (n) => {
  openedCount.value = n.length
})
onMounted(() => {
  handleReload()
  monacoStore._action.loadFileTree(fixFilesPath(props.files))
  monacoStore._action.init(editorRef.value!, { fontSize: props.fontSize, automaticLayout: true })
})
onBeforeUnmount(() => {
  monacoStore.state.editor.dispose()
})

// ================ 回调事件 callback events ================
const messageStore = useMessage()
const toOriginPath = (path: string): string => {
  let oriPath = projectPrefix + path
  if (fileSeparator === '\\') {
    oriPath = oriPath.replace(/\//g, '\\')
  }
  return oriPath
}
const lockFile = (filePath: string, loadingMsgId: string) => {
  globalSettingsStore._action.lockFile(filePath, () => {
    messageStore.action.close(loadingMsgId)
    messageStore.action.error({
      content: t('msg.timeout'),
      closeable: true,
    })
    globalSettingsStore._action.unlockFile(filePath)
  })
}
const handleReload = (
  resolve = () => {
    messageStore.action.success({
      content: t('msg.reloadSuccessed'),
      closeable: true,
      timeoutMs: 3000,
    })
  },
  reject = (msg = '') => {
    messageStore.action.error({
      content: t('msg.reloadFailed', { msg }),
      closeable: true,
    })
  }
) => {
  const msgId = messageStore.action.info({
    content: t('msg.reloading'),
    loading: true,
  })
  emit(
    'reload',
    () => {
      messageStore.action.close(msgId)
      resolve()
    },
    (msg = '') => {
      messageStore.action.close(msgId)
      reject(msg)
    }
  )
}
const handleNewFile = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore._action.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.action.info({
    content: t('msg.creating', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'newFile',
    oriPath,
    () => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.success({
        content: t('msg.createSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.error({
        content: t('msg.createFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}
const handleNewFolder = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore._action.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.action.info({
    content: t('msg.creating', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'newFolder',
    oriPath,
    () => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.success({
        content: t('msg.createSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.error({
        content: t('msg.createFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}
const handleSaveFile = (
  path: string,
  value = monacoStore._action.getValue(path),
  resolve = () => {},
  reject = () => {}
) => {
  if (value === undefined || !path || !monacoStore._action.hasChanged(path)) {
    console.debug('there is no changed.')
    resolve()
    return
  }
  if (globalSettingsStore._action.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.action.info({
    content: t('msg.saving', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'saveFile',
    oriPath,
    value,
    () => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.success({
        content: t('msg.saveSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.error({
        content: t('msg.saveFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleDeleteFile = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore._action.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.action.info({
    content: t('msg.deletingFile', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'deleteFile',
    oriPath,
    () => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.success({
        content: t('msg.deleteSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.error({
        content: t('msg.deleteFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleDeleteFolder = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore._action.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.action.info({
    content: t('msg.deletingFolder', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'deleteFolder',
    oriPath,
    () => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.success({
        content: t('msg.deleteSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.error({
        content: t('msg.deleteFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleRenameFile = (path: string, newName: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore._action.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  let tmpArr = oriPath.split(fileSeparator)
  tmpArr.pop()
  tmpArr.push(newName)
  const newPath = tmpArr.join(fileSeparator)
  const msgId = messageStore.action.info({
    content: t('msg.renamingFile', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'renameFile',
    oriPath,
    newPath,
    () => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.success({
        content: t('msg.renameSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.error({
        content: t('msg.renameFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleRenameFolder = (path: string, newName: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore._action.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  let tmpArr = oriPath.split(fileSeparator)
  tmpArr.pop()
  tmpArr.push(newName)
  const newPath = tmpArr.join(fileSeparator)
  const msgId = messageStore.action.info({
    content: t('msg.renamingFolder', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'renameFolder',
    oriPath,
    newPath,
    () => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.success({
        content: t('msg.renameSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore._action.unlockFile(path)
      messageStore.action.close(msgId)
      messageStore.action.error({
        content: t('msg.renameFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleContextmenuSelect = (path: string, item: { label: string | ComputedRef<string>; value: any }) => {
  emit('contextmenuSelect', toOriginPath(path), item)
}

// ================ 拖入 drop ================
const dragInEditor = (e: DragEvent) => {
  if (e.dataTransfer?.getData('component') !== 'filelist') {
    return
  }
  const srcPath: string = e.dataTransfer?.getData('path').toString() || ''
  emit(
    'dragInEditor',
    toOriginPath(srcPath),
    toOriginPath(monacoStore.state.currentPath.value),
    e.dataTransfer.getData('type') as 'file' | 'folder'
  )
}

// ================ 快捷键部分 hotkey ================
const hotkeyStore = useHotkey()
const rootRef = ref<HTMLElement>()
onMounted(() => {
  hotkeyStore.init('root', rootRef.value!)
  hotkeyStore.init('editor', editorRef.value!)
  hotkeyStore.listen('editor', (e) => {
    if (e?.ctrlKey && e.key.toLowerCase() === 's') {
      console.debug('hotkey', 'Ctrl+s')
      handleSaveFile(monacoStore.state.currentPath.value)
    }
  })
})

// 暴露方法 expose functions
defineExpose({
  resize: () => {
    monacoStore._action.resize()
  },
  getMonaco: () => {
    return monacoStore.state.monaco
  },
  getEditor: (): monaco_define.editor.IStandaloneCodeEditor => {
    return monacoStore.state.editor
  },
})
</script>
<template>
  <div
    ref="rootRef"
    id="monaco-tree-editor-root"
    @contextmenu.prevent.stop
    tabIndex="1"
    :class="`monaco-tree-editor ${globalSettingsStore.state.currentThemeMode.value}`"
  >
    <MessagePopup></MessagePopup>
    <LeftSiderBar></LeftSiderBar>
    <FileList
      v-show="currentLeftSiderBar === 'Explorer'"
      @reload="handleReload"
      @new-file="handleNewFile"
      @new-folder="handleNewFolder"
      @delete-file="handleDeleteFile"
      @delete-folder="handleDeleteFolder"
      @rename-file="handleRenameFile"
      @rename-folder="handleRenameFolder"
      :file-menu="fileMenu"
      :folder-menu="folderMenu"
      @contextmenu-select="handleContextmenuSelect"
      :project-name="projectName"
      :rootEl="rootRef"
      :title="filelistTitle"
      :fontSize="fontSize"
      :style="{ width: filelistWidth + 'px', minWidth: siderMinWidth + 'px' }"
    />
    <div
      :draggable="true"
      @dragstart="handleDragStart"
      @drag="handleDrag"
      @dragend="handleDragEnd"
      class="monaco-tree-editor-drag"
    ></div>
    <div class="monaco-tree-editor-area">
      <OpenedTab :fontSize="fontSize" @save-file="handleSaveFile" />
      <div
        id="editor"
        v-show="openedCount > 0 && monacoStore.state.currentPath.value[0] !== '<'"
        ref="editorRef"
        @drop="dragInEditor"
        :style="{
          flex: 1,
          width: '100%',
        }"
      ></div>
      <div
        v-show="!monacoStore.state.isReady || !monacoStore.state.currentPath.value"
        class="monaco-tree-editor-area-empty"
      >
        <label>
          <div><GithubFilled /></div>
        </label>
        <label>web editor</label>
      </div>
      <SettingsPage
        :custom-menu="settingsMenu"
        v-if="monacoStore.state.currentPath.value === BuiltInPage['<Settings>']"
      ></SettingsPage>
      <KeyboardShortcutsPage
        :custom-menu="settingsMenu"
        v-if="monacoStore.state.currentPath.value === BuiltInPage['<KeyboardShortcuts>']"
      ></KeyboardShortcutsPage>
    </div>
    <Prettier @click="handleFormat" class="monaco-tree-editor-prettier" />
  </div>
</template>

<style scoped lang="scss">
.monaco-tree-editor-select-item {
  margin: 0 15px;
}
</style>
