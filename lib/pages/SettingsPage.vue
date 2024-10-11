<script setup lang="ts">
import './index.scss'
import { useI18n, changeLanguage, type Language } from '../locale'
import { useMessage } from '../stores/message-store'
import { useGlobalSettings } from '../stores/global-settings-store'
import { type ThemeMode } from '../themes/define'

const props = defineProps({
  customMenu: {
    type: Array<any>,
    default: () => [],
  },
})

const { $t, currentLanguage: language } = useI18n()
const messageStore = useMessage()
const globalSettingsStore = useGlobalSettings()

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
  messageStore.action.success({
    content: $t('msg.languageChanged{lang}', { lang: inner }).value,
    closeable: true,
    timeoutMs: 3000,
  })
}

function handleSelectColorTheme(e: Event) {
  globalSettingsStore.action.setThemeMode((e.target as HTMLSelectElement).value as ThemeMode)
}
</script>

<template>
  <div class="monaco-tree-editor-pages">
    <div class="monaco-tree-editor-pages-title">{{ $t('settings.language').value }}</div>
    <div class="monaco-tree-editor-pages-item">
      <select class="monaco-tree-editor-pages-item-select" :value="language" @change="handleSelectLanguage">
        <option value="en-US">English</option>
        <option value="zh-CN">简体中文</option>
      </select>
    </div>

    <div class="monaco-tree-editor-pages-title">{{ $t('settings.colorTheme').value }}</div>
    <div class="monaco-tree-editor-pages-item">
      <select
        class="monaco-tree-editor-pages-item-select"
        :value="globalSettingsStore.state.themeMode.value"
        @change="handleSelectColorTheme"
      >
        <option value="dark">{{ $t('settings.colorTheme.dark').value }}</option>
        <option value="light">{{ $t('settings.colorTheme.light').value }}</option>
      </select>
    </div>

    <div class="monaco-tree-editor-pages-item" v-for="(item, i) in props.customMenu" :key="i">
      <label class="monaco-tree-editor-pages-item-button" @click="item.handler">
        {{ item.label }}
      </label>
    </div>
  </div>
</template>
