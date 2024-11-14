import { createBroadcastEvent, createRequestEvent, createUnmountableAgg } from 'vue-fn/domain'
import { onBeforeUnmount, reactive, ref, type WatchHandle } from 'vue'
import { type KeyName, toFacadeKey } from '../define'
export * from './define'
import type { Command, CommandsHandler, IHotkey, When } from './define'
import { Hotkey } from './define'
import type { HotkeyStorePlugin } from './plugins'

const aggMap: Record<string, ReturnType<typeof createAgg>> = {}
const storePlugins: HotkeyStorePlugin[] = []
const aggHandleMap: Record<string, WatchHandle[]> = {}

function createAgg(monacoInstanceId: string) {
  return createUnmountableAgg(monacoInstanceId, (context) => {
    // ============================ 销毁逻辑 ============================
    context.onScopeDispose(() => {
      delete aggMap[monacoInstanceId]
      if (aggHandleMap[monacoInstanceId]) {
        for (const handle of aggHandleMap[monacoInstanceId]) {
          handle.stop()
        }
      }
      delete aggHandleMap[monacoInstanceId]
    })

    // ============================ 定义变量和默认值 ============================
    const commandHandler = ref<CommandsHandler>(() => {})
    const hotkeyMap = reactive<{ [key in Command]: IHotkey }>({
      Format: new Hotkey({ when: 'editor', command: 'Format', ctrlKey: true, altKey: true, key: 'L' }),
      Save: new Hotkey({ when: 'editor', command: 'Save', ctrlKey: true, key: 'S' }),
      DeleteFile: new Hotkey({ when: 'root', command: 'DeleteFile', key: 'Delete' }),
    })
    const domMap: Map<When, HTMLElement> = new Map()
    const callbackMap: Map<When, Array<Function>> = new Map()

    const preventCtrlAltShiftKeys: KeyName[] = []
    const preventCtrlShiftKeys: KeyName[] = ['P']
    const preventCtrlAltKeys: KeyName[] = []
    const preventCtrlKeys: KeyName[] = ['E', 'R', 'S', 'D', 'T', 'W']

    const preventAltShiftKeys: KeyName[] = []
    const preventAltKeys: KeyName[] = ['ArrowLeft', 'ArrowRight']

    const preventKeys: KeyName[] = ['F1', 'F3', 'F5', 'F12']

    // ============================ 定义事件 ============================
    const needLoadCacheEvent = createRequestEvent({}, (hotkeys: IHotkey[]) => {
      addKeybindings(hotkeys)
    })
    context.onBeforeInitialize(() => {
      needLoadCacheEvent.publishRequest({})
    })
    const onSaveTriggeredEvent = createBroadcastEvent({ hotkeyMap })

    function listenKeyDown(when: When) {
      return function (e: KeyboardEvent) {
        e.stopPropagation()
        const key = toFacadeKey(e.key)
        if (key === undefined) {
          return
        }
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
    function bindDom(name: When, bind: HTMLElement) {
      domMap.set(name, bind)
      const onKeyDown = listenKeyDown(name)
      bind.addEventListener('keydown', onKeyDown)
      onBeforeUnmount(() => {
        bind.removeEventListener('keydown', onKeyDown)
      })
    }
    function addKeybinding(hotkey: IHotkey) {
      hotkeyMap[hotkey.command] = hotkey
      onSaveTriggeredEvent.publish({ hotkeyMap })
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
      events: {
        needLoadCache: needLoadCacheEvent,
        onSaveTriggered: onSaveTriggeredEvent,
      },
      states: {
        hotkeyMap,
      },
      actions: {
        _init: bindDom,
        _setCommandHandler(handler: CommandsHandler) {
          commandHandler.value = handler
        },
        addKeybinding,
        addKeybindings,
        clearKeybindings,
        listen,
        unlisten,
      },
    }
  })
}

export function useHotkey(monacoInstanceId: string = 'default') {
  if (!aggMap[monacoInstanceId]) {
    const agg = createAgg(monacoInstanceId)
    aggMap[monacoInstanceId] = agg
    if (aggHandleMap[monacoInstanceId] === undefined) {
      aggHandleMap[monacoInstanceId] = []
    }
    for (const plugin of storePlugins) {
      aggHandleMap[monacoInstanceId].push(
        agg.api.events.needLoadCache.watchPublishRequest(({ reply }) => {
          console.debug('加载hotkey缓存')
          reply(plugin.getCachedHotkeys())
        })
      )
      aggHandleMap[monacoInstanceId].push(
        agg.api.events.onSaveTriggered.watchPublish(({ data }) => {
          plugin.saveHotkeys(data.hotkeyMap)
        })
      )
    }
  }
  return aggMap[monacoInstanceId].api
}

export function registerHotkeyStorePlugin(plugin: HotkeyStorePlugin) {
  storePlugins.push(plugin)
}
