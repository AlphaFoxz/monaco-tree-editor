<script setup lang="ts">
import './index.scss'
import IconAddfolder from '../icons/Addfolder.vue'
import IconAddfile from '../icons/Addfile.vue'
import ReloadOutlined from '../icons/ReloadOutlined.vue'
import MinusSquareOutlined from '../icons/MinusSquareOutlined.vue'
import IconArrow from '../icons/Arrow.vue'
import FileTemp from './File.vue'
import Confirm from '../components/modal/Confirm.vue'
import ContextMenu from '../components/context-menu/Index.vue'
import { ref, type ComputedRef } from 'vue'
import { useMonaco } from '../domain/monaco-agg'
import { useI18n } from '../domain/i18n-agg'

const props = defineProps({
  monacoId: {
    type: String,
    required: true,
  },
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
const { $t } = useI18n().actions

//=================== 初始化 init ==================
const collapse = ref(false)
const monacoStore = useMonaco(props.monacoId)
const fileTree = monacoStore.states._fileTree
const currentPath = monacoStore.states.currentPath

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
  monacoStore.actions._newFile(path)
}
const handleConfirmNewFolder = (path: string) => {
  monacoStore.actions._newFolder(path)
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

defineExpose({
  handleDeleteFile,
})
</script>
<template>
  <div class="monaco-tree-editor-list-wrapper" :style="{ fontSize: `${fontSize}px` }">
    <Confirm
      v-if="fileConfirmVisible"
      :monaco-id="monacoId"
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
      <template #title>{{ $t('confirm.deleteFileTitle').value }}</template>
      <template #okText>{{ $t('confirm.delete').value }}</template>
      <template #cancelText>{{ $t('confirm.cancel').value }}</template>
      <template #content>
        <div>
          {{ $t('confirm.deleteFileContent', { path: confirmPath }).value }}
        </div>
      </template>
    </Confirm>
    <Confirm
      v-if="folderConfirmVisible"
      :monaco-id="monacoId"
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
      <template #title>{{ $t('confirm.deleteFolderTitle').value }}</template>
      <template #okText>{{ $t('confirm.delete').value }}</template>
      <template #cancelText>{{ $t('confirm.cancel').value }}</template>
      <template #content>
        <div>
          {{ $t('confirm.deleteFolderContent', { path: confirmPath }).value }}
        </div>
      </template>
    </Confirm>
    <ContextMenu :menu="[]">
      <div class="monaco-tree-editor-list-title">{{ title }}</div>
      <div class="monaco-tree-editor-list-split" @click="handleCollapse">
        <IconArrow :collapse="collapse" />
        <span :style="{ flex: 1 }">{{ projectName }}</span>
        <IconAddfile
          :title="$t('button.newFile').value"
          @click.stop="() => handleConfirmNewFile('/')"
          class="monaco-tree-editor-list-split-icon"
        />
        <IconAddfolder
          :title="$t('button.newFolder').value"
          @click.stop="() => handleConfirmNewFolder('/')"
          class="monaco-tree-editor-list-split-icon"
        />
        <ReloadOutlined
          :title="$t('button.refreshExplorer').value"
          @click.stop="$emit('reload')"
          class="monaco-tree-editor-list-split-icon"
        />
        <MinusSquareOutlined
          :title="$t('button.collapseAll').value"
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
