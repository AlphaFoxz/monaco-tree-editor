<script setup lang="ts">
import ContextMenu from '../components/context-menu/Index.vue'
import IconEdit from '../icons/Edit.vue'
import IconDelete from '../icons/Delete.vue'
import IconArrow from '../icons/Arrow.vue'
import IconAddfile from '../icons/Addfile.vue'
import IconAddfolder from '../icons/Addfolder.vue'
import Icons from '../icons/Index.vue'
import FileTemp from './File.vue'
import { type Files } from '../define'
import { computed, nextTick, onMounted, ref, watch, type ComputedRef } from 'vue'
import { useMonaco } from '../stores/monaco-store'
import { type ContextMenuItem } from '../components/context-menu/define'
import { useI18n } from '../locale'

const props = defineProps({
  collapseTrigger: {
    type: Number,
  },
  file: {
    type: Object,
    required: true,
  },
  root: Boolean,
  currentPath: {
    type: String,
    default: '',
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
  confirmNewFile: (_path: string) => true,
  confirmNewFolder: (_path: string) => true,
  newFile: (_path: string, _resolve: () => void, _reject: () => void) => true,
  newFolder: (_path: string, _resolve: () => void, _reject: () => void) => true,
  deleteFile: (_path: string) => true,
  deleteFolder: (_path: string) => true,
  renameFile: (_path: string, _name: string) => true,
  renameFolder: (_path: string, _name: string) => true,
  contextmenuSelect: (_path: string, _item: { label: string | ComputedRef<string>; value: any }) => true,
})

// =================== 初始化 handle init ===================
const monacoStore = useMonaco()
const editing = ref(false)
const showChild = ref(false)
const nameRef = ref<HTMLElement>()
const fileType = computed(() => {
  if (props.file.isFile && props.file.name && props.file.name.indexOf('.') !== -1) {
    return `file_type_${props.file.name.split('.').slice(-1)}`
  } else {
    return 'default_file'
  }
})
const keys = computed<string[]>(() => {
  if (props.file.isFile) {
    return []
  }
  const childs: Files = props.file.children
  const folders = Object.keys(childs)
    .filter((key) => !childs[key].isFile)
    .sort()
  const files = Object.keys(childs)
    .filter((key) => childs[key].isFile)
    .sort()
  return folders.concat(files)
})
onMounted(() => {
  if (!props.root && !props.file.name) {
    nameRef.value?.focus()
  }
})
watch([() => props.file, () => props.root], (v) => {
  if (!v[1] && !v[0].name) {
    nextTick(() => {
      nameRef.value?.focus()
    })
  }
})

// ================ 右键菜单 contextmenu ================
const { $t } = useI18n()
type _FileOperation = '@openFile' | '@copyPath' | '@copyRelativePath' | '@renameFile' | '@deleteFile' | string
type _FolderOperation =
  | '@newFile'
  | '@newFolder'
  | '@copyPath'
  | '@copyRelativePath'
  | '@renameFolder'
  | '@deleteFolder'
  | string
const initFileContextMenu = [
  { label: $t('ctxmenu.openFile'), value: '@openFile' },
  {},
  { label: $t('ctxmenu.copyPath'), value: '@copyPath' },
  { label: $t('ctxmenu.copyRelativePath'), value: '@copyRelativePath' },
  {},
  { label: $t('ctxmenu.renameFile'), value: '@renameFile' },
  { label: $t('ctxmenu.deleteFile'), value: '@deleteFile' },
]
const fileContextMenu = (() => {
  const arr = initFileContextMenu
  if (props.fileMenu.length > 0) {
    for (let i = props.fileMenu.length - 1; i >= 0; i--) {
      const v = props.fileMenu[i]
      arr.splice(1, 0, v!)
    }
    arr.splice(1, 0, {})
  }
  return arr
})()
const initFolderContextMenu = [
  { label: $t('ctxmenu.newFile'), value: '@newFile' },
  { label: $t('ctxmenu.newFolder'), value: '@newFolder' },
  {},
  { label: $t('ctxmenu.copyPath'), value: '@copyPath' },
  { label: $t('ctxmenu.copyRelativePath'), value: '@copyRelativePath' },
  {},
  { label: $t('ctxmenu.renameFolder'), value: '@renameFolder' },
  { label: $t('ctxmenu.deleteFolder'), value: '@deleteFolder' },
]
const folderContextMenu = (() => {
  const arr = initFolderContextMenu
  if (props.folderMenu.length > 0) {
    for (let i = props.folderMenu.length - 1; i >= 0; i--) {
      const v = props.folderMenu[i]
      arr.splice(2, 0, v!)
    }
    arr.splice(2, 0, {})
  }
  return arr
})()
const handleSelectContextMenu = (item: ContextMenuItem<_FileOperation | _FolderOperation>) => {
  switch (item.value) {
    case '@openFile':
      handlePathChange()
      break
    case '@renameFile':
      editing.value = true
      break
    case '@deleteFile':
      handleDeleteFile()
      break
    case '@newFile':
      handleConfirmNewFile()
      break
    case '@newFolder':
      handleConfirmNewFolder()
      break
    case '@renameFolder':
      editing.value = true
      break
    case '@copyPath':
      let path = monacoStore._state.prefix.value + props.file.path
      if (monacoStore._state.fileSeparator.value === '\\') {
        path = path.replace(/\//g, '\\')
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(path)
      } else {
        // TODO
      }
      break
    case '@copyRelativePath':
      if (navigator.clipboard) {
        navigator.clipboard.writeText(props.file.path)
      } else {
        // TODO
      }
      break
    case '@deleteFolder':
      handleDeleteFolder()
      break
  }
  if (item.value && item.label) {
    emit('contextmenuSelect', props.file.path, { label: item.label, value: item.value })
  }
}

// ================ 拖拽 drag ================
const handleDragStart = (e: DragEvent) => {
  e.dataTransfer?.setData('component', 'filelist')
  e.dataTransfer?.setData('path', props.file.path)
  e.dataTransfer?.setData('type', props.file.isFile ? 'file' : 'folder')
}

// ================ 回调方法 callback ================
const handleConfirmNewFile = (_e?: Event) => {
  showChild.value = true
  emit('confirmNewFile', props.file.path + '/')
}
const handleConfirmNewFolder = (_e?: Event) => {
  showChild.value = true
  emit('confirmNewFolder', props.file.path + '/')
}
const handleRenameStart = (_e: Event) => {
  editing.value = true
}
const handleDeleteFile = (e?: Event) => {
  e?.stopPropagation()
  emit('deleteFile', props.file.path)
}
const handleDeleteFolder = (e?: Event) => {
  e?.stopPropagation()
  emit('deleteFolder', props.file.path)
}
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.keyCode === 13) {
    e.preventDefault()
    handleBlur()
  }
}
const handleClick = () => {
  showChild.value = !showChild.value
}
const handleBlur = (_e?: Event) => {
  if (!nameRef.value) {
    return
  }
  let name = nameRef.value?.textContent
  if (!name || /^\s*$/.test(name)) {
    //remove component
    monacoStore._action.removeBlank(props.file.path)
    return
  }
  name = name.trim()
  if (editing.value) {
    editing.value = false
    if (props.file.name !== name) {
      if (props.file.isFolder) {
        emit('renameFolder', props.file.path, name!)
      } else {
        emit('renameFile', props.file.path, name!)
      }
    }
  } else {
    if (props.file.isFolder) {
      emit(
        'newFolder',
        props.file.path + name,
        () => {},
        () => {
          monacoStore._action.removeBlank(props.file.path)
        }
      )
    } else {
      emit(
        'newFile',
        props.file.path + name,
        () => {},
        () => {
          monacoStore._action.removeBlank(props.file.path)
        }
      )
    }
  }
}
const handlePathChange = (_e?: MouseEvent) => {
  if (editing.value || !monacoStore.action.isReady.value) {
    return
  }
  const key = props.file.path
  const model = monacoStore._action.restoreModel(key)
  if (model) {
    monacoStore._action.openOrFocusPath(key)
  }
}
watch([editing, () => props.file], (v) => {
  if (v[0]) {
    nextTick(() => {
      const dotIndex = v[1].name.indexOf('.')
      nameRef.value!.textContent = v[1].name
      nameRef.value?.focus()
      const selection = window.getSelection()
      const range = document.createRange()
      range.setStart(nameRef.value?.firstChild!, 0)
      range.setEnd(nameRef.value?.firstChild!, dotIndex > 0 ? dotIndex : v[1].name.lenth)
      selection?.removeAllRanges()
      selection?.addRange(range)
    })
  }
})
watch(
  () => props.collapseTrigger,
  () => {
    showChild.value = false
  }
)
watch([() => props.currentPath, () => props.file], (v) => {
  if (v[0] && v[0].startsWith(v[1].path + '/')) {
    showChild.value = true
  }
})
</script>
<template>
  <ContextMenu v-if="file.isFile" :menu="fileContextMenu" @select="handleSelectContextMenu">
    <div
      :title="file.name"
      :data-src="file.path"
      @click="handlePathChange"
      :key="file.path"
      :class="`file monaco-tree-editor-list-file-item-row ${
        currentPath === file.path ? 'monaco-tree-editor-list-file-item-row-focused' : ''
      }`"
    >
      <Icons :type="fileType" />
      <template v-if="file.name && !editing">
        <span draggable="true" :data-path="file.path" @dragstart="handleDragStart" :style="{ flex: 1 }">{{
          file.name
        }}</span>
        <IconEdit
          :title="$t('button.rename').value"
          @click.stop="handleRenameStart"
          class="monaco-tree-editor-list-split-icon"
        />
        <IconDelete
          :title="$t('button.delete').value"
          @click="handleDeleteFile"
          class="monaco-tree-editor-list-split-icon"
        />
      </template>
      <div
        v-else
        :spell-check="false"
        @keydown="handleKeyDown"
        @blur="handleBlur"
        ref="nameRef"
        class="monaco-tree-editor-list-file-item-new"
        contenteditable
      ></div>
    </div>
  </ContextMenu>
  <div v-else class="monaco-tree-editor-list-file-item">
    <ContextMenu v-if="file.isFolder && !root" :menu="folderContextMenu" @select="handleSelectContextMenu">
      <div :title="file.name" @click="handleClick" class="monaco-tree-editor-list-file-item-row">
        <IconArrow :collapse="!showChild" />
        <template v-if="file.name && !editing">
          <span draggable="true" :data-path="file.path" @dragstart="handleDragStart" :style="{ flex: 1 }">{{
            file.name
          }}</span>
          <IconEdit
            :title="$t('button.rename').value"
            v-if="!file.readonly"
            @click.stop="handleRenameStart"
            class="monaco-tree-editor-list-split-icon"
          />
          <IconDelete
            :title="$t('button.delete').value"
            v-if="!file.readonly"
            @click.stop="emit('deleteFolder', file.path)"
            class="monaco-tree-editor-list-split-icon"
          />
          <IconAddfile
            :title="$t('button.newFile').value"
            @click.stop="handleConfirmNewFile"
            class="monaco-tree-editor-list-split-icon"
          />
          <IconAddfolder
            :title="$t('button.newFolder').value"
            @click.stop="handleConfirmNewFolder"
            class="monaco-tree-editor-list-split-icon"
          />
        </template>
        <div
          v-else
          @click.stop
          :spell-check="false"
          @keydown="handleKeyDown"
          @blur="handleBlur"
          ref="nameRef"
          class="monaco-tree-editor-list-file-item-new"
          contenteditable
        ></div>
      </div>
    </ContextMenu>
    <div
      v-show="showChild || root"
      :style="{ paddingLeft: file.isFolder ? '7px' : '0' }"
      :class="file.children[item].isFolder ? 'folder' : 'file'"
      v-for="(item, _index) in keys"
    >
      <FileTemp
        @rename-file="(path, name) => emit('renameFile', path, name)"
        @rename-folder="(path, name) => emit('renameFolder', path, name)"
        @delete-file="(path) => emit('deleteFile', path)"
        @delete-folder="(path) => emit('deleteFolder', path)"
        @new-file="(path, resolve, reject) => emit('newFile', path, resolve, reject)"
        @new-folder="(path, resolve, reject) => emit('newFolder', path, resolve, reject)"
        @confirm-new-file="(path) => emit('confirmNewFile', path)"
        @confirm-new-folder="(path) => emit('confirmNewFolder', path)"
        :file-menu="fileMenu"
        :folder-menu="folderMenu"
        @contextmenu-select="(path, item) => emit('contextmenuSelect', path, item)"
        :currentPath="currentPath"
        :root="false"
        :file="file.children[item]"
        :collapse-trigger="collapseTrigger"
        :key="item"
      />
    </div>
  </div>
</template>
