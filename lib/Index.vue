<script setup lang="tsx">
import './index.scss'
import { onMounted, ref, watch, defineEmits, nextTick, onBeforeUnmount, type ComputedRef } from 'vue'
import { type Files } from './define'
import { longestCommonPrefix } from './common'
import { useMonaco } from './monaco-store'
import { useHotkey } from './hotkey-store'
import { useMessage } from './message-store'
import { useGlobalVar } from './global-var-store'
import * as monaco_define from 'monaco-editor'
import Prettier from './prettier/Index.vue'
import FileList from './filelist/Index.vue'
import OpenedTab from './openedtab/Index.vue'
import Modal from './modal/Index.vue'
import IconClose from './icons/Close'
import IconSetting from './icons/Setting'
import Message from './message-bar/Index.vue'
import { useI18n, type Language, changeLanguage } from './locale'

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
    default: 240,
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
const { t, r } = useI18n((props.language || 'en-US') as Language)
watch(
  () => props.language,
  (n) => {
    if (n) {
      changeLanguage(n as Language)
    }
  }
)

// ================ 拖拽功能 dragging ================
const filelistWidth = ref(props.siderMinWidth)
let dragInfo = {
  pageX: 0,
  width: 0,
  start: false,
}
const handleDragStart = (e: MouseEvent) => {
  console.debug('dragStart')
  dragInfo = {
    pageX: e.pageX,
    width: filelistWidth.value,
    start: true,
  }
}
const handleDrag = (e: MouseEvent) => {
  e.stopPropagation()
  if (dragInfo.start && e.pageX != 0) {
    const w = dragInfo.width + (e.pageX - dragInfo.pageX)
    console.debug('Dragging')
    filelistWidth.value = w < props.siderMinWidth ? props.siderMinWidth : w
    nextTick(() => {
      monacoStore.resize()
    })
  }
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

// =============== 设置部分 setting ================
const settingVisible = ref(false)

// ================ 编辑器部分 editor ================
const projectName = ref<any>('project')
let fileSeparator = '/'
let projectPrefix = ''
const openedCount = ref(0)
const monacoStore = useMonaco()
monacoStore.loadFileTree(props.files)
const editorRef = ref<HTMLElement>()
const handleFormat = () => {
  monacoStore.format()
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
  monacoStore.prefix.value = projectPrefix
  monacoStore.fileSeparator.value = fileSeparator
  return files
}
watch(
  () => props.files,
  (n) => {
    monacoStore.loadFileTree(fixFilesPath(n))
  }
)
watch(
  () => props.fontSize,
  (n) => {
    monacoStore.updateOptions({ fontSize: n })
  }
)
watch(monacoStore.openedFiles, (n) => {
  openedCount.value = n.length
})
onMounted(() => {
  handleReload()
  monacoStore.loadFileTree(fixFilesPath(props.files))
  monacoStore.init(editorRef.value!, { fontSize: props.fontSize, automaticLayout: true })
})
onBeforeUnmount(() => {
  monacoStore.getEditor().dispose()
})

// ================ 回调事件 callback events ================
const messageStore = useMessage()
const globalVarStore = useGlobalVar()
const toOriginPath = (path: string): string => {
  let oriPath = projectPrefix + path
  if (fileSeparator === '\\') {
    oriPath = oriPath.replace(/\//g, '\\')
  }
  return oriPath
}
const lockFile = (filePath: string, loadingMsgId: string) => {
  globalVarStore.lockFile(filePath, () => {
    messageStore.close(loadingMsgId)
    messageStore.error({
      content: t('msg.timeout'),
      closeable: true,
    })
    globalVarStore.unlockFile(filePath)
  })
}
const handleReload = (
  resolve = () => {
    messageStore.success({
      content: t('msg.reloadSuccessed'),
      closeable: true,
      timeoutMs: 3000,
    })
  },
  reject = (msg = '') => {
    messageStore.error({
      content: t('msg.reloadFailed', { msg }),
      closeable: true,
    })
  }
) => {
  const msgId = messageStore.info({
    content: t('msg.reloading'),
    loading: true,
  })
  emit(
    'reload',
    () => {
      messageStore.close(msgId)
      resolve()
    },
    (msg = '') => {
      messageStore.close(msgId)
      reject(msg)
    }
  )
}
const handleNewFile = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalVarStore.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.info({
    content: t('msg.creating', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'newFile',
    oriPath,
    () => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.success({
        content: t('msg.createSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.error({
        content: t('msg.createFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}
const handleNewFolder = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalVarStore.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.info({
    content: t('msg.creating', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'newFolder',
    oriPath,
    () => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.success({
        content: t('msg.createSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.error({
        content: t('msg.createFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}
const handleSaveFile = (path: string, value = monacoStore.getValue(path), resolve = () => {}, reject = () => {}) => {
  if (value === undefined || !path || !monacoStore.hasChanged(path)) {
    console.debug('there is no changed.')
    resolve()
    return
  }
  if (globalVarStore.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.info({
    content: t('msg.saving', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'saveFile',
    oriPath,
    value,
    () => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.success({
        content: t('msg.saveSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.error({
        content: t('msg.saveFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleDeleteFile = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalVarStore.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.info({
    content: t('msg.deletingFile', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'deleteFile',
    oriPath,
    () => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.success({
        content: t('msg.deleteSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.error({
        content: t('msg.deleteFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleDeleteFolder = (path: string, resolve = () => {}, reject = () => {}) => {
  if (globalVarStore.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.info({
    content: t('msg.deletingFolder', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'deleteFolder',
    oriPath,
    () => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.success({
        content: t('msg.deleteSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.error({
        content: t('msg.deleteFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleRenameFile = (path: string, newName: string, resolve = () => {}, reject = () => {}) => {
  if (globalVarStore.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  let tmpArr = oriPath.split(fileSeparator)
  tmpArr.pop()
  tmpArr.push(newName)
  const newPath = tmpArr.join(fileSeparator)
  const msgId = messageStore.info({
    content: t('msg.renamingFile', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'renameFile',
    oriPath,
    newPath,
    () => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.success({
        content: t('msg.renameSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.error({
        content: t('msg.renameFailed', { msg }),
        closeable: true,
      })
      reject()
    }
  )
}

const handleRenameFolder = (path: string, newName: string, resolve = () => {}, reject = () => {}) => {
  if (globalVarStore.isFileLocked(path)) {
    reject()
    return
  }
  const oriPath = toOriginPath(path)
  let tmpArr = oriPath.split(fileSeparator)
  tmpArr.pop()
  tmpArr.push(newName)
  const newPath = tmpArr.join(fileSeparator)
  const msgId = messageStore.info({
    content: t('msg.renamingFolder', { path }),
    loading: true,
  })
  lockFile(path, msgId)
  emit(
    'renameFolder',
    oriPath,
    newPath,
    () => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.success({
        content: t('msg.renameSuccessed'),
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      globalVarStore.unlockFile(path)
      messageStore.close(msgId)
      messageStore.error({
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
    toOriginPath(monacoStore.currentPath.value),
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
      handleSaveFile(monacoStore.currentPath.value)
    }
  })
})

// 暴露方法 expose functions
defineExpose({
  resize: () => {
    monacoStore.resize()
  },
  getMonaco: () => {
    return monacoStore.monaco
  },
  getEditor: (): monaco_define.editor.IStandaloneCodeEditor => {
    return monacoStore.getEditor()
  },
})
</script>
<template>
  <div ref="rootRef" id="music-monaco-editor-root" tabIndex="1" class="music-monaco-editor">
    <Message></Message>
    <FileList
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
      class="music-monaco-editor-drag"
    ></div>
    <div class="music-monaco-editor-area">
      <OpenedTab :fontSize="fontSize" @save-file="handleSaveFile" />
      <div
        id="editor"
        v-show="openedCount > 0"
        ref="editorRef"
        @drop="dragInEditor"
        :style="{
          flex: 1,
          width: '100%',
          height: '100%',
          maxHeight: 'calc(100% - 35px)',
        }"
      ></div>
      <div
        v-show="!monacoStore.isReady || monacoStore.openedFiles.value.length === 0"
        class="music-monaco-editor-area-empty"
      >
        <label>web editor</label>
      </div>
    </div>
    <div class="music-monaco-editor-setting-button" @click="settingVisible = true">
      <IconSetting
        :style="{
          width: '20px',
          height: '20px',
        }"
      />
    </div>
    <Prettier @click="handleFormat" class="music-monaco-editor-prettier" />
    <Modal
      v-show="settingVisible"
      destroyOnClose
      @close="settingVisible = false"
      :visible="settingVisible"
      :target="rootRef"
    >
      <div class="music-monaco-editor-setting">
        <div class="music-monaco-editor-setting-header">
          {{ r('settings.title').value }}
          <div @click="settingVisible = false" class="music-monaco-editor-setting-header-close">
            <IconClose :style="{ width: '12px', height: '12px' }" />
          </div>
        </div>
        <div class="music-monaco-editor-setting-content">
          <div v-if="!language" class="music-monaco-editor-input-row">
            <div class="music-monaco-editor-input-name">
              {{ r('settings.language').value + '' }}
            </div>
            <div
              class="music-monaco-editor-select-item"
              style="cursor: pointer"
              @click="
                () => {
                  changeLanguage('en-US')
                  messageStore.success({ content: 'Switch to English', timeoutMs: 2000 })
                }
              "
            >
              English
            </div>
            <div
              class="music-monaco-editor-select-item"
              style="cursor: pointer"
              @click="
                () => {
                  changeLanguage('zh-CN')
                  messageStore.success({ content: '切换为简体中文', timeoutMs: 2000 })
                }
              "
            >
              简体中文
            </div>
          </div>
          <div class="music-monaco-editor-input-row" v-for="(item, i) in settingsMenu" :key="i">
            <div class="music-monaco-editor-input-name"></div>
            <div class="music-monaco-editor-select-item" style="cursor: pointer" @click="item.handler">
              {{ item.label }}
            </div>
          </div>
          <!-- <div class="music-monaco-editor-input-row">
            <div class="music-monaco-editor-input-name">theme</div>
            <div class="music-monaco-editor-input-value">
              <Select v-for="item in THEMES" defaultValue="OneDarkPro" @change="(v) => configTheme(v.value)">
                <SelectMenu :label="item" :value="item" :key="item" />
              </Select>
              <div v-for="item in THEMES" defaultValue="OneDarkPro">
                <SelectMenu :label="item" :value="item" :key="item" />
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped lang="less">
.music-monaco-editor-select-item {
  margin: 0 15px;
}
</style>
