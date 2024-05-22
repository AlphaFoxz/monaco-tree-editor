<script setup lang="ts">
import './index.scss'
import CloseIcon from '../icons/Close'
import Button from '../button'
import { computed } from 'vue'
const props = defineProps({
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
defineEmits({
  close: () => true,
  cancel: () => true,
  ok: () => true,
})

const primaryColor = computed(() => {
  if (props.type === 'warn') {
    return 'darkred'
  }
  return '#528bff'
})
</script>

<template>
  <Teleport :to="target">
    <div ref="componentRef" class="music-monaco-editor-modal">
      <div class="music-monaco-editor-modal-mask" @click="$emit('close')"></div>
      <div class="music-monaco-editor-modal-content music-monaco-editor-modal-content-confirm">
        <div v-if="title" class="music-monaco-editor-modal-content-title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div ref="contentRef" class="music-monaco-editor-modal-content-content">
          <slot name="content"></slot>
        </div>
        <div class="music-monaco-editor-modal-content-footer">
          <Button @click="$emit('cancel')">
            <slot name="cancelText">cancel</slot>
          </Button>
          <Button @click="$emit('ok')" type="primary" :style="{ marginLeft: '4px', backgroundColor: primaryColor }">
            <slot name="okText">ok</slot>
          </Button>
        </div>
        <div class="music-monaco-editor-modal-content-close" @click="$emit('close')">
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
