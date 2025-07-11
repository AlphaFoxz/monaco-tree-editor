<script setup lang="tsx">
import './index.scss'
import { onMounted, ref, watch, onBeforeUnmount, type ComputedRef } from 'vue'
import { type ThemeMode, VALID_THEME_MODES, BuiltInPage } from '#domain/define'
import { throttle } from '#lib/common'
import { useMonaco } from '#domain/monaco-agg'
import { useHotkey } from '#domain/hotkey-agg'
import { useMessage } from '#domain/message-agg'
import { useGlobalSettings } from '#domain/global-settings-agg'

import LeftSiderBar from '#lib/left-sider-bar/Index.vue'
import FileList from '#lib/folders/Index.vue'
import OpenedTab from '#lib/openedtab/Index.vue'
import GithubFilled from '#icons/GithubFilled.vue'
import MessagePopup from '#lib/message-popup/Index.vue'
import DarkTheme from '#lib/themes/dark'
import LightTheme from '#lib/themes/light'
import { type Language, useI18n, validLanguages } from '#domain/i18n-agg'
import SettingsPage from '#pages/SettingsPage.vue'
import KeyboardShortcutsPage from '#pages/KeyboardShortcuts.vue'

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
    default: VALID_THEME_MODES[0],
    validator: (value: ThemeMode) => VALID_THEME_MODES.includes(value),
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
const globalSettingsAgg = useGlobalSettings()
globalSettingsAgg.commands.setThemeMode(props.theme as ThemeMode)
const i18nAgg = useI18n()
i18nAgg.commands.setLanguage(props.language as Language)
watch(
  () => props.language,
  (n) => {
    if (n) {
      i18nAgg.commands.setLanguage(n as Language)
    }
  }
)
const { t } = i18nAgg.commands

// ================ 主题 theme ================
watch(
  () => props.theme,
  (n) => {
    if (n) {
      globalSettingsAgg.commands.setThemeMode(n as ThemeMode)
    }
  }
)

// =============== 左边栏 left-sider-bar ================
const currentLeftSiderBar = globalSettingsAgg.states.opendLeftSiderBar

