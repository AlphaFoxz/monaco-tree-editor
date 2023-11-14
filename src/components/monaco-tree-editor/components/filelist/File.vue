<script setup lang="ts">
import ContextMenu from '../context-menu/Index.vue'
import IconEdit from '../icons/Edit'
import IconDelete from '../icons/Delete'
import IconArrow from '../icons/Arrow'
import IconAddfile from '../icons/Addfile'
import IconAddfolder from '../icons/Addfolder'
import Icons from '../icons/index'
import FileTemp from './File.vue'
import { type Files } from '../../define'
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
  newFile: (_path: string, _resolve?: () => void, _reject?: () => void) => true,
  confirmNewFile: (_path: string) => true,
  deleteFile: (_path: string) => true,
  renameFile: (_path: string, _name: string) => true,
  newFolder: (_path: string, _resolve?: () => void, _reject?: () => void) => true,
  confirmNewFolder: (_path: string) => true,
  deleteFolder: (_path: string) => true,
  renameFolder: (_path: string, _name: string) => true,
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

// ================ 右键菜单 contextmenu ================
type _FileOperation = 'openFile' | 'copyPath' | 'copyRelativePath' | 'renameFile' | 'deleteFile'
type _FolderOperation = 'newFile' | 'newFolder' | 'copyPath' | 'copyRelativePath' | 'renameFolder' | 'deleteFolder'
const fileContextMenu = ref<ContextMenuItem<_FileOperation | _FolderOperation>[]>([
  { label: 'Open File', value: 'openFile' },
  {},
  { label: 'Copy Path', value: 'copyPath' },
  {},
  { label: 'Rename File', value: 'renameFile' },
  { label: 'Delete File', value: 'deleteFile' },
])
const folderContextMenu = ref<ContextMenuItem<_FileOperation | _FolderOperation>[]>([
  { label: 'New File', value: 'newFile' },
  { label: 'New Folder', value: 'newFolder' },
  {},
  { label: 'Copy Path', value: 'copyPath' },
  { label: 'Copy Relative Path', value: 'copyRelativePath' },
  {},
  { label: 'Rename Folder', value: 'renameFolder' },
  { label: 'Delete Folder', value: 'deleteFolder' },
])
const handleSelectContextMenu = (item: ContextMenuItem<_FileOperation | _FolderOperation>) => {
  switch (item.value) {
    case 'openFile':
      handlePathChange()
      return
    case 'renameFile':
      editing.value = true
      return
    case 'deleteFile':
      handleDeleteFile()
      return
    case 'newFile':
      handleConfirmNewFile()
      return
    case 'newFolder':
      handleConfirmNewFolder()
      return
    case 'renameFolder':
      editing.value = true
      return
    case 'copyPath':
      let path = monacoStore.prefix + props.file.path
      if (monacoStore.fileSeparator === '\\') {
        path = path.replaceAll('/', '\\')
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(path)
      } else {
        // TODO
      }
      return
    case 'copyRelativePath':
      if (navigator.clipboard) {
        navigator.clipboard.writeText(props.file.path)
      } else {
        // TODO
      }
      return
    case 'deleteFolder':
      handleDeleteFolder()
      return
    default:
      const n: undefined = item.value
      console.debug(n)
  }
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
    handleBlur(e)
  }
}
const handleClick = () => {
  showChild.value = !showChild.value
}
const handleBlur = (_e: Event) => {
  const name = nameRef.value?.textContent
  if (!name || /^\s*$/.test(name)) {
    //remove component
    monacoStore.removeBlank(props.file.path)
    return
  }
  if (editing.value) {
    editing.value = false
    if (props.file.name !== name) {
      if (props.file.isDirectory) {
        emit('renameFolder', props.file.path, name!)
      } else {
        emit('renameFile', props.file.path, name!)
      }
    }
  } else {
    if (props.file.isDirectory) {
      emit(
        'newFolder',
        props.file.path + name,
        () => {},
        () => {
          monacoStore.removeBlank(props.file.path)
        }
      )
    } else {
      emit(
        'newFile',
        props.file.path + name,
        () => {},
        () => {
          monacoStore.removeBlank(props.file.path)
        }
      )
    }
  }
}
const handlePathChange = (_e?: MouseEvent) => {
  const key = props.file.path
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
  <ContextMenu v-if="file.isFile" :menu="fileContextMenu" @select="handleSelectContextMenu">
    <div
      :title="file.name"
      :data-src="file.path"
      @click="handlePathChange"
      :key="file.path"
      :class="`music-monaco-editor-list-file-item-row ${
        currentPath === file.path ? 'music-monaco-editor-list-file-item-row-focused' : ''
      }`"
    >
      <Icons :type="fileType" />
      <template v-if="file.name && !editing">
        <span :style="{ flex: 1 }">{{ file.name }}</span>
        <IconEdit @click.stop="handleRenameStart" class="music-monaco-editor-list-split-icon" />
        <IconDelete @click="handleDeleteFile" class="music-monaco-editor-list-split-icon" />
      </template>
      <div
        v-else
        :spell-check="false"
        @keydown="handleKeyDown"
        @blur="handleBlur"
        ref="nameRef"
        class="music-monaco-editor-list-file-item-new"
        contenteditable
      ></div>
    </div>
  </ContextMenu>
  <div v-else class="music-monaco-editor-list-file-item">
    <ContextMenu v-if="file.isDirectory && !root" :menu="folderContextMenu" @select="handleSelectContextMenu">
      <div :title="file.name" @click="handleClick" class="music-monaco-editor-list-file-item-row">
        <IconArrow :collpase="!showChild" />
        <template v-if="file.name && !editing">
          <span :style="{ flex: 1 }">{{ file.name }}</span>
          <IconEdit v-if="!file.readonly" @click.stop="handleRenameStart" class="music-monaco-editor-list-split-icon" />
          <IconDelete
            v-if="!file.readonly"
            @click.stop="emit('deleteFolder', file.path)"
            class="music-monaco-editor-list-split-icon"
          />
          <IconAddfile @click.stop="handleConfirmNewFile" class="music-monaco-editor-list-split-icon" />
          <IconAddfolder @click.stop="handleConfirmNewFolder" class="music-monaco-editor-list-split-icon" />
        </template>
        <div
          v-else
          @click="
            (e: MouseEvent) => {
              e.stopPropagation()
            }
          "
          :spell-check="false"
          @keydown="handleKeyDown"
          @blur="handleBlur"
          ref="nameRef"
          class="music-monaco-editor-list-file-item-new"
          contenteditable
        ></div>
      </div>
    </ContextMenu>
    <div
      v-if="showChild || root"
      :style="{ paddingLeft: file.isDirectory ? '7px' : '0' }"
      v-for="(item, _index) in keys"
    >
      <FileTemp
        @rename-file="(path, name) => emit('renameFile', path, name)"
        @rename-folder="(path, name) => emit('renameFolder', path, name)"
        @delete-file="(path) => emit('deleteFile', path)"
        @delete-folder="(path) => emit('deleteFolder', path)"
        @new-file="(path) => emit('newFile', path)"
        @new-folder="(path) => emit('newFolder', path)"
        @confirm-new-file="(path) => emit('confirmNewFile', path)"
        @confirm-new-folder="(path) => emit('confirmNewFolder', path)"
        :currentPath="currentPath"
        :root="false"
        :file="file.children[item]"
        :key="item"
      />
    </div>
  </div>
</template>
