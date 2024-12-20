<script setup lang="ts">
import './index.scss'
import { type Language, useI18n } from '#domain/i18n-agg'
import { useMessage } from '#domain/message-agg'
import { useGlobalSettings } from '#domain/global-settings-agg'
import { type ThemeMode } from '#domain/define'

const props = defineProps({
  customMenu: {
    type: Array<any>,
    default: () => [],
  },
})

const { currentLanguage } = useI18n().states
const { setLanguage, $t } = useI18n().commands
const messageAgg = useMessage()
const globalSettingsStore = useGlobalSettings()

function handleSelectLanguage(e: Event) {
  const target = e.target as HTMLSelectElement
  setLanguage(target.value as Language)
  let inner = ''
  for (const item of target) {
    if (item.selected) {
      inner = item.innerText
      break
    }
  }
  messageAgg.commands.success({
    content: $t('msg.languageChanged{lang}', { lang: inner }).value,
    closeable: true,
    timeoutMs: 3000,
  })
}

function handleSelectColorTheme(e: Event) {
  globalSettingsStore.commands.setThemeMode((e.target as HTMLSelectElement).value as ThemeMode)
}
</script>

<template>
  <div class="monaco-tree-editor-pages">
    <div class="monaco-tree-editor-pages-title">{{ $t('settings.language').value }}</div>
    <div class="monaco-tree-editor-pages-item">
      <select class="monaco-tree-editor-pages-item-select" :value="currentLanguage" @change="handleSelectLanguage">
        <option value="en-US">English</option>
        <option value="zh-CN">简体中文</option>
      </select>
    </div>

    <div class="monaco-tree-editor-pages-title">{{ $t('settings.colorTheme').value }}</div>
    <div class="monaco-tree-editor-pages-item">
      <select
        class="monaco-tree-editor-pages-item-select"
        :value="globalSettingsStore.states.themeMode.value"
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
