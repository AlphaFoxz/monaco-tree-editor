<script setup lang="ts">
import { ref } from 'vue'
import { useContextMenu, type ContextMenuItem, type TriggerType, type PositionType } from './define'
import './index.scss'

const props = defineProps({
  menu: {
    type: Array<ContextMenuItem<any>>,
    required: true,
  },
  trigger: {
    type: Array<TriggerType>,
    default: () => undefined,
  },
  position: {
    type: String,
    default: () => undefined,
  },
})
const emit = defineEmits({
  select: (_selected: ContextMenuItem<any>) => true,
})
const containerRef = ref<HTMLElement>()
const { left, right, top, bottom, visible } = useContextMenu(
  containerRef,
  props.trigger,
  props.position as PositionType
)

const handleClick = (item: ContextMenuItem<any>) => {
  console.debug('当前选择', item)
  emit('select', item)
  visible.value = false
}
const handleBeforeEnter = (el: Element) => {
  ;(el as HTMLElement).style.height = '0'
}
const handleEnter = (el: Element) => {
  const htmlEle = el as HTMLElement
  htmlEle.style.height = 'auto'
  const h = el.clientHeight
  htmlEle.style.height = '0'
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      htmlEle.style.height = h + 'px'
      htmlEle.style.transition = '.5s'
    })
  })
}
const handleAfterEnter = (el: Element) => {
  const htmlEle = el as HTMLElement
  htmlEle.style.transition = 'none'
}
</script>

<template>
  <div ref="containerRef" data-type="context-menu">
    <slot></slot>
    <Teleport to="body">
      <Transition
        @before-enter="handleBeforeEnter"
        @enter="handleEnter"
        @afterEnter="handleAfterEnter"
        @contextmenu.prevent.stop
      >
        <div
          v-if="visible"
          class="context-menu"
          :style="{
            left: left === undefined ? undefined : left + 'px',
            right: right === undefined ? undefined : right + 'px',
            top: top === undefined ? undefined : top + 'px',
            bottom: bottom === undefined ? undefined : bottom + 'px',
          }"
        >
          <div class="menu-list">
            <template v-for="item in menu">
              <div
                class="menu-item"
                v-if="item.label"
                @mouseup="handleClick(item)"
                @contextmenu.prevent.stop="handleClick(item)"
              >
                {{ typeof item.label === 'string' ? item.label : item.label.value }}
              </div>
              <div v-else class="line" @click.prevent.stop></div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.context-menu {
  z-index: 10;
}
</style>