// ================ 拖拽功能 dragging ================
const filelistWidth = ref(props.siderMinWidth)
const throttleResize = throttle((e: MouseEvent) => {
  if (dragInfo.start && e.pageX != 0) {
    const w = dragInfo.width + (e.pageX - dragInfo.pageX)
    console.debug('Dragging', w)
    if (w < props.siderMinWidth / 2) {
      globalSettingsAgg.commands.switchCurrentLeftSiderBar(undefined)
    } else if (w >= props.siderMinWidth / 2) {
      globalSettingsAgg.commands.switchCurrentLeftSiderBar('Explorer', false)
    }
    filelistWidth.value = w < props.siderMinWidth ? props.siderMinWidth : w
    monacoAgg.commands._resize()
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
const monacoAgg = useMonaco(undefined, props.monacoId)
watch(
  () => props.files,
  async (v) => {
    await monacoAgg.commands._loadFileTree(v)
    console.debug('fileTree loaded')
  }
)
const editorRef = ref<HTMLElement>()
watch(
  () => props.fontSize,
  (n) => {
    monacoAgg.commands.updateOptions({ fontSize: n })
  }
)
onMounted(async () => {
  handleReload()
  await monacoAgg.commands._mount(editorRef.value!, { fontSize: props.fontSize, automaticLayout: true })
  monacoAgg.commands.defineTheme('dark', DarkTheme)
  monacoAgg.commands.defineTheme('light', LightTheme)
  monacoAgg.commands.setTheme(globalSettingsAgg.states.themeMode.value)
  console.debug('monaco mounted')
})
onBeforeUnmount(() => {
  monacoAgg.commands.getEditor()?.dispose()
})

// ================ 回调事件 callback events ================
const messageAgg = useMessage()
const toOriginPath = (path: string): string => {
  let oriPath = monacoAgg.states.prefix.value + path
  if (monacoAgg.states.fileSeparator.value === '\\') {
    oriPath = oriPath.replace(/\//g, '\\')
  }
  return oriPath
}
const lockFile = (filePath: string, loadingMsgId: string) => {
  globalSettingsAgg.commands._lockFile(filePath, () => {
    messageAgg.commands.close(loadingMsgId)
    messageAgg.commands.error({
      content: t('msg.timeout'),
      closeable: true,
    })
    globalSettingsAgg.commands._unlockFile(filePath)
  })
}
const handleReload = (
  resolve = () => {
    messageAgg.commands.success({
      content: t('msg.reloadSuccessed'),
      closeable: true,
      timeoutMs: 3000,
    })
  },
  reject = (msg = '') => {
    messageAgg.commands.error({
      content: t('msg.reloadFailed', { msg }),
      closeable: true,
    })
  }
) => {
  const msgId = messageAgg.commands.info({
    content: t('msg.reloading'),
    loading: true,
  })
  emit(
    'reload',
    () => {
      messageAgg.commands.close(msgId)
      resolve()
    },
    (msg = '') => {
      messageAgg.commands.close(msgId)
      reject(msg)
    }
  )
}
const handleNewFile = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsAgg.commands._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageAgg.commands.info({
    content: t('msg.creating{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'newFile',
    oriPath,
    () => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.success({
        content: t('msg.createSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.error({
        content: t('msg.createFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}
const handleNewFolder = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsAgg.commands._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageAgg.commands.info({
    content: t('msg.creating{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'newFolder',
    oriPath,
    () => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.success({
        content: t('msg.createSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.error({
        content: t('msg.createFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}
const handleSaveFile = (
  path: string | undefined,
  value = path === undefined ? '' : monacoAgg.commands._getValue(path),
  resolve = () => {},
  reject = () => {}
) => {
  if (value === undefined || path === undefined || !monacoAgg.commands._hasChanged(path)) {
    console.debug('there is nothing changed.')
    resolve()
    return
  }
  if (globalSettingsAgg.commands._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageAgg.commands.info({
    content: t('msg.saving{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'saveFile',
    oriPath,
    value,
    () => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.success({
        content: t('msg.saveSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.error({
        content: t('msg.saveFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleDeleteFile = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsAgg.commands._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageAgg.commands.info({
    content: t('msg.deletingFile{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'deleteFile',
    oriPath,
    () => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.success({
        content: t('msg.deleteSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.error({
        content: t('msg.deleteFailed{msg}', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleDeleteFolder = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsAgg.commands._isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageAgg.commands.info({
    content: t('msg.deletingFolder{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'deleteFolder',
    oriPath,
    () => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.success({
        content: t('msg.deleteSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.error({
        content: t('msg.deleteFailed{msg}', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleRenameFile = (path: string, newName: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsAgg.commands._isFileLocked(path)) {
    reject()
    return
  }
  const fileSeparator = monacoAgg.states.fileSeparator.value
  const oriPath = toOriginPath(path)
  let tmpArr = oriPath.split(fileSeparator)
  tmpArr.pop()
  tmpArr.push(newName)
  const newPath = tmpArr.join(fileSeparator)
  const msgId = messageAgg.commands.info({
    content: t('msg.renamingFile{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'renameFile',
    oriPath,
    newPath,
    () => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.success({
        content: t('msg.renameSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.error({
        content: t('msg.renameFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleRenameFolder = (path: string, newName: string, resolve = () => {}, reject = () => {}) => {
  if (globalSettingsAgg.commands._isFileLocked(path)) {
    reject()
    return
  }
  const fileSeparator = monacoAgg.states.fileSeparator.value
  const oriPath = toOriginPath(path)
  let tmpArr = oriPath.split(fileSeparator)
  tmpArr.pop()
  tmpArr.push(newName)
  const newPath = tmpArr.join(fileSeparator)
  const msgId = messageAgg.commands.info({
    content: t('msg.renamingFolder{path}', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'renameFolder',
    oriPath,
    newPath,
    () => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.success({
        content: t('msg.renameSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalSettingsAgg.commands._unlockFile(path)
      messageAgg.commands.close(msgId)
      messageAgg.commands.error({
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
    toOriginPath(monacoAgg.states.currentPath.value!),
    e.dataTransfer.getData('type') as 'file' | 'folder'
  )
}

// ================ 快捷键部分 hotkey ================
const hotkeyAgg = useHotkey(props.monacoId)
const fileListRef = ref()
hotkeyAgg.commands._setCommandHandler((hotkey, e) => {
  const command = hotkey.command
  if (hotkey && hotkey.isMatch(e)) {
    if (command === 'Format') {
      monacoAgg.commands.format()
    } else if (command === 'Save') {
      handleSaveFile(monacoAgg.states.currentPath.value)
    } else if (command === 'DeleteFile') {
      const path = monacoAgg.states.currentPath.value
      if (path && !(path in BuiltInPage)) {
        fileListRef.value.handleDeleteFile(path)
      }
    } else {
      isNever(command)
    }
  }
})
const rootRef = ref<HTMLElement>()
onMounted(() => {
  hotkeyAgg.commands._init('root', rootRef.value!)
  hotkeyAgg.commands._init('editor', editorRef.value!)
})

// 暴露方法 expose functions
defineExpose({
  resize: monacoAgg.commands._resize,
  getMonaco: monacoAgg.commands.getMonaco,
  getEditor: monacoAgg.commands.getEditor,
})
</script>
<template>
  <div
    ref="rootRef"
    id="monaco-tree-editor-root"
    @contextmenu.prevent.stop
    tabIndex="1"
    :class="`monaco-tree-editor ${globalSettingsAgg.states.themeMode.value}`"
  >
    <MessagePopup></MessagePopup>
    <LeftSiderBar :monaco-id="monacoId"></LeftSiderBar>
    <FileList
      :monaco-id="monacoId"
      v-show="currentLeftSiderBar === 'Explorer'"
      ref="fileListRef"
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
      :project-name="monacoAgg.states.projectName.value"
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
        v-show="
          monacoAgg.states.openedFiles.value.length > 0 &&
          monacoAgg.states.currentPath.value !== undefined &&
          !(monacoAgg.states.currentPath.value in BuiltInPage)
        "
        ref="editorRef"
        @drop="dragInEditor"
        :style="{
          flex: 1,
          width: '100%',
        }"
      ></div>
      <div
        v-show="!monacoAgg.states.isInitialized.value || !monacoAgg.states.currentPath.value"
        class="monaco-tree-editor-area-empty"
      >
        <label>
          <div><GithubFilled /></div>
        </label>
        <label>web editor</label>
      </div>
      <SettingsPage
        :custom-menu="settingsMenu"
        v-if="monacoAgg.states.currentPath.value === BuiltInPage['<Settings>']"
      ></SettingsPage>
      <KeyboardShortcutsPage
        :monaco-id="monacoId"
        :custom-menu="settingsMenu"
        v-if="monacoAgg.states.currentPath.value === BuiltInPage['<KeyboardShortcuts>']"
      ></KeyboardShortcutsPage>
    </div>
  </div>
</template>

<style scoped lang="scss">
.monaco-tree-editor-select-item {
  margin: 0 15px;
}
</style>
