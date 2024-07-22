<script setup lang="ts">
import { useI18n, getCurrentLanguage } from '../locale'
import { changeLanguage } from '../locale'
import { useMessage } from '../message-store'

const messageStore = useMessage()
const { t, $t } = useI18n()
const language = getCurrentLanguage()
</script>

<template>
  <div class="monaco-tree-editor-setting">
    <div class="monaco-tree-editor-setting-content">
      <div v-if="!language" class="monaco-tree-editor-input-row">
        <div class="monaco-tree-editor-input-name">
          {{ $t('settings.language').value + '' }}
        </div>
        <div
          class="monaco-tree-editor-select-item"
          style="cursor: pointer"
          @click="
            () => {
              changeLanguage('en-US')
              messageStore.success({ content: 'Switch to English', timeoutMs: 2000 })
            }
          "
        >
          English
        </div>
        <div
          class="monaco-tree-editor-select-item"
          style="cursor: pointer"
          @click="
            () => {
              changeLanguage('zh-CN')
              messageStore.success({ content: '切换为简体中文', timeoutMs: 2000 })
            }
          "
        >
          简体中文
        </div>
      </div>
      <div class="monaco-tree-editor-input-row" v-for="(item, i) in [] as Array<any>" :key="i">
        <div class="monaco-tree-editor-input-name"></div>
        <div class="monaco-tree-editor-select-item" style="cursor: pointer" @click="item.handler">
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>
