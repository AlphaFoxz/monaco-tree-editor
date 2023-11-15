<script setup lang="ts">
import { h, isVNode, mergeProps, nextTick, onUnmounted, ref, render, watch } from 'vue'
import ArrowIcon from '../icons/Arrow'
import Position from './PositionTemp.vue'
import './index.less'
const props = defineProps({
  defaultValue: String,
  children: Array<Object>,
  getContainer: {
    type: () => HTMLElement,
    default: () => () => document.body,
  },
})
const emit = defineEmits({ change: (_value: any) => true })

const instance = ref(document.createElement('div'))
instance.value.className = 'music-monaco-editor-select-items'

const visible = ref(false)
const data = ref({
  value: props.defaultValue,
  label: '',
})
const targetRef = ref()

watch(
  () => props.defaultValue,
  () => {
    targetRef.value.children.map((dom: HTMLElement) => {
      targetRef.value.removeChild(dom)
    })
    if (!props.children) {
      return
    }
    const children: Array<any> = []
    props.children?.map((item) => {
      if (isVNode(item)) {
        item.props = mergeProps(item.props!, {
          defaultValue: data.value.value,
          handleSelect,
        })
        children.push(item)
      } else if (item instanceof HTMLElement) {
        children.push(() => item)
      }
    })
    const vnode = h(
      Position,
      {
        props: {
          instance: instance.value,
          ref: 'targetRef',
          getContainer: props.getContainer,
        },
      },
      children
    )
    nextTick(() => render(vnode, targetRef.value))
  }
)
function hide() {
  visible.value = false
}
onUnmounted(() => {
  document.body.removeEventListener('click', hide)
  if (document.body.contains(instance.value)) {
    document.body.removeChild(instance.value)
  }
})
watch(visible, (n) => {
  if (n) {
    document.body.addEventListener('click', hide)
  } else {
    document.body.removeEventListener('click', hide)
  }
})
const handleSelect = (data: any) => {
  data.value = data
  emit('change', data)
  visible.value = false
}
</script>

<template>
  <div ref="targetRef" class="music-monaco-editor-select">
    <div
      class="music-monaco-editor-select-content"
      @click="
        (e) => {
          e.stopPropagation()
          visible = !visible
        }
      "
    >
      {{ data.label }}
      <div class="music-monaco-editor-select-content-arrow">
        <ArrowIcon :collpase="!visible" />
      </div>
    </div>
  </div>
  <div ref="targetRef"></div>
  <!-- <Position
            :instance="instance"
            :targetRef="targetRef"
            :getContainer="getContainer">
                React.Children.toArray(children).map(child => (
                    React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, {
                        defaultValue: data.value,
                        handleSelect,
                    }) : child
                ))
        </Position> -->
</template>
