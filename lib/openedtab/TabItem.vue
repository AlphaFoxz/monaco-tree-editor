<script setup lang="ts">
import { computed, ref, watchEffect, nextTick } from 'vue'
import ContextMenu from '#components/context-menu/Index.vue'
import Confirm from '#components/modal/Confirm.vue'
import Icons from '#icons/Index.vue'
import Close from '#icons/Close.vue'
import { type ContextMenuItem } from '#components/context-menu/define'
import { useMonaco } from '#domain/monaco-agg'
import { useI18n } from '#domain/i18n-agg'

const props = defineProps({
  monacoId: {
    type: String,
    required: true,
  },
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
const monacoStore = useMonaco(undefined, props.monacoId)

//========================= 国际化 i18n ==========================
const { $t } = useI18n().commands

//========================= 点击标签 click tab ==========================
const itemRef = ref<HTMLDivElement>()
const name = props.file!.path.split('/').slice(-1)[0]
let fileType: string
if (props.file!.path && props.file!.path.indexOf('.') !== -1) {
  fileType = `file_type_${props.file!.path.split('.').slice(-1)}`
} else {
  fileType = 'default_file'
}
const active = ref(false)
watchEffect(() => {
  const b = monacoStore.states.currentPath.value === props.file!.path
  active.value = b
  if (b) {
    itemRef.value?.scrollIntoView({
      block: 'nearest',
    })
  }
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

//========================= 右键菜单 contextmenu ==========================
type _MenuValue = '@close' | '@closeOthers' | '@closeAll' | '@copyPath' | '@copyRelativePath'
const contextMenu: ContextMenuItem<_MenuValue>[] = [
  { label: $t('ctxmenu.close'), value: '@close' },
  { label: $t('ctxmenu.closeOthers'), value: '@closeOthers' },
  { label: $t('ctxmenu.closeAll'), value: '@closeAll' },
  {},
  { label: $t('ctxmenu.copyPath'), value: '@copyPath' },
  { label: $t('ctxmenu.copyRelativePath'), value: '@copyRelativePath' },
]
const handleSelectContextMenu = (item: ContextMenuItem<_MenuValue>) => {
  const v = item.value
  if (v === '@close') {
    handleClose()
  } else if (v === '@closeOthers') {
    emit('closeOtherFiles', props.file!.path)
  } else if (v === '@closeAll') {
    emit('closeOtherFiles')
  } else if (v === '@copyPath') {
    const path = monacoStore.commands._getAbsolutePath(props.file.path)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(path)
    } else {
      // TODO
    }
  } else if (v === '@copyRelativePath') {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(props.file.path)
    } else {
      // TODO
    }
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
const handleClose = async (e?: Event): Promise<void> => {
  e?.stopPropagation()
  if (props.file?.status === 'editing') {
    confirmVisible.value = true
  } else {
    if (props.file?.path) {
      emit('closeFile', props.file?.path)
      await nextTick()
    }
  }
}
const handleSaveAndClose = () => {
  const path = props.file!.path
  const value = monacoStore.commands._getValue(path)
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
    :monaco-id="monacoId"
    @ok="handleSaveAndClose"
    @cancel="handleCloseWithoutSave"
    @close="confirmVisible = false"
    v-if="confirmVisible"
  >
    <template #title>{{ $t('confirm.saveOnCloseTitle').value }}</template>
    <template #okText>{{ $t('confirm.save').value }}</template>
    <template #cancelText>{{ $t('confirm.dontSave').value }}</template>
    <template #content>
      <div>
        {{ $t('confirm.saveOnCloseContent', { path: file!.path }).value }}
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
      :title="monacoStore.commands._getAbsolutePath(file.path)"
      :data-src="file.path"
      :class="`monaco-tree-editor-opened-tab-item ${active ? 'monaco-tree-editor-opened-tab-item-active' : ''}`"
    >
      <Icons :type="fileType" :style="{ marginRight: '2px' }" />
      <span :style="{ flex: 1, paddingRight: '5px', fontStyle: !file.status ? 'italic' : 'normal' }">{{ name }}</span>
      <span
        data-name="editing"
        class="monaco-tree-editor-opened-tab-item-editing"
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
        class="monaco-tree-editor-opened-tab-item-close"
      >
        <Close />
      </span>
    </div>
  </ContextMenu>
</template>
