import { defineStore } from 'pinia'
import { type Ref, onBeforeUnmount, ref } from 'vue'

export const useHotkey = defineStore('__hotkey', () => {
  let dom: HTMLElement
  let currentEvent = ref<KeyboardEvent>()

  let preventCtrlAltShiftKeys: string[] = []
  let preventCtrlShiftKeys: string[] = []
  let preventCtrlAltKeys: string[] = []
  let preventCtrlKeys = ['r', 'R', 's', 'S', 'd', 'D', 't', 'T']

  let preventAltShiftKeys: string[] = []
  let preventAltKeys: string[] = []

  let preventKeys = ['F5', 'F12']

  function onKeyDown(e: KeyboardEvent) {
    e.key
    if (e.ctrlKey) {
      if (e.altKey && e.shiftKey && preventCtrlAltShiftKeys.includes(e.key)) {
        e.preventDefault()
      } else if (e.altKey && preventCtrlAltKeys.includes(e.key)) {
        e.preventDefault()
      } else if (e.shiftKey && preventCtrlShiftKeys.includes(e.key)) {
        e.preventDefault()
      } else if (preventCtrlKeys.includes(e.key)) {
        e.preventDefault()
      }
    } else if (e.altKey) {
      if (e.shiftKey && preventAltShiftKeys.includes(e.key)) {
        e.preventDefault()
      } else if (preventAltKeys.includes(e.key)) {
        e.preventDefault()
      }
    } else if (preventKeys.includes(e.key)) {
      e.preventDefault()
    }
    currentEvent.value = e
  }
  function init(
    bind: HTMLElement,
    options: {
      preventCtrlAltShiftKeys?: string[]
      preventCtrlShiftKeys?: string[]
      preventCtrlAltKeys?: string[]
      preventCtrlKeys?: string[]
      preventAltShiftKeys?: string[]
      preventAltKeys?: string[]
      preventKeys?: string[]
    } = {}
  ) {
    dom = bind
    if (options.preventCtrlAltShiftKeys !== undefined) {
      preventCtrlAltShiftKeys = options.preventCtrlAltShiftKeys
    }
    if (options.preventCtrlShiftKeys !== undefined) {
      preventCtrlShiftKeys = options.preventCtrlShiftKeys
    }
    if (options.preventCtrlAltKeys !== undefined) {
      preventCtrlAltKeys = options.preventCtrlAltKeys
    }
    if (options.preventCtrlKeys !== undefined) {
      preventCtrlKeys = options.preventCtrlKeys
    }
    if (options.preventAltShiftKeys !== undefined) {
      preventAltShiftKeys = options.preventAltShiftKeys
    }
    if (options.preventAltKeys !== undefined) {
      preventAltKeys = options.preventAltKeys
    }
    if (options.preventKeys !== undefined) {
      preventKeys = options.preventKeys
    }
    dom.addEventListener('keydown', onKeyDown)
  }
  onBeforeUnmount(() => {
    dom.removeEventListener('keydown', onKeyDown)
  })
  return {
    init,
    currentEvent,
  }
})
