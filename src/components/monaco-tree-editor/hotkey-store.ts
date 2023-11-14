import { defineStore } from 'pinia'
import { type Ref, onBeforeUnmount, ref } from 'vue'

export const useHotkey = defineStore('__hotkey', () => {
  let domMap: Map<string, HTMLElement> = new Map()
  let callbackMap: Map<string, Array<Function>> = new Map()

  let preventCtrlAltShiftKeys: string[] = []
  let preventCtrlShiftKeys: string[] = []
  let preventCtrlAltKeys: string[] = []
  let preventCtrlKeys = ['r', 'R', 's', 'S', 'd', 'D', 't', 'T', 'w', 'W']

  let preventAltShiftKeys: string[] = []
  let preventAltKeys: string[] = ['ArrowLeft', 'ArrowRight']

  let preventKeys = ['F5', 'F12']

  function listenKeyDown(name: string) {
    return function (e: KeyboardEvent) {
      e.stopPropagation()
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
      const funs = callbackMap.get(name)
      if (funs) {
        funs.forEach((fun) => {
          fun(e)
        })
      }
    }
  }
  function init(
    name: string,
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
    domMap.set(name, bind)
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
    const onKeyDown = listenKeyDown(name)
    bind.addEventListener('keydown', onKeyDown)
    onBeforeUnmount(() => {
      bind.removeEventListener('keydown', onKeyDown)
    })
  }
  function listen(name: string, callback: (e: KeyboardEvent) => void) {
    const funs = callbackMap.get(name)
    if (funs) {
      funs.push(callback)
    } else {
      callbackMap.set(name, [callback])
    }
  }
  return {
    init,
    listen,
  }
})
