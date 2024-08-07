<script setup lang="ts">
import './index.scss'
import IconAddfolder from '../icons/Addfolder'
import IconAddfile from '../icons/Addfile'
import { ReloadOutlined, MinusSquareOutlined } from '@ant-design/icons-vue'
import IconArrow from '../icons/Arrow'
import FileTemp from './File.vue'
import Confirm from '../modal/Confirm.vue'
import ContextMenu from '../context-menu/Index.vue'
import { ref, watch, type ComputedRef } from 'vue'
import { useMonaco } from '../monaco-store'
import { useI18n } from '../locale'

defineProps({
  title: {
    type: String,
    default: 'EXPLORER',
  },
  projectName: {
    type: String,
    default: 'project',
  },
  rootEl: {
    type: HTMLElement,
    default: null,
  },
  fileMenu: {
    type: Array,
  },
  folderMenu: {
    type: Array,
  },
  fontSize: {
    type: Number,
    default: 14,
  },
})
const emit = defineEmits({
  reload: () => true,
  newFile: (_path: string, _resolve: () => void, _reject: () => void) => true,
  newFolder: (_path: string, _resolve: () => void, _reject: () => void) => true,
  deleteFile: (_path: string) => true,
  deleteFolder: (_path: string) => true,
  renameFile: (_path: string, _name: string) => true,
  renameFolder: (_path: string, _name: string) => true,
  contextmenuSelect: (_path: string, _item: { label: string | ComputedRef<string>; value: any }) => true,
})

//=================== 国际化 i18n ==================
const { r } = useI18n()

//=================== 初始化 init ==================
const collapse = ref(false)
const monacoStore = useMonaco()
const fileTree = ref(monacoStore.fileTree.value)
const currentPath = ref(monacoStore.currentPath.value)
watch(monacoStore.currentPath, (n) => {
  currentPath.value = n
})
watch(monacoStore.fileTree, (n) => {
  fileTree.value = n
})

//=================== 回调 callback ==================
const fileConfirmVisible = ref(false)
const folderConfirmVisible = ref(false)
const confirmPath = ref('')
let collapseTrigger = ref(0)
const handleCollapse = () => {
  collapse.value = !collapse.value
}
const handleCollapseAll = () => {
  collapseTrigger.value = new Date().getTime()
}
const handleConfirmNewFile = (path: string) => {
  monacoStore.newFile(path)
}
const handleConfirmNewFolder = (path: string) => {
  monacoStore.newFolder(path)
}
const handleNewFile = (path: string, resolve: () => void, reject: () => void) => {
  emit('newFile', path, resolve, reject)
}
const handleNewFolder = (path: string, resolve: () => void, reject: () => void) => {
  emit('newFolder', path, resolve, reject)
}
const handleDeleteFile = (path: string) => {
  fileConfirmVisible.value = true
  confirmPath.value = path
}
const handleDeleteFolder = (path: string) => {
  folderConfirmVisible.value = true
  confirmPath.value = path
}
const handleRenameFile = (path: string, name: string) => {
  emit('renameFile', path, name)
}
const handleRenameFolder = (path: string, name: string) => {
  emit('renameFolder', path, name)
}
</script>
<template>
  <div class="monaco-tree-editor-list-wrapper" :style="{ fontSize: `${fontSize}px` }">
    <Confirm
      v-if="fileConfirmVisible"
      type="warn"
      @ok="
        () => {
          fileConfirmVisible = false
          $emit('deleteFile', confirmPath)
        }
      "
      @cancel="fileConfirmVisible = false"
      @close="fileConfirmVisible = false"
    >
      <template #title>{{ r('confirm.deleteFileTitle').value }}</template>
      <template #okText>{{ r('confirm.delete').value }}</template>
      <template #cancelText>{{ r('confirm.cancel').value }}</template>
      <template #content>
        <div>
          {{ r('confirm.deleteFileContent', { path: confirmPath }).value }}
        </div>
      </template>
    </Confirm>
    <Confirm
      v-if="folderConfirmVisible"
      type="warn"
      @ok="
        () => {
          folderConfirmVisible = false
          $emit('deleteFolder', confirmPath)
        }
      "
      @cancel="folderConfirmVisible = false"
      @close="folderConfirmVisible = false"
    >
      <template #title>{{ r('confirm.deleteFolderTitle').value }}</template>
      <template #okText>{{ r('confirm.delete').value }}</template>
      <template #cancelText>{{ r('confirm.cancel').value }}</template>
      <template #content>
        <div>
          {{ r('confirm.deleteFolderContent', { path: confirmPath }).value }}
        </div>
      </template>
    </Confirm>
    <ContextMenu :menu="[]">
      <div class="monaco-tree-editor-list-title">{{ title }}</div>
      <div class="monaco-tree-editor-list-split" @click="handleCollapse">
        <IconArrow :collapse="collapse" />
        <span :style="{ flex: 1 }">{{ projectName }}</span>
        <IconAddfile
          :title="r('button.newFile').value"
          @click.stop="() => handleConfirmNewFile('/')"
          class="monaco-tree-editor-list-split-icon"
        />
        <IconAddfolder
          :title="r('button.newFolder').value"
          @click.stop="() => handleConfirmNewFolder('/')"
          class="monaco-tree-editor-list-split-icon"
        />
        <ReloadOutlined
          :title="r('button.refreshExplorer').value"
          @click.stop="$emit('reload')"
          class="monaco-tree-editor-list-split-icon"
        />
        <MinusSquareOutlined
          :title="r('button.collapseAll').value"
          @click.stop="handleCollapseAll"
          class="monaco-tree-editor-list-split-icon"
        />
      </div>
    </ContextMenu>
    <div v-show="!collapse" class="monaco-tree-editor-list-files">
      <FileTemp
        @confirm-new-file="handleConfirmNewFile"
        @confirm-new-folder="handleConfirmNewFolder"
        @new-file="handleNewFile"
        @new-folder="handleNewFolder"
        @delete-file="handleDeleteFile"
        @delete-folder="handleDeleteFolder"
        @rename-file="handleRenameFile"
        @rename-folder="handleRenameFolder"
        :file-menu="fileMenu"
        :folder-menu="folderMenu"
        @contextmenu-select="(path, item) => emit('contextmenuSelect', path, item)"
        :currentPath="currentPath"
        root
        :file="fileTree"
        :collapse-trigger="collapseTrigger"
      />
    </div>
  </div>
</template>
