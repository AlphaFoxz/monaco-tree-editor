<script setup lang="tsx">
import './index.scss'
import { onMounted, ref, watch, onBeforeUnmount, type ComputedRef } from 'vue'
import { BuiltInPage } from './define'
import { longestCommonPrefix, throttle } from './common'
import { type Files, useMonaco } from './domain/monaco-agg'
import { useHotkey } from './stores/hotkey-store'
import { useMessage } from './domain/message-agg'
import { useGlobalSettings } from './domain/global-settings-agg'
import { type ThemeMode, validThemeModes } from './themes/define'
import Prettier from './prettier/Index.vue'
import LeftSiderBar from './left-sider-bar/Index.vue'
import FileList from './folders/Index.vue'
import OpenedTab from './openedtab/Index.vue'
import GithubFilled from './icons/GithubFilled.vue'
import MessagePopup from './message-popup/Index.vue'
import { type Language, useI18n, validLanguages } from './domain/i18n-agg'
import SettingsPage from './pages/SettingsPage.vue'
import KeyboardShortcutsPage from './pages/KeyboardShortcuts.vue'

const props = defineProps({
  monacoId: {
    type: String,
    default: 'default',
  },
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
  language: {
    type: String,
    default: validLanguages[0],
    validator: (value: Language) => validLanguages.includes(value),
  },
  theme: {
    type: String,
    default: validThemeModes[0],
    validator: (value: ThemeMode) => validThemeModes.includes(value),
  },
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
const globalSettingsStore = useGlobalSettings()
globalSettingsStore.actions.setThemeMode(props.theme as ThemeMode)
const i18nStore = useI18n()
i18nStore.actions.setLanguage(props.language as Language)
watch(
  () => props.language,
  (n) => {
    if (n) {
      i18nStore.actions.setLanguage(n as Language)
    }
  }
)
const { t } = i18nStore.actions

// ================ 主题 theme ================
watch(
  () => props.theme,
  (n) => {
    if (n) {
      globalSettingsStore.actions.setThemeMode(n as ThemeMode)
    }
  }
)

// =============== 左边栏 left-sider-bar ================
const currentLeftSiderBar = globalSettingsStore.states.opendLeftSiderBar

// ================ 拖拽功能 dragging ================
const filelistWidth = ref(props.siderMinWidth)
const throttleResize = throttle((e: MouseEvent) => {
  if (dragInfo.start && e.pageX != 0) {
    const w = dragInfo.width + (e.pageX - dragInfo.pageX)
    console.debug('Dragging', w)
    if (w < props.siderMinWidth / 2) {
      globalSettingsStore.actions.switchCurrentLeftSiderBar(null)
    } else if (w >= props.siderMinWidth / 2) {
      globalSettingsStore.actions.switchCurrentLeftSiderBar('Explorer', false)
    }
    filelistWidth.value = w < props.siderMinWidth ? props.siderMinWidth : w
    monacoStore.actions._resize()
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

// ================ 编辑器部分 editor ================
const projectName = ref<any>('project')
let fileSeparator = '/'
let projectPrefix = ''
const monacoStore = useMonaco(props.monacoId)
monacoStore.actions._loadFileTree(props.files)
const editorRef = ref<HTMLElement>()
const handleFormat = () => {
  monacoStore.actions.format()
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
  monacoStore.actions._setPrefix(projectPrefix)
  monacoStore.actions._setFileSeparator(fileSeparator)
  return files
}
watch(
  () => props.files,
  (n) => {
    monacoStore.actions._loadFileTree(fixFilesPath(n))
  }
)
watch(
  () => props.fontSize,
  (n) => {
    monacoStore.actions.updateOptions({ fontSize: n })
  }
)
onMounted(() => {
  handleReload()
  monacoStore.actions._loadFileTree(fixFilesPath(props.files))
  monacoStore.actions._init(editorRef.value!, { fontSize: props.fontSize, automaticLayout: true })
})
onBeforeUnmount(() => {
  monacoStore.actions.getEditor()?.dispose()
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
  globalSettingsStore.actions._lockFile(filePath, () => {
    messageStore.actions.close(loadingMsgId)
    messageStore.actions.error({
      content: t('msg.timeout'),
      closeable: true,
    })
    globalSettingsStore.actions._unlockFile(filePath)
  })
}
const handleReload = (
  resolve = () => {
    messageStore.actions.success({
      content: t('msg.reloadSuccessed'),
      closeable: true,
      timeoutMs: 3000,
    })
  },
  reject = (msg = '') => {
    messageStore.actions.error({
      content: t('msg.reloadFailed', { msg }),
      closeable: true,
    })
  }
) => {
  const msgId = messageStore.actions.info({
    content: t('msg.reloading'),
    loading: true,
  })
  emit(
    'reload',
    () => {
      messageStore.actions.close(msgId)
      resolve()
    },
    (msg = '') => {
      messageStore.actions.close(msgId)
      reject(msg)
    }
  )
}
const handleNewFile = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore.actions._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.actions.info({
    content: t('msg.creating{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'newFile',
    oriPath,
    () => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.success({
        content: t('msg.createSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.error({
        content: t('msg.createFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}
const handleNewFolder = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore.actions._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.actions.info({
    content: t('msg.creating{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'newFolder',
    oriPath,
    () => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.success({
        content: t('msg.createSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.error({
        content: t('msg.createFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}
const handleSaveFile = (
  path: string,
  value = monacoStore.actions._getValue(path),
  resolve = () => {},
  reject = () => {}
) => {
  if (value === undefined || !path || !monacoStore.actions._hasChanged(path)) {
    console.debug('there is nothing changed.')
    resolve()
    return
  }
  if (globalSettingsStore.actions._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.actions.info({
    content: t('msg.saving{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'saveFile',
    oriPath,
    value,
    () => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.success({
        content: t('msg.saveSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.error({
        content: t('msg.saveFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleDeleteFile = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore.actions._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.actions.info({
    content: t('msg.deletingFile{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'deleteFile',
    oriPath,
    () => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.success({
        content: t('msg.deleteSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.error({
        content: t('msg.deleteFailed{msg}', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleDeleteFolder = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore.actions._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.actions.info({
    content: t('msg.deletingFolder{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'deleteFolder',
    oriPath,
    () => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.success({
        content: t('msg.deleteSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.error({
        content: t('msg.deleteFailed{msg}', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleRenameFile = (path: string, newName: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore.actions._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  let tmpArr = oriPath.split(fileSeparator)
  tmpArr.pop()
  tmpArr.push(newName)
  const newPath = tmpArr.join(fileSeparator)
  const msgId = messageStore.actions.info({
    content: t('msg.renamingFile{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'renameFile',
    oriPath,
    newPath,
    () => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.success({
        content: t('msg.renameSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.error({
        content: t('msg.renameFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleRenameFolder = (path: string, newName: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsStore.actions._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  let tmpArr = oriPath.split(fileSeparator)
  tmpArr.pop()
  tmpArr.push(newName)
  const newPath = tmpArr.join(fileSeparator)
  const msgId = messageStore.actions.info({
    content: t('msg.renamingFolder{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'renameFolder',
    oriPath,
    newPath,
    () => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.success({
        content: t('msg.renameSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsStore.actions._unlockFile(path)
      messageStore.actions.close(msgId)
      messageStore.actions.error({
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
    toOriginPath(monacoStore.states.currentPath.value),
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
      handleSaveFile(monacoStore.states.currentPath.value)
    }
  })
})

// 暴露方法 expose functions
defineExpose({
  resize: () => {
    monacoStore.actions._resize()
  },
  getMonaco: () => {
    return monacoStore.states.monaco
  },
  getEditor: (): ReturnType<typeof monacoStore.actions.getEditor> => {
    return monacoStore.actions.getEditor()
  },
})
</script>
<template>
  <div
    ref="rootRef"
    id="monaco-tree-editor-root"
    @contextmenu.prevent.stop
    tabIndex="1"
    :class="`monaco-tree-editor ${globalSettingsStore.states.themeMode.value}`"
  >
    <MessagePopup></MessagePopup>
    <LeftSiderBar :monaco-id="monacoId"></LeftSiderBar>
    <FileList
      :monaco-id="monacoId"
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
      <OpenedTab :monaco-id="monacoId" :fontSize="fontSize" @save-file="handleSaveFile" />
      <div
        id="editor"
        v-show="monacoStore.states.openedFiles.value.length > 0 && monacoStore.states.currentPath.value[0] !== '<'"
        ref="editorRef"
        @drop="dragInEditor"
        :style="{
          flex: 1,
          width: '100%',
        }"
      ></div>
      <div
        v-show="!monacoStore.states.isReady || !monacoStore.states.currentPath.value"
        class="monaco-tree-editor-area-empty"
      >
        <label>
          <div><GithubFilled /></div>
        </label>
        <label>web editor</label>
      </div>
      <SettingsPage
        :custom-menu="settingsMenu"
        v-if="monacoStore.states.currentPath.value === BuiltInPage['<Settings>']"
      ></SettingsPage>
      <KeyboardShortcutsPage
        :custom-menu="settingsMenu"
        v-if="monacoStore.states.currentPath.value === BuiltInPage['<KeyboardShortcuts>']"
      ></KeyboardShortcutsPage>
    </div>
    <Prettier :monaco-id="monacoId" @click="handleFormat" class="monaco-tree-editor-prettier" />
  </div>
</template>

<style scoped lang="scss">
.monaco-tree-editor-select-item {
  margin: 0 15px;
}
</style>
