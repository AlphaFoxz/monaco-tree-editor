<script setup lang="tsx">
import './index.less'
import { THEMES } from './constants'
import { onMounted, ref, watch, defineEmits, nextTick } from 'vue'
import { type Files } from './define'
import { longestCommonPrefix } from './common'
import { useMonaco } from './monaco-store'
import { useHotkey } from './hotkey-store'
import { useMessage } from './message-store'
import * as monaco_define from 'monaco-editor'
import Prettier from './prettier/Index.vue'
import FileList from './filelist/Index.vue'
import OpenedTab from './openedtab/Index.vue'
import Modal from './modal/Index.vue'
import IconClose from './icons/Close'
import IconSetting from './icons/Setting'
import SelectMenu from './select/MenuTemp.vue'
import Message from './message-bar/Index.vue'

const props = defineProps({
  files: {
    type: Object,
    default: () => ({}),
  },
  prefix: {
    type: String,
  },
  timeoutMs: {
    type: Number,
    default: 5000,
  },
  siderMinWidth: {
    type: Number,
    default: 240,
  },
  fileMenu: {
    type: Array,
    default: () => [],
  },
  folderMenu: {
    type: Array,
    default: () => [],
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
  contextmenuSelect: (_path: string, _item: { label: string; value: any }) => true,
})

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
const autoPrettierRef = ref(true)
const handleSetAutoPrettier = (e: any) => {
  autoPrettierRef.value = e.target!.checked
}
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
onMounted(() => {
  handleReload()
  monacoStore.loadFileTree(fixFilesPath(props.files))
  monacoStore.init(editorRef.value!)
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
const handleReload = (
  resolve = () => {
    messageStore.success({
      content: 'Reload successed!',
      closeable: true,
      timeoutMs: 3000,
    })
  },
  reject = (msg = '') => {
    messageStore.error({
      content: `Reload failed! ${msg}`,
      closeable: true,
    })
  }
) => {
  const msgId = messageStore.info({
    content: `Reloading...`,
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
  const oriPath = toOriginPath(path)
  const msgId = messageStore.info({
    content: `[ ${path} ] Creating...`,
    loading: true,
  })
  emit(
    'newFile',
    oriPath,
    () => {
      messageStore.close(msgId)
      messageStore.success({
        content: 'Creating successed!',
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      messageStore.close(msgId)
      messageStore.error({
        content: `Creating failed! ${msg}`,
        closeable: true,
      })
      reject()
    }
  )
}
const handleNewFolder = (path: string, resolve = () => {}, reject = () => {}) => {
  const oriPath = toOriginPath(path)
  const msgId = messageStore.info({
    content: `[ ${path} ] Creating...`,
    loading: true,
  })
  emit(
    'newFolder',
    oriPath,
    () => {
      messageStore.close(msgId)
      messageStore.success({
        content: 'Creating successed!',
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      messageStore.close(msgId)
      messageStore.error({
        content: `Creating failed! ${msg}`,
        closeable: true,
      })
      reject()
    }
  )
}
const handleSaveFile = (path: string, value = monacoStore.getValue(path), resolve = () => {}, reject = () => {}) => {
  if (!value || !path || !monacoStore.hasChanged(path)) {
    console.debug('there is nothing to save.')
    resolve()
    return
  }
  const oriPath = toOriginPath(path)
  const msgId = messageStore.info({
    content: `[ ${path} ] Saving...`,
    loading: true,
  })
  emit(
    'saveFile',
    oriPath,
    value,
    () => {
      messageStore.close(msgId)
      messageStore.success({
        content: 'Save successed!',
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      messageStore.close(msgId)
      messageStore.error({
        content: `Save failed! ${msg}`,
        closeable: true,
      })
      reject()
    }
  )
}

const handleDeleteFile = (path: string, resolve = () => {}, reject = () => {}) => {
  const oriPath = toOriginPath(path)
  const msgId = messageStore.info({
    content: `[ ${path} ] Deleting File...`,
    loading: true,
  })
  emit(
    'deleteFile',
    oriPath,
    () => {
      messageStore.close(msgId)
      messageStore.success({
        content: 'Delete successed!',
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      messageStore.close(msgId)
      messageStore.error({
        content: `Delete failed! ${msg}`,
        closeable: true,
      })
      reject()
    }
  )
}

const handleDeleteFolder = (path: string, resolve = () => {}, reject = () => {}) => {
  const oriPath = toOriginPath(path)
  const msgId = messageStore.info({
    content: `[ ${path}] Deleting Folder...`,
    loading: true,
  })
  emit(
    'deleteFolder',
    oriPath,
    () => {
      messageStore.close(msgId)
      messageStore.success({
        content: 'Delete successed!',
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      messageStore.close(msgId)
      messageStore.error({
        content: `Delete failed! ${msg}`,
        closeable: true,
      })
      reject()
    }
  )
}

const handleRenameFile = (path: string, newName: string, resolve = () => {}, reject = () => {}) => {
  const oriPath = toOriginPath(path)
  let tmpArr = oriPath.split(fileSeparator)
  tmpArr.pop()
  tmpArr.push(newName)
  const newPath = tmpArr.join(fileSeparator)
  const msgId = messageStore.info({
    content: `[ ${path} ] Renaming File...`,
    loading: true,
  })
  emit(
    'renameFile',
    oriPath,
    newPath,
    () => {
      messageStore.close(msgId)
      messageStore.success({
        content: 'Rename successed!',
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      messageStore.close(msgId)
      messageStore.error({
        content: `Rename failed! ${msg}`,
        closeable: true,
      })
      reject()
    }
  )
}

const handleRenameFolder = (path: string, newName: string, resolve = () => {}, reject = () => {}) => {
  const oriPath = toOriginPath(path)
  let tmpArr = oriPath.split(fileSeparator)
  tmpArr.pop()
  tmpArr.push(newName)
  const newPath = tmpArr.join(fileSeparator)
  const msgId = messageStore.info({
    content: `[ ${path} ] Renaming Folder...`,
    loading: true,
  })
  emit(
    'renameFolder',
    oriPath,
    newPath,
    () => {
      messageStore.close(msgId)
      messageStore.success({
        content: 'Rename successed!',
        timeoutMs: 3000,
        closeable: true,
      })
      handleReload()
      resolve()
    },
    (msg = '') => {
      messageStore.close(msgId)
      messageStore.error({
        content: `Rename failed! ${msg}`,
        closeable: true,
      })
      reject()
    }
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
      @contextmenu-select="(path, item) => emit('contextmenuSelect', path, item)"
      :project-name="projectName"
      :rootEl="rootRef"
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
      <OpenedTab @save-file="handleSaveFile" />
      <div
        id="editor"
        ref="editorRef"
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
          setting
          <div @click="settingVisible = false" class="music-monaco-editor-setting-header-close">
            <IconClose :style="{ width: '12px', height: '12px' }" />
          </div>
        </div>
        <div class="music-monaco-editor-setting-content">
          <div class="music-monaco-editor-input-row">
            <div class="music-monaco-editor-input-name">prettier</div>
            <div class="music-monaco-editor-input-value">
              <input
                id="prettierCheck"
                :defaultChecked="autoPrettierRef"
                type="checkbox"
                @change="handleSetAutoPrettier"
              />
              <label for="prettierCheck">prettier on save</label>
            </div>
          </div>
          <div class="music-monaco-editor-input-row">
            <div class="music-monaco-editor-input-name">theme</div>
            <div class="music-monaco-editor-input-value">
              <!-- <Select v-for="item in THEMES" defaultValue="OneDarkPro" @change="(v) => configTheme(v.value)">
                <SelectMenu :label="item" :value="item" :key="item" />
              </Select> -->
              <div v-for="item in THEMES" defaultValue="OneDarkPro">
                <SelectMenu :label="item" :value="item" :key="item" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
