<script setup lang="ts">
import './index.scss'
import PrettierIcon from '../icons/Prettier.vue'
import { useMonaco } from '../stores/monaco-store'

const monacoStore = useMonaco()
const handleClick = () => {
  monacoStore.action.format()
}
</script>

<template>
  <div>
    <PrettierIcon class="monaco-tree-editor-prettier-icon" @click="handleClick" />
  </div>
</template>
