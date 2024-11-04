<script setup lang="ts">
import './index.scss'
import PrettierIcon from '../icons/Prettier.vue'
import { useMonaco } from '../domain/monaco-agg'

const props = defineProps({
  monacoId: {
    type: String,
    required: true,
  },
})

const monacoStore = useMonaco(props.monacoId)
const handleClick = () => {
  monacoStore.actions.format()
}
</script>

<template>
  <div>
    <PrettierIcon class="monaco-tree-editor-prettier-icon" @click="handleClick" />
  </div>
</template>
