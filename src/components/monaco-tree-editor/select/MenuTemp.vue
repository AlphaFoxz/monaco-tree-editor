<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  value: String || Number,
  defaultValue: {
    type: String || Number,
    default: '',
  },
  handleSelect: {
    type: Function,
    default: () => (_selected: any) => {},
  },
})
const selected = ref(props.value === props.defaultValue)
watch([() => props.value, () => props.defaultValue], (v) => {
  if (v[1] === v[0]) {
    selected.value = true
  }
})
</script>

<template>
  <div
    @click="
      (_e) => {
        handleSelect({ value, label })
      }
    "
    :class="`music-monaco-editor-select-item ${selected ? 'music-monaco-editor-select-item-selected' : ''}`"
  >
    {{ label }}
  </div>
</template>
