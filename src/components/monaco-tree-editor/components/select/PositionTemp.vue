<script setup lang="ts">
import { onUnmounted, watch } from 'vue'

const props = defineProps({
  instance: null,
  children: Array<any>,
  targetRef: HTMLElement,
  style: null,
  getContainer: {
    type: Function,
    default: () => () => document.body,
  },
  onInstanceStyleChange: {
    type: Function,
    default: () => (instance: HTMLElement, style: any) => {
      instance.style.top = style.top
      instance.style.left = style.left
      instance.style.width = style.width
    },
  },
})
const emit = defineEmits({ notVisibleArea: null })
const container: HTMLElement = props.getContainer() || document.body
watch(
  () => props.instance,
  (n: HTMLElement, o: HTMLElement) => {
    document.body.appendChild(n)
    document.contains(o) && document.removeChild(o)
  }
)
let handleScroll: (this: HTMLElement, event: Event) => void
watch(
  () => props.targetRef,
  () => {
    function setInstanceStyle() {
      const { top, left, height, width } = props.targetRef?.getBoundingClientRect()!
      const style = {
        top: document.documentElement.scrollTop + top + height + 1 + 'px',
        left: document.documentElement.scrollLeft + left + 'px',
      }
      props.onInstanceStyleChange(props.instance, {
        top: style.top,
        left: style.left,
        width: width + 'px',
      })
      return { top, left, height }
    }
    setInstanceStyle()
    container.removeEventListener('scroll', handleScroll)
    handleScroll = function () {
      const { top, height } = setInstanceStyle()
      if (container.offsetTop > top) {
        emit('notVisibleArea')
      }
      if (top - container.offsetTop + height > container.offsetHeight) {
        emit('notVisibleArea')
      }
    }
    container.addEventListener('scroll', handleScroll)
  }
)
onUnmounted(() => {
  container.removeEventListener('scroll', handleScroll)
})
</script>

<template></template>
