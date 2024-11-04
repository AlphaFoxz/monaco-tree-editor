import { createUnmountableAgg } from 'vue-fn/domain'
import { onBeforeUnmount, reactive, ref } from 'vue'
import { type KeyName, FACADE_KEY_MAP } from '../define'

export type When = 'root' | 'editor'
export type Command = 'Format' | 'Save' | 'Delete'

export interface IHotkey {
  readonly when: When
  readonly key: KeyName | undefined
  readonly command: Command
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly shiftKey: boolean
  isMatch(e: KeyboardEvent): boolean
}
export type HotkeyOptions = {
  when: When
  key: KeyName | undefined
  command: Command
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}
export class Hotkey implements IHotkey {
  readonly when: When
  readonly key: KeyName | undefined
  readonly command: Command
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly shiftKey: boolean
  constructor(options: HotkeyOptions) {
    const { when, key, command, ctrlKey, altKey, shiftKey } = options
    this.command = command
    this.key = key
    this.when = when
    this.ctrlKey = ctrlKey || false
    this.altKey = altKey || false
    this.shiftKey = shiftKey || false
  }
  isMatch(e: KeyboardEvent) {
    return (
      this.key === toFacadeKey(e.key) &&
      e.ctrlKey === this.ctrlKey &&
      e.altKey === this.altKey &&
      e.shiftKey === this.shiftKey
    )
  }
}
export function toFacadeKey(key: string): KeyName {
  const length = key.length
  if (length !== 1) {
    return key as KeyName
  }
  if (FACADE_KEY_MAP[key]) {
    return FACADE_KEY_MAP[key] as KeyName
  }
  return key as KeyName
}
export type CommandsHandler = (hotkeys: IHotkey, e: KeyboardEvent) => void

export const IDEA_KEYBINDINGS: IHotkey[] = [
  new Hotkey({ when: 'editor', command: 'Format', ctrlKey: true, altKey: true, key: 'L' }),
  new Hotkey({ when: 'editor', command: 'Save', ctrlKey: true, key: 'S' }),
]

const aggMap: Record<string, ReturnType<typeof createAgg>> = {}

function createAgg(monacoInstanceId: string) {
  return createUnmountableAgg(() => {
    const commandHandler = ref<CommandsHandler>(() => {})
    const hotkeyMap = reactive<{ [key in Command]: IHotkey }>({
      Format: new Hotkey({ when: 'editor', command: 'Format', ctrlKey: true, altKey: true, key: 'L' }),
      Save: new Hotkey({ when: 'editor', command: 'Save', ctrlKey: true, key: 'S' }),
      Delete: new Hotkey({ when: 'root', command: 'Delete', key: 'Delete' }),
    })

    const domMap: Map<When, HTMLElement> = new Map()
    const callbackMap: Map<When, Array<Function>> = new Map()

    const preventCtrlAltShiftKeys: KeyName[] = []
    const preventCtrlShiftKeys: KeyName[] = ['P']
    const preventCtrlAltKeys: KeyName[] = []
    const preventCtrlKeys: KeyName[] = ['R', 'S', 'D', 'T', 'W']

    const preventAltShiftKeys: KeyName[] = []
    const preventAltKeys: KeyName[] = ['ArrowLeft', 'ArrowRight']

    const preventKeys: KeyName[] = ['F1', 'F3', 'F5', 'F12']

    function listenKeyDown(when: When) {
      return function (e: KeyboardEvent) {
        e.stopPropagation()
        const key = toFacadeKey(e.key)
        if (e.ctrlKey) {
          if (e.altKey && e.shiftKey && preventCtrlAltShiftKeys.includes(key)) {
            e.preventDefault()
          } else if (e.altKey && preventCtrlAltKeys.includes(key)) {
            e.preventDefault()
          } else if (e.shiftKey && preventCtrlShiftKeys.includes(key)) {
            e.preventDefault()
          } else if (preventCtrlKeys.includes(key)) {
            e.preventDefault()
          }
        } else if (e.altKey) {
          if (e.shiftKey && preventAltShiftKeys.includes(key)) {
            e.preventDefault()
          } else if (preventAltKeys.includes(key)) {
            e.preventDefault()
          }
        } else if (preventKeys.includes(key)) {
          e.preventDefault()
        }
        for (const hotkey of Object.values(hotkeyMap)) {
          if (!hotkey || when !== hotkey.when || !hotkey.isMatch(e)) {
            continue
          }
          commandHandler.value(hotkey, e)
        }
        const funs = callbackMap.get(when)
        if (funs) {
          funs.forEach((fun) => {
            fun(e)
          })
        }
      }
    }
    function init(name: When, bind: HTMLElement) {
      domMap.set(name, bind)
      const onKeyDown = listenKeyDown(name)
      bind.addEventListener('keydown', onKeyDown)
      onBeforeUnmount(() => {
        bind.removeEventListener('keydown', onKeyDown)
      })
    }
    function addKeybinding(hotkey: IHotkey) {
      hotkeyMap[hotkey.command] = hotkey
    }
    function addKeybindings(keybindings: IHotkey[]) {
      for (const hotkey of keybindings) {
        hotkeyMap[hotkey.command] = hotkey
      }
    }
    function clearKeybindings() {
      for (const command in hotkeyMap) {
        delete hotkeyMap[command as Command]
      }
    }
    function listen(name: When, callback: (e: KeyboardEvent) => void) {
      const funs = callbackMap.get(name)
      if (funs) {
        funs.push(callback)
      } else {
        callbackMap.set(name, [callback])
      }
    }
    function unlisten(name: When, callback: (e: KeyboardEvent) => void) {
      const funs = callbackMap.get(name)
      if (funs && funs.includes(callback)) {
        funs.splice(funs.indexOf(callback), 1)
      }
    }

    return {
      states: {
        hotkeyMap,
      },
      actions: {
        _init: init,
        _setCommandHandler(handler: CommandsHandler) {
          commandHandler.value = handler
        },
        addKeybinding,
        addKeybindings,
        clearKeybindings,
        listen,
        unlisten,
      },
      destory() {
        delete aggMap[monacoInstanceId]
      },
    }
  })
}

export function useHotkey(monacoInstanceId: string = 'default') {
  if (!aggMap[monacoInstanceId]) {
    aggMap[monacoInstanceId] = createAgg(monacoInstanceId)
  }
  return aggMap[monacoInstanceId].api
}
