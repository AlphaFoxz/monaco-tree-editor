import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export function useContextMenu(container: Ref<HTMLElement | undefined>) {
  const x = ref(0)
  const y = ref(0)
  const visible = ref(false)
  function openMenu(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    visible.value = true
    x.value = e.clientX
    y.value = e.clientY
  }
  function closeMenu() {
    visible.value = false
  }
  onMounted(() => {
    container.value?.addEventListener('contextmenu', openMenu)
    window.addEventListener('click', closeMenu, true)
    window.addEventListener('contextmenu', closeMenu)
  })
  onUnmounted(() => {
    container.value?.removeEventListener('contextmenu', openMenu)
    window.removeEventListener('click', closeMenu)
    window.removeEventListener('contextmenu', closeMenu)
  })

  return { x, y, visible }
}

export type ContextMenuItem = {
  label?: string
  value?: string
}
