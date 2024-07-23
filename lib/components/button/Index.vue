<script setup lang="ts">
import './index.scss'

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
})
defineEmits({
  click: (_e: MouseEvent) => true,
})
</script>

<template>
  <div @click="(e) => $emit('click', e)" :class="`monaco-tree-editor-button monaco-tree-editor-button-${props.type}`">
    <slot></slot>
  </div>
</template>
