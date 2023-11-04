<script setup lang="ts">
import ContextMenu from '../context-menu/Index.vue'
import IconEdit from '../icons/Edit'
import IconDelete from '../icons/Delete'
import IconArrow from '../icons/Arrow'
import Icons from '../icons/index'
import FileTemp from './File.vue'
import { type Files, type FileInfo } from '../../define'
import { computed, nextTick, ref, watch } from 'vue'
import { useMonaco } from '../../monaco-store'
import { type ContextMenuItem } from '../context-menu/define'
const props = defineProps({
  file: {
    type: Object,
    required: true,
  },
  root: Boolean,
  currentPath: {
    type: String,
    default: '',
  },
})
const emit = defineEmits({
  pathChange: (_key: string) => true,
  addFile: (_path: string) => true,
  confirmAddFile: (_file: FileInfo) => true,
  deleteFile: (_path: string) => true,
  editFileName: (_path: string, _name?: string) => true,
  confirmAddFolder: (_file: FileInfo) => true,
  addFolder: (_path: string) => true,
  deleteFolder: (_path: string) => true,
  editFolderName: (_path: string, _name?: string) => true,
})

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
// ================ 右键菜单 contextmenu start ================
type _FileOperation = 'renameFile' | 'deleteFile'
type _FolderOperation = 'addFile' | 'addFolder' | 'renameFolder' | 'deleteFolder'
type _ContextMenuItem = {
  value?: _FileOperation | _FolderOperation
} & {
  [keys in keyof ContextMenuItem]?: string
}
const fileContextMenu = ref<_ContextMenuItem[]>([
  { label: '重命名文件', value: 'renameFile' },
  {},
  { label: '删除文件', value: 'deleteFile' },
])
const folderContextMenu = ref<_ContextMenuItem[]>([
  { label: '添加文件', value: 'addFile' },
  { label: '添加文件夹', value: 'addFolder' },
  { label: '重命名文件夹', value: 'renameFolder' },
  {},
  { label: '删除文件夹', value: 'deleteFolder' },
])
const handleSelectFile = (item: ContextMenuItem) => {
  const i = item as _ContextMenuItem
  switch (i.value) {
    case 'renameFile':
      return
    case 'deleteFile':
      return
    case 'addFile':
      return
    case 'addFolder':
      return
    case 'renameFolder':
      return
    case 'deleteFolder':
      return
  }
}
// ================ 右键菜单 contextmenu end ================
const handleEditFolder = (e: Event) => {
  e.stopPropagation()
  editing.value = true
}
const handleDeleteFolder = (e: Event) => {
  e.stopPropagation()
  emit('deleteFile', props.file.path)
}
const handleClick = () => {
  showChild.value = !showChild.value
}
const handleBlur = (_e: Event) => {
  const name = nameRef.value?.textContent
  if (editing.value) {
    editing.value = false
    if (props.file.name !== name) {
      if (props.file.isDirectory) {
        emit('editFolderName', props.file.path, name!)
      } else {
        emit('editFileName', props.file.path, name!)
      }
    }
  } else {
    if (props.file.isDirectory) {
      emit('confirmAddFolder', { ...props.file, name } as FileInfo)
    } else {
      emit('confirmAddFile', { ...props.file, name } as FileInfo)
    }
  }
}
const handlePathChange = (e: MouseEvent) => {
  console.debug(monacoStore)
  const key = (e.currentTarget! as HTMLElement).dataset.src!
  const model = monacoStore.restoreModel(key)
  if (model) {
    monacoStore.openOrFocusPath(key)
  }
}
watch([() => props.file, () => props.root], (v) => {
  if (!v[1] && !v[0].name) {
    nextTick(() => {
      nameRef.value?.focus()
    })
  }
})
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
watch([() => props.currentPath, () => props.file], (v) => {
  if (v[0] && v[0].startsWith(v[1].path + '/')) {
    showChild.value = true
  }
})
</script>
<template>
  <ContextMenu v-if="file.isFile" :menu="fileContextMenu" @select="handleSelectFile">
    <div
      :data-src="file.path"
      @click="handlePathChange"
      :key="file.path"
      :class="`music-monaco-editor-list-file-item-row ${
        currentPath === file.path ? 'music-monaco-editor-list-file-item-row-focused' : ''
      }`"
    >
      <Icons :type="fileType" :style="{ marginLeft: '14px', marginRight: '5px' }" />

      <template v-if="file.name && !editing">
        <span :style="{ flex: 1 }">{{ file.name }}</span>
        <IconEdit @click="handleEditFolder" class="music-monaco-editor-list-split-icon" />
        <IconDelete @click="handleDeleteFolder" class="music-monaco-editor-list-split-icon" />
      </template>
      <div
        v-else
        :spell-check="false"
        @keydown="
          (e) => {
            if (e.keyCode === 13) {
              handleBlur(e)
            }
          }
        "
        @blur="handleBlur"
        ref="nameRef"
        class="music-monaco-editor-list-file-item-new"
        contenteditable
      ></div>
    </div>
  </ContextMenu>
  <div v-else class="music-monaco-editor-list-file-item">
    <ContextMenu v-if="file.isDirectory && !root" :menu="folderContextMenu" @select="handleSelectFile">
      <div @click="handleClick" class="music-monaco-editor-list-file-item-row">
        <IconArrow :collpase="showChild" />
        <Icons :style="{ marginRight: '5px' }" :type="showChild ? 'default_folder_opened' : 'default_folder'" />
      </div>
    </ContextMenu>
    <div v-if="showChild || root">
      <div :style="{ paddingLeft: props.file._isDirectory ? '7px' : '0' }" v-for="(item, index) in keys">
        <FileTemp
          @edit-file-name="(path) => emit('editFileName', path)"
          @edit-folder-name="(path) => emit('editFolderName', path)"
          @delete-file="(path) => emit('deleteFile', path)"
          @delete-folder="(path) => emit('deleteFolder', path)"
          @confirm-add-file="(path) => emit('confirmAddFile', path)"
          @confirm-add-folder="(path) => emit('confirmAddFolder', path)"
          @add-file="(path) => emit('addFile', path)"
          @add-folder="(path) => emit('addFolder', path)"
          :currentPath="currentPath"
          :root="false"
          :file="file.children[item]"
          @path-change="(path) => emit('pathChange', path)"
          :key="item"
        />
      </div>
    </div>
  </div>
</template>
