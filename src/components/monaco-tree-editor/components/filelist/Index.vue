<script setup lang="ts">
import './index.less'
import IconAddfolder from '../icons/Addfolder'
import IconAddfile from '../icons/Addfile'
import { ReloadOutlined } from '@ant-design/icons-vue'
import IconArrow from '../icons/Arrow'
import FileTemp from './File.vue'
import Confirm from '../modal/Confirm.vue'
import ContextMenu from '../context-menu/Index.vue'
import { ref, watch } from 'vue'
import { useMonaco } from '../../monaco-store'

defineProps({
  title: {
    type: String,
    default: 'EXPLORER',
  },
  projectName: {
    type: String,
    default: 'project',
  },
  currentPath: {
    type: String,
    default: '/',
  },
  rootEl: {
    type: HTMLElement,
    default: null,
  },
})
const emit = defineEmits({
  newFile: (_path: string, _resolve?: () => void, _reject?: () => void) => true,
  deleteFile: (_path: string) => true,
  renameFile: (_path: string, _name: string) => true,
  newFolder: (_path: string, _resolve?: () => void, _reject?: () => void) => true,
  deleteFolder: (_path: string) => true,
  renameFolder: (_path: string, _name: string) => true,
  reload: () => true,
})

//=================== 初始化 init ==================
const collpase = ref(false)
const monaocStore = useMonaco()
const fileTree = ref(monaocStore.fileTree)

watch(
  () => monaocStore.fileTree,
  (n) => {
    fileTree.value = n
  }
)

//=================== 回调 callback ==================
const fileConfirmVisible = ref(false)
const folderConfirmVisible = ref(false)
const confirmPath = ref('')
const handleCollapse = () => {
  collpase.value = !collpase.value
}
const handleConfirmNewFile = (path: string) => {
  monaocStore.newFile(path)
}
const handleConfirmNewFolder = (path: string) => {
  monaocStore.newFolder(path)
}
const handleNewFile = (path: string) => {
  emit('newFile', path)
}
const handleNewFolder = (path: string) => {
  emit('newFolder', path)
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
  <div class="music-monaco-editor-list-wrapper">
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
      <template #title?>Are you sure you want to delete this folder?</template>
      <template #okText>DELETE</template>
      <template #content>
        <div>
          <div>Operation is unable to undo, please ensure there are backups/version control on your server</div>
          <div>
            Current path: <b>{{ confirmPath }}</b>
          </div>
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
      <template #title?>Are you sure you want to delete this folder?</template>
      <template #okText>DELETE</template>
      <template #content>
        <div>
          <div>Operation is unable to undo, please ensure there are backups/version control on your server</div>
          <div>
            Current path: <b>{{ confirmPath }}</b>
          </div>
        </div>
      </template>
    </Confirm>
    <ContextMenu :menu="[]">
      <div class="music-monaco-editor-list-title">{{ title }}</div>
      <div class="music-monaco-editor-list-split" @click="handleCollapse">
        <IconArrow :collpase="collpase" />
        <span :style="{ flex: 1 }">{{ projectName }}</span>
        <IconAddfile
          title="New file"
          @click.stop="() => handleConfirmNewFile('/')"
          class="music-monaco-editor-list-split-icon"
        />
        <IconAddfolder
          title="New Folder"
          @click.stop="() => handleConfirmNewFolder('/')"
          class="music-monaco-editor-list-split-icon"
        />
        <ReloadOutlined title="Refresh" @click.stop="$emit('reload')" class="music-monaco-editor-list-split-icon" />
      </div>
    </ContextMenu>
    <div v-show="!collpase" class="music-monaco-editor-list-files">
      <FileTemp
        @new-file="handleNewFile"
        @confirm-new-file="handleConfirmNewFile"
        @new-folder="handleNewFolder"
        @confirm-new-folder="handleConfirmNewFolder"
        @delete-file="handleDeleteFile"
        @delete-folder="handleDeleteFolder"
        @rename-file="handleRenameFile"
        @rename-folder="handleRenameFolder"
        :currentPath="currentPath"
        root
        :file="fileTree"
      />
    </div>
  </div>
</template>
