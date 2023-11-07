<script setup lang="ts">
import './index.less'
import { THEMES } from './constants'
import { onMounted, ref, watch, defineEmits } from 'vue'
import { useMonaco } from './monaco-store'
import { useHotkey } from './hotkey-store'
import * as monaco_define from 'monaco-editor'
import Prettier from './components/prettier/Index.vue'
import FileList from './components/filelist/Index.vue'
import OpenedTab from './components/openedtab/Index.vue'
import Modal from './components/modal/Index.vue'
import IconClose from './components/icons/Close'
import IconSetting from './components/icons/Setting'
import SelectMenu from './components/select/MenuTemp.vue'

const props = defineProps({
  files: {
    type: Object,
    default: () => ({}),
  },
  siderMinWidth: {
    type: Number,
    default: 180,
  },
})
const emit = defineEmits({
  addFile: (_path: string, _resolve: Function, _reject: Function) => true,
  saveFile: (_path: string, _resolve: Function, _reject: Function) => true,
  renameFile: (_path: string, _resolve: Function, _reject: Function) => true,
  deleteFile: (_path: string, _resolve: Function, _reject: Function) => true,
  addFolder: (_path: string, _resolve: Function, _reject: Function) => true,
  deleteFolder: (_path: string, _resolve: Function, _reject: Function) => true,
})

// ================ 拖拽功能 dragging start ================
const filelistWidth = ref(props.siderMinWidth)
const dragInfo = ref<any>({
  pageX: 0,
  width: 0,
  start: false,
})
const handleDragStart = (e: MouseEvent) => {
  console.debug('拖拽开始')
  dragInfo.value = {
    pageX: e.pageX,
    width: filelistWidth.value,
    start: true,
  }
}
const handleDrag = (e: MouseEvent) => {
  e.stopPropagation()
  if (dragInfo.value.start && e.pageX != 0) {
    const w = dragInfo.value.width + (e.pageX - dragInfo.value.pageX)
    console.debug('拖拽中', w < props.siderMinWidth ? props.siderMinWidth : w)
    filelistWidth.value = w < props.siderMinWidth ? props.siderMinWidth : w
  }
}
const handleDragEnd = (e: MouseEvent) => {
  console.debug('拖拽结束')
  dragInfo.value.start = false
}
watch(
  () => props.siderMinWidth,
  (n) => {
    filelistWidth.value = filelistWidth.value < n ? n : filelistWidth.value
  }
)
// ================ 拖拽功能 dragging end ================

// =============== 设置部分 setting start ================
const settingVisible = ref(false)
// ================ 设置部分 setting end ================

// ================ 编辑器部分 editor start ================
const autoPrettierRef = ref(true)
const handleSetAutoPrettier = (e: any) => {
  autoPrettierRef.value = e.target!.checked
}
const monacoStore = useMonaco()
monacoStore.loadFileTree(props.files)
watch(
  () => props.files,
  (n) => {
    monacoStore.loadFileTree(props.files)
  }
)
const editorRef = ref<HTMLElement>()
const handleFormat = () => {
  monacoStore.format()
}
onMounted(() => {
  monacoStore.init(editorRef.value!)
})
// ================ 编辑器部分 editor end ================

// ================ 回调事件 callback events start ================
const handleAddFile = (path: string) => {
  emit(
    'addFile',
    path,
    () => {},
    () => {}
  )
}
const handleAddFolder = (path: string) => {
  emit(
    'addFolder',
    path,
    () => {},
    () => {}
  )
}
const handleSaveFile = (path: string) => {
  emit(
    'saveFile',
    path,
    () => {},
    () => {}
  )
}
// ================ 回调事件 callback events end ================

// ================ 快捷键部分 hotkey start ================
const hotkeyStore = useHotkey()
const rootRef = ref<HTMLElement>()
onMounted(() => {
  hotkeyStore.init(rootRef.value!)
})
watch(
  () => hotkeyStore.currentEvent,
  (e) => {
    if (e?.ctrlKey && e.key.toLowerCase() === 's') {
      console.debug('Ctrl+s保存')
    }
  }
)

// ================ 快捷键部分 hotkey end ================

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
    <FileList
      @add-file="handleAddFile"
      @add-folder="handleAddFolder"
      :rootEl="rootRef"
      :style="{ width: filelistWidth + 'px', minWidth: '180px' }"
    />
    <div
      draggable="true"
      @dragstart="handleDragStart"
      @drag="handleDrag"
      @dragend="handleDragEnd"
      class="music-monaco-editor-drag"
    ></div>
    <div class="music-monaco-editor-area">
      <OpenedTab />
      <div id="editor" ref="editorRef" :style="{ flex: 1, width: '100%', maxHeight: 'calc(100% - 35px)' }"></div>
      <div v-show="!monacoStore.isReady || monacoStore.openedFiles.length === 0" class="music-monaco-editor-area-empty">
        <img
          src="//p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/5759801316/fb85/e193/a256/03a81ea60cf94212bbc814f2c82b6940.png"
          class="music-monaco-editor-area-empty-icon"
        />
        <div>web editor</div>
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
          设置
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
            <div class="music-monaco-editor-input-name">主题选择</div>
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
./monaco ./monaco-store
