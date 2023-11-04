<script setup lang="ts">
import type { ref } from 'vue'

const editorNodeRef = ref<HTMLElement>()
</script>
<template>
  <div
    ref="rootRef"
    id="music-monaco-editor-root"
    tabIndex="1"
    @mousemove="handleMove"
    @mouseup="handleMoveEnd"
    class="music-monaco-editor"
  >
    <FileList
      :rootEl="rootRef"
      @edit-file-name="editFileName"
      @delete-file="deleteFile"
      @add-file="addFile"
      @add-folder="addFolder"
      @delete-folder="deleteFolder"
      @edit-folder-name="editFolderName"
      :style="styles"
      title="web editor"
      :currentPath="currentPath"
      :defaultFiles="defaultFiles"
      @pathChange="handlePathChange"
    />
    <div @mousedown="handleMoveStart" class="music-monaco-editor-drag" />
    <div class="music-monaco-editor-area">
      <OpenedTab
        @close-other-files="closeOtherFiles"
        @save-file="saveFile"
        @abort-save="abortFileChange"
        :rootEl="rootRef"
        :currentPath="currentPath"
        :openedFiles="openedFiles"
        @close-file="onCloseFile"
        @path-change="handlePathChange"
      />
      <div id="editor" ref="editorNodeRef" :style="{ flex: 1, width: '100%', maxHeight: 'calc(100% - 35px)' }"></div>
      <div v-if="!openedFiles || openedFiles.length === 0" class="music-monaco-editor-area-empty">
        <img
          src="//p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/5759801316/fb85/e193/a256/03a81ea60cf94212bbc814f2c82b6940.png"
          class="music-monaco-editor-area-empty-icon"
        />
        <div>web editor</div>
      </div>
    </div>
    <div class="music-monaco-editor-setting-button" @click="settingVisible = true">
      <SettingIcon
        :style="{
          width: '20px',
          height: '20px',
        }"
      />
    </div>
    <Prettier @click="handleFromat" class="music-monaco-editor-prettier" />
    <Modal
      v-show="settingVisible"
      destroyOnClose
      @close="settingVisible = false"
      :visible="settingVisible"
      :target="rootRef"
    >
      <div class="music-monaco-editor-setting">
        <div class="music-monaco-editor-setting-header">
          设置
          <div @click="settingVisible = false" class="music-monaco-editor-setting-header-close">
            <Close :style="{ width: '12px', height: '12px' }" />
          </div>
        </div>
        <div class="music-monaco-editor-setting-content">
          <div class="music-monaco-editor-input-row">
            <div class="music-monaco-editor-input-name">prettier</div>
            <div class="music-monaco-editor-input-value">
              <input
                id="prettierCheck"
                :defaultChecked="autoPrettierRef"
                type="checkbox"
                @change="handleSetAutoPrettier"
              />
              <label for="prettierCheck">prettier on save</label>
            </div>
          </div>
          <div class="music-monaco-editor-input-row">
            <div class="music-monaco-editor-input-name">主题选择</div>
            <div class="music-monaco-editor-input-value">
              <!-- <Select v-for="item in THEMES" defaultValue="OneDarkPro" @change="(v) => configTheme(v.value)">
                <SelectMenu :label="item" :value="item" :key="item" />
              </Select> -->
              <div v-for="item in THEMES" defaultValue="OneDarkPro">
                <SelectMenu :label="item" :value="item" :key="item" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
