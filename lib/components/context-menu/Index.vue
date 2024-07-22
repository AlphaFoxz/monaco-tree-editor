<script setup lang="ts">
import { ref } from 'vue'
import { useContextMenu, type ContextMenuItem } from './define'
import './index.scss'

defineProps({
  menu: {
    type: Array<ContextMenuItem<any>>,
    required: true,
  },
})
const emit = defineEmits({
  select: (_selected: ContextMenuItem<any>) => true,
})
const containerRef = ref<HTMLElement>()
const { x, y, visible } = useContextMenu(containerRef)

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
  <div ref="containerRef">
    <slot></slot>
    <Teleport to="body">
      <Transition @before-enter="handleBeforeEnter" @enter="handleEnter" @afterEnter="handleAfterEnter">
        <div
          v-if="visible"
          class="context-menu"
          :style="{
            left: x + 'px',
            top: y + 'px',
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
