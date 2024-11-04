<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import './index.scss'
const props = defineProps({
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
const emit = defineEmits({ close: () => true })
const elRef = ref<HTMLDivElement>(document.createElement('div'))

onBeforeUnmount(
  watch(
    () => props.visible,
    (v) => {
      const rootEl = props.target
      if (v) {
        rootEl && rootEl.appendChild(elRef.value)
      } else {
        rootEl && rootEl.contains(elRef.value) && rootEl.appendChild(elRef.value)
      }
    }
  )
)

const modalRef = ref<HTMLElement>()
const keypressHandler = (e: KeyboardEvent) => {
  console.debug('esc')
  if (!e.ctrlKey && !e.altKey && e.key === 'Escape') {
    emit('close')
  }
}
onMounted(() => {
  modalRef.value!.addEventListener('keypress', keypressHandler)
})
onBeforeUnmount(() => {
  modalRef.value!.removeEventListener('keypress', keypressHandler)
})
</script>

<template>
  <Teleport :to="target" v-if="visible">
    <div class="monaco-tree-editor-modal" ref="modalRef">
      <div class="monaco-tree-editor-modal-mask" @contextmenu.prevent @click="emit('close')" />
      <div class="monaco-tree-editor-modal-content">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>
