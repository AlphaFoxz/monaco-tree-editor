<script setup lang="ts">
import './index.scss'
import { useI18n } from '../locale'

const { $t } = useI18n()
</script>

<template>
  <div class="monaco-tree-editor-pages">
    <div class="monaco-tree-editor-pages-title">{{ $t('settings.language').value }}</div>
    <div class="monaco-tree-editor-pages-item"></div>
  </div>
</template>
