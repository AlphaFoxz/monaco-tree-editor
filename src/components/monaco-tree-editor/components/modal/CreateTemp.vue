<script setup lang="ts">
import { render, isVNode, onMounted, ref } from 'vue'
import './index.less'
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
    <div ref="componentRef" class="music-monaco-editor-modal">
      <div class="music-monaco-editor-modal-mask" @click="close"></div>
      <div ref="contentRef" class="music-monaco-editor-modal-content">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>
