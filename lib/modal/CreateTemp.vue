<script setup lang="ts">
import { render, isVNode, onMounted, ref } from 'vue'
import './index.scss'
const props = defineProps({
  content: null,
  target: null,
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
  } else if (isVNode(props.content)) {
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
      <div ref="contentRef" class="monaco-tree-editor-modal-content">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>
