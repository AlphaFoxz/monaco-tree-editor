<script setup lang="ts">
import './index.scss'
import CloseIcon from '../../icons/Close.vue'
import Button from '../button/Index.vue'
import { isVNode, onMounted, ref, render } from 'vue'
const props = defineProps({
  title: {
    type: String,
    default: '提示',
  },
  content: {
    type: null,
    default: '',
  },
  okText: {
    type: String,
    default: '确认',
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  onCancel: {
    type: Function,
    default: () => (close: Function) => {
      close()
    },
  },
  onOk: {
    type: Function,
    default: () => (close: Function) => {
      close()
    },
  },
  target: {
    type: null,
    default: () => document.body,
  },
})

const contentRef = ref<HTMLElement>()
const componentRef = ref<HTMLElement>()
const closed = ref(false)
const close = () => {
  closed.value = true
}
onMounted(() => {
  if (props.content instanceof HTMLElement) {
    contentRef.value?.appendChild(props.content)
  } else if (isVNode(props.content) || props.content) {
    render(props.content, contentRef.value!)
  } else if (typeof props.content === 'string') {
    contentRef.value!.innerHTML = props.content
  } else if (props.content instanceof Function) {
    render(props.content(close), contentRef.value!)
  } else {
    render(props.content, contentRef.value!)
  }
})
defineExpose({ close })
</script>

<template>
  <Teleport v-if="!closed" :to="target">
    <div ref="componentRef" class="monaco-tree-editor-modal">
      <div class="monaco-tree-editor-modal-mask" @click="close"></div>
      <div class="monaco-tree-editor-modal-content monaco-tree-editor-modal-content-confirm">
        <div v-if="title" class="monaco-tree-editor-modal-content-title">
          {{ title }}
        </div>
        <div ref="contentRef" class="monaco-tree-editor-modal-content-content"></div>
        <div class="monaco-tree-editor-modal-content-footer">
          <Button @click="() => onCancel(close)">
            {{ cancelText }}
          </Button>
          <Button @click="() => onOk(close)" type="primary" :style="{ marginLeft: '4px' }">
            {{ okText }}
          </Button>
        </div>
        <div class="monaco-tree-editor-modal-content-close" @click="close">
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
