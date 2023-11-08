<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ContextMenu from '../context-menu/Index.vue'
import Confirm from '../modal/Confirm.vue'
import Icons from '../icons'
import type { ContextMenuItem } from '../context-menu/define'
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
  saveFile: (_path: string) => true,
  abortSave: (_path: string) => true,
  closeOtherFiles: (_path?: string) => true,
})
//========================= 点击标签 click tab start ==========================
const itemRef = ref<HTMLDivElement>()
const name = props.file!.path.split('/').slice(-1)[0]
let fileType: string
if (props.file!.path && props.file!.path.indexOf('.') !== -1) {
  fileType = `file_type_${props.file!.path.split('.').slice(-1)}`
} else {
  fileType = 'default_file'
}
const active = computed(() => props.currentPath === props.file!.path)

const handlePathChange = (e: MouseEvent) => {
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
//========================= 点击标签 click tab end ==========================

//========================= 右键菜单 contextmenu start ==========================
type _MenuValue = 'close' | 'closeOther' | 'closeAll'
const contextMenu: ContextMenuItem<_MenuValue>[] = [
  { label: '关闭', value: 'close' },
  { label: '关闭其他', value: 'closeOther' },
  { label: '关闭所有', value: 'closeAll' },
]
const handleSelectContextMenu = (item: ContextMenuItem<_MenuValue>) => {
  console.debug('当前选择', item)
  const v = item.value
  if (v === 'close') {
    handleClose()
  } else if (v === 'closeOther') {
    emit('closeOtherFiles', props.file!.path)
  } else if (v === 'closeAll') {
    emit('closeOtherFiles')
  } else {
    const _t: undefined = v
  }
}
//========================= 右键菜单 contextmenu end ==========================

//========================= 鼠标悬停效果 mousehover start ==========================
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
//========================= 鼠标悬停效果 mousehover end ==========================

//========================= 关闭文件 closeFile start ==========================
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
  emit('saveFile', props.file!.path)
  emit('closeFile', props.file!.path)
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
//========================= 关闭文件 closeFile end ==========================
</script>
<template>
  <Confirm
    @ok="handleSaveAndClose"
    @cancel="handleCloseWithoutSave"
    @close="confirmVisible = false"
    v-if="confirmVisible"
  >
    <template #title>是否要保存对本文件的修改</template>
    <template #okText>保存</template>
    <template #cancelText>不保存</template>
    <template #content>
      <div>
        <div>如果不保存，你的更改将丢失</div>
        <div>当前文件路径: {{ file!.path }}</div>
      </div>
    </template>
  </Confirm>
  <ContextMenu :menu="contextMenu" @select="handleSelectContextMenu">
    <div
      ref="itemRef"
      @mouseover="handleOver"
      @mouseleave="handleLeave"
      :data-src="file!.path"
      :class="`music-monaco-editor-opened-tab-item ${active ? 'music-monaco-editor-opened-tab-item-focused' : ''}`"
      @click="handlePathChange"
    >
      <Icons :type="fileType" :style="{ marginRight: '2px' }" />
      <span :style="{ flex: 1, paddingRight: '5px' }">{{ name }}</span>
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
