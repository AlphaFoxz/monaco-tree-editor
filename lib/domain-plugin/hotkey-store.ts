import { type WatchHandle, watch } from 'vue'
import { HotkeyPluginHelper } from '../domain/hotkey-agg'
import { type Command, hotkeyToJsonString, jsonStringToHotkey } from '../domain/hotkey-agg/define'

export const HOTKEY_STORE_PLUGIN = HotkeyPluginHelper.createSetupPlugin(() => {
  const handlesMap: Record<string, WatchHandle[]> = {}
  return {
    mount({ api, __aggId }) {
      console.debug('加载插件')
      handlesMap[__aggId] = []
      handlesMap[__aggId].push(
        watch(api.states.hotkeyMap, () => {
          console.debug('更新快捷键')
        }),
      )
      api.events.needLoadCache.listenAndReply(({}) => {
        const cache = localStorage.getItem('hotkeys')
        if (cache) {
          return JSON.parse(cache).map((i: string) => jsonStringToHotkey(i))
        }
        return []
      })
      api.events.onKeybindingChangedByUser.listen(({ data }) => {
        console.log('hotkeyStore保存快捷键')
        const json: string[] = []
        for (const hotykey in data.hotkeyMap) {
          json.push(hotkeyToJsonString(data.hotkeyMap[hotykey as Command]))
        }
        localStorage.setItem('hotkeys', JSON.stringify(json))
      })
      api.events.destroyed.listen(() => {
        for (const handle of handlesMap[__aggId] ?? []) {
          handle()
        }
        delete handlesMap[__aggId]
      })
    },
  }
})
