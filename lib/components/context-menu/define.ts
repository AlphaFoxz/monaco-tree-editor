import { onMounted, onUnmounted, ref, type ComputedRef, type Ref } from 'vue'

let visibleHistory: Ref<boolean>[] = []
function clear() {
  visibleHistory.forEach((e) => {
    e.value = false
  })
  visibleHistory = []
}
export function useContextMenu(
  container: Ref<HTMLElement | undefined>,
  trigger: TriggerType[] | undefined,
  position: PositionType | undefined
) {
  if (trigger === undefined) {
    trigger = ['RClick']
  }
  const left = ref<number>()
  const right = ref<number>()
  const top = ref<number>()
  const bottom = ref<number>()
  const visible = ref(false)
  function openMenu(e: MouseEvent) {
    clear()
    e.preventDefault()
    e.stopPropagation()
    visible.value = true
    if (position) {
      const split = position.split('')
      if (split[0] === 'R') {
        left.value = container.value?.offsetLeft! + container.value?.clientWidth!
      } else {
        left.value = container.value?.offsetLeft!
      }
      if (split[1] === 'B') {
        bottom.value = container.value?.offsetTop! + container.value?.clientHeight!
      } else {
        bottom.value = container.value?.offsetTop!
      }
    } else {
      left.value = e.clientX
      top.value = e.clientY
    }
    visibleHistory.push(visible)
  }
  function closeMenu() {
    visible.value = false
  }
  onMounted(() => {
    if (trigger.includes('RClick')) {
      container.value?.addEventListener('contextmenu', openMenu)
    }
    if (trigger.includes('Click')) {
      container.value?.addEventListener('click', openMenu)
    }
    window.addEventListener('contextmenu', closeMenu)
    window.addEventListener('click', closeMenu, true)
  })
  onUnmounted(() => {
    if (trigger.includes('RClick')) {
      container.value?.removeEventListener('contextmenu', openMenu)
    }
    if (trigger.includes('Click')) {
      container.value?.removeEventListener('click', openMenu)
    }
    window.removeEventListener('contextmenu', closeMenu)
    window.removeEventListener('click', closeMenu)
  })

  return { left, right, top, bottom, visible }
}

export type ContextMenuItem<T> = {
  label?: string | ComputedRef<string>
  value?: T
}

export type TriggerType = 'Click' | 'RClick'
export type PositionType = 'TL' | 'TR' | 'BL' | 'BR' | 'LT' | 'LB' | 'RT' | 'RB'
