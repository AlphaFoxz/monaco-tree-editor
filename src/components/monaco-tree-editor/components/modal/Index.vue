<script setup lang="ts">
import { ref, watch } from 'vue'
import './index.less'
const props = defineProps({
  destroyOnClose: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  target: HTMLElement,
})
const emit = defineEmits({ close: () => true })
const elRef = ref<HTMLDivElement>(document.createElement('div'))
watch(
  () => props.visible,
  (v) => {
    const rootEl = props.target || document.body
    if (v) {
      rootEl && rootEl.appendChild(elRef.value)
    } else {
      rootEl && rootEl.contains(elRef.value) && rootEl.appendChild(elRef.value)
    }
  }
)
</script>

<template>
  <div class="music-monaco-editor-modal">
    <div class="music-monaco-editor-modal-mask" @click="emit('close')" />
    <div class="music-monaco-editor-modal-content" v-show="destroyOnClose && visible">
      <slot></slot>
    </div>
  </div>
</template>
