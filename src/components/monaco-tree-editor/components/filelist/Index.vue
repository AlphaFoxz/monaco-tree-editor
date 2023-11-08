<script setup lang="ts">
import './index.less'
import IconAddfolder from '../icons/Addfolder'
import IconAddfile from '../icons/Addfile'
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
  addFile: (_path: string) => true,
  deleteFile: (_path: string) => true,
  editFileName: (_path: string, _name: string) => true,
  addFolder: (_path: string) => true,
  deleteFolder: (_path: string) => true,
  editFolderName: (_path: string, _name: string) => true,
  pathChange: (_path: string) => true,
})
const collpase = ref(false)
const monaocStore = useMonaco()
const fileTree = ref(monaocStore.fileTree)
const projectName = ref('Files')

watch(
  () => monaocStore.fileTree,
  (n) => {
    fileTree.value = n
  }
)
const addFile = (path: string) => {
  emit('addFile', path)
}
const addFolder = (path: string) => {
  emit('addFolder', path)
}
const handleCollapse = () => {
  collpase.value = !collpase.value
}
const handleAddFile = (e: MouseEvent) => {
  e.stopPropagation()
  addFile('/')
}
const handleAddFolder = (e: MouseEvent) => {
  e.stopPropagation()
  addFolder('/')
}
//=================== 删除 delete start ==================
const fileConfirmVisible = ref(false)
const folderConfirmVisible = ref(false)
const confirmPath = ref('')
const handleDeleteFile = (path: string) => {
  fileConfirmVisible.value = true
  confirmPath.value = path
}
const handleDeleteFolder = (path: string) => {
  folderConfirmVisible.value = true
  confirmPath.value = path
}
//=================== 删除 delete end ==================
</script>
<template>
  <div class="music-monaco-editor-list-wrapper">
    <Confirm
      v-if="fileConfirmVisible"
      @ok="$emit('deleteFile', confirmPath)"
      @cancel="fileConfirmVisible = false"
      @close="fileConfirmVisible = false"
    >
      <template #title?>是否确实要删除此文件</template>
      <template #okText>删除</template>
      <template #content>
        <div>
          <div>删除后无法恢复</div>
          <div>当前路径: {{ confirmPath }}</div>
        </div>
      </template>
    </Confirm>
    <Confirm
      v-if="folderConfirmVisible"
      @ok="$emit('deleteFolder', confirmPath)"
      @cancel="folderConfirmVisible = false"
      @close="folderConfirmVisible = false"
    >
      <template #title?>是否确实要删除此文件</template>
      <template #okText>删除</template>
      <template #content>
        <div>
          <div>删除后无法恢复</div>
          <div>当前路径: {{ confirmPath }}</div>
        </div>
      </template>
    </Confirm>
    <ContextMenu :menu="[]">
      <div class="music-monaco-editor-list-title">{{ title }}</div>
      <div class="music-monaco-editor-list-split" @click="handleCollapse">
        <IconArrow :collpase="collpase" />
        <span :style="{ flex: 1 }">{{ projectName }}</span>
        <IconAddfile @click="handleAddFile" class="music-monaco-editor-list-split-icon" />
        <IconAddfolder @click="handleAddFolder" class="music-monaco-editor-list-split-icon" />
      </div>
    </ContextMenu>
    <div v-show="!collpase" class="music-monaco-editor-list-files">
      <FileTemp
        @add-file="addFile"
        @add-folder="addFolder"
        @delete-file="handleDeleteFile"
        @delete-folder="handleDeleteFolder"
        :currentPath="currentPath"
        root
        :file="fileTree"
        @path-change="(path: string) => emit('pathChange', path)"
      />
    </div>
  </div>
</template>
