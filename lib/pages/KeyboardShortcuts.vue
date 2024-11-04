<script setup lang="ts">
import './index.scss'
import { useI18n } from '../domain/i18n-agg'

const { $t } = useI18n().actions
</script>

<template>
  <div class="monaco-tree-editor-pages">
    <div class="monaco-tree-editor-pages-title">{{ $t('settings.language').value }}</div>
    <div class="monaco-tree-editor-pages-item"></div>
  </div>
</template>
