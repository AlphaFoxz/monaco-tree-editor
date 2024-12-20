<script setup lang="ts">
import './index.scss'
import CloseIcon from '#icons/Close.vue'
import Button from '#components/button/Index.vue'
import { useHotkey } from '#domain/hotkey-agg'
import { onBeforeUnmount } from 'vue'
const props = defineProps({
  monacoId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: 'Confirm',
  },
  content: {
    type: null,
    default: '',
  },
  target: {
    type: null,
    default: () => document.body,
  },
  type: {
    type: String,
    default: 'info',
  },
})
const emit = defineEmits({
  close: () => true,
  cancel: () => true,
  ok: () => true,
})

const hotkeyStore = useHotkey(props.monacoId)
const keypressHandler = (e: KeyboardEvent) => {
  if (!e.ctrlKey && !e.altKey && !e.shiftKey && e.key === 'Escape') {
    emit('close')
  }
}
hotkeyStore.commands.listen('root', keypressHandler)
onBeforeUnmount(() => {
  hotkeyStore.commands.unlisten('root', keypressHandler)
})
</script>

<template>
  <Teleport :to="target">
    <div ref="componentRef" @contextmenu.prevent class="monaco-tree-editor-modal">
      <div class="monaco-tree-editor-modal-mask" @click="$emit('close')"></div>
      <div class="monaco-tree-editor-modal-content monaco-tree-editor-modal-content-confirm">
        <div v-if="title" class="monaco-tree-editor-modal-content-title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div ref="contentRef" class="monaco-tree-editor-modal-content-content">
          <slot name="content"></slot>
        </div>
        <div class="monaco-tree-editor-modal-content-footer">
          <Button @click="$emit('cancel')">
            <slot name="cancelText">cancel</slot>
          </Button>
          <Button @click="$emit('ok')" :type="type" :style="{ marginLeft: '4px' }">
            <slot name="okText">ok</slot>
          </Button>
        </div>
        <div class="monaco-tree-editor-modal-content-close" @click="$emit('close')">
          <CloseIcon
            :style="{
              width: '12px',
              height: '12px',
            }"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
