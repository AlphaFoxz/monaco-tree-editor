<script setup lang="ts">
import { computed, ref, watch, defineExpose } from 'vue'
import ContextMenu from '../context-menu/Index.vue'
import Confirm from '../modal/Confirm.vue'
import Icons from '../icons'
import type { ContextMenuItem } from '../context-menu/define'
import { useMonaco } from '../monaco-store'
import { useI18n } from '../locale'

const props = defineProps({
  file: {
    type: Object,
    required: true,
  },
  currentPath: {
    type: String,
    default: '',
  },
  rootEl: {
    type: HTMLElement,
  },
})
const emit = defineEmits({
  pathChange: (_key: string) => true,
  closeFile: (_path: string) => true,
  saveFile: (_path: string, _value: string, _resolve?: () => void, _reject?: () => void) => true,
  abortSave: (_path: string) => true,
  closeOtherFiles: (_path?: string) => true,
})
const monacoStore = useMonaco()

//========================= 国际化 i18n ==========================
const { r } = useI18n()

//========================= 点击标签 click tab ==========================
const itemRef = ref<HTMLDivElement>()
const name = props.file!.path.split('/').slice(-1)[0]
let fileType: string
if (props.file!.path && props.file!.path.indexOf('.') !== -1) {
  fileType = `file_type_${props.file!.path.split('.').slice(-1)}`
} else {
  fileType = 'default_file'
}
const active = ref(monacoStore.currentPath.value === props.file!.path)
watch(monacoStore.currentPath, (n) => {
  active.value = n === props.file!.path
})
const handleClick = (e: MouseEvent) => {
  console.debug('active', props.currentPath)
  if (e.buttons === 4) {
    handleClose(e)
  } else if (e.buttons === 1) {
    pathChange(e)
  }
}
const pathChange = (e: MouseEvent) => {
  if (!e.currentTarget || !(e.currentTarget instanceof HTMLElement) || !e.currentTarget.dataset) {
    return
  }
  const key = e.currentTarget.dataset.name || e.currentTarget.dataset.src
  emit('pathChange', key!)
}
watch(active, () => {
  if (active) {
    itemRef.value?.scrollIntoView({
      block: 'nearest',
    })
  }
})

//========================= 右键菜单 contextmenu ==========================
type _MenuValue = 'close' | 'closeOthers' | 'closeAll'
const contextMenu: ContextMenuItem<_MenuValue>[] = [
  { label: r('ctxmenu.close'), value: 'close' },
  { label: r('ctxmenu.closeOthers'), value: 'closeOthers' },
  { label: r('ctxmenu.closeAll'), value: 'closeAll' },
]
const handleSelectContextMenu = (item: ContextMenuItem<_MenuValue>) => {
  const v = item.value
  if (v === 'close') {
    handleClose()
  } else if (v === 'closeOthers') {
    emit('closeOtherFiles', props.file!.path)
  } else if (v === 'closeAll') {
    emit('closeOtherFiles')
  } else {
    const t: undefined = v
    console.debug(t)
  }
}

//========================= 鼠标悬停效果 mousehover ==========================
const hover = ref(false)
const hoverRight = ref(false)
const handleOver = (e: MouseEvent) => {
  if (e.target instanceof HTMLElement) {
    if (e.target.dataset.name === 'editing') {
      hoverRight.value = true
    } else {
      hoverRight.value = false
    }
  }
  hover.value = true
}
const handleLeave = () => {
  hover.value = false
  hoverRight.value = false
}

//========================= 回调 callback ==========================
const confirmVisible = ref(false)
const handleClose = (e?: Event) => {
  e?.stopPropagation()
  if (props.file?.status === 'editing') {
    confirmVisible.value = true
  } else {
    if (props.file?.path) {
      emit('closeFile', props.file?.path)
    }
  }
}
const handleSaveAndClose = () => {
  const path = props.file!.path
  const value = monacoStore.getValue(path)
  if (!value) {
    return
  }
  emit(
    'saveFile',
    path,
    value,
    () => {
      emit('closeFile', props.file!.path)
    },
    () => {}
  )
  confirmVisible.value = false
}
const handleCloseWithoutSave = () => {
  emit('closeFile', props.file!.path)
  confirmVisible.value = false
}
const closeVisible = computed(() => {
  if (props.file!.status === 'editing' && !hoverRight.value) {
    return false
  } else if (props.file!.status !== 'editing' && !hover.value && !active.value) {
    return false
  }
  return true
})

//========================= 回调 expose ==========================
defineExpose({
  tryClose: handleClose,
})
</script>
<template>
  <Confirm
    @ok="handleSaveAndClose"
    @cancel="handleCloseWithoutSave"
    @close="confirmVisible = false"
    v-if="confirmVisible"
  >
    <template #title>{{ r('confirm.saveOnCloseTitle').value }}</template>
    <template #okText>{{ r('confirm.save').value }}</template>
    <template #cancelText>{{ r('confirm.dontSave').value }}</template>
    <template #content>
      <div>
        {{ r('confirm.saveOnCloseContent', { path: file!.path }).value }}
      </div>
    </template>
  </Confirm>
  <ContextMenu :menu="contextMenu" @select="handleSelectContextMenu">
    <div
      ref="itemRef"
      draggable="true"
      @mouseover="handleOver"
      @mouseleave="handleLeave"
      @mousedown="handleClick"
      :data-src="file!.path"
      :style="active ? 'background-color: rgb(30, 30, 30);' : ''"
      :class="`music-monaco-editor-opened-tab-item ${active ? 'music-monaco-editor-opened-tab-item-focused' : ''}`"
    >
      <Icons :type="fileType" :style="{ marginRight: '2px' }" />
      <span :style="{ flex: 1, paddingRight: '5px', fontStyle: !file.status ? 'italic' : 'normal' }">{{ name }}</span>
      <span
        data-name="editing"
        class="music-monaco-editor-opened-tab-item-editing"
        :style="{
          visibility: file.status === 'editing' && !hoverRight ? 'visible' : 'hidden',
        }"
      ></span>
      <span
        data-name="editing"
        @click="handleClose"
        :style="{
          visibility: closeVisible ? 'visible' : 'hidden',
        }"
        class="music-monaco-editor-opened-tab-item-close"
      >
        x
      </span>
    </div>
  </ContextMenu>
</template>
