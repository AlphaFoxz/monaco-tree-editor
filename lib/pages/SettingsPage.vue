<script setup lang="ts">
import './settings-page.scss'
import { useI18n, getCurrentLanguage, changeLanguage, type Language } from '../locale'
import { useMessage } from '../message-store'

const props = defineProps({
  customMenu: {
    type: Array<any>,
    default: () => [],
  },
})

const { $t } = useI18n()
const messageStore = useMessage()
const language = getCurrentLanguage()

function handleSelectLanguage(e: Event) {
  const target = e.target as HTMLSelectElement
  changeLanguage(target.value as Language)
  language.value = target.value as Language
  let inner = ''
  for (const item of target) {
    if (item.selected) {
      inner = item.innerText
      break
    }
  }
  messageStore.success({
    content: $t('msg.languageChanged', { lang: inner }).value,
    closeable: true,
    timeoutMs: 2500,
  })
}
</script>

<template>
  <div class="monaco-tree-editor-settings">
    <div class="monaco-tree-editor-settings-title">{{ $t('settings.language').value }}</div>
    <div class="monaco-tree-editor-settings-item">
      <select class="monaco-tree-editor-settings-item-select" :value="language" @change="handleSelectLanguage">
        <option value="en-US">English</option>
        <option value="zh-CN">简体中文</option>
      </select>
    </div>

    <div class="monaco-tree-editor-settings-item" v-for="(item, i) in props.customMenu" :key="i">
      <label class="monaco-tree-editor-settings-item-button" @click="item.handler">
        {{ item.label }}
      </label>
    </div>
  </div>
</template>
