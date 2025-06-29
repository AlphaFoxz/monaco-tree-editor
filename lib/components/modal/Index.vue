<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import './index.scss'
import { Hotkey, useHotkey } from '#domain/hotkey-agg'
const porps = defineProps({
  monacoId: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  target: { type: HTMLElement, default: () => document.body },
})
const emit = defineEmits({ close: () => true, 'update:visible': (_: boolean) => true })

const esc = new Hotkey({ command: 'Format', key: 'Escape', when: 'editor' })
const hotkeyAgg = useHotkey(porps.monacoId)
const handleKeypress = (e: KeyboardEvent) => {
  if (esc.isMatch(e)) {
    handleClose()
  }
}
function handleClose() {
  emit('update:visible', false)
  emit('close')
}
onMounted(() => {
  hotkeyAgg.commands.listen('root', handleKeypress)
})
onBeforeUnmount(() => {
  console.debug('unmount modal')
  hotkeyAgg.commands.unlisten('root', handleKeypress)
})
</script>

<template>
  <Teleport :to="target">
    <div v-show="visible" class="monaco-tree-editor-modal">
      <div class="monaco-tree-editor-modal-mask" @click="handleClose" />
      <div class="monaco-tree-editor-modal-content">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>
