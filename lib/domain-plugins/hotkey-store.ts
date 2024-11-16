import { type WatchHandle } from 'vue'
import { HotkeyPluginHelper } from '../domains/hotkey-agg'
import { type Command, hotkeyToJsonString, jsonStringToHotkey } from '../domains/hotkey-agg/define'

export const HOTKEY_STORE_PLUGIN = HotkeyPluginHelper.defineSetupPlugin(() => {
  const handlesMap: Record<string, WatchHandle[]> = {}
  return {
    register(agg) {
      console.debug('加载插件')
      handlesMap[agg.id] = []
      handlesMap[agg.id].push(
        agg.api.events.needLoadCache.watchPublishRequest(({ reply }) => {
          const cache = localStorage.getItem('hotkeys')
          if (cache) {
            return reply(JSON.parse(cache).map((i: string) => jsonStringToHotkey(i)))
          }
          return reply([])
        })
      )
      handlesMap[agg.id].push(
        agg.api.events.onKeybindingChangedByUser.watchPublish(({ data }) => {
          console.log('hotkeyStore保存快捷键')
          const json: string[] = []
          for (const hotykey in data.hotkeyMap) {
            json.push(hotkeyToJsonString(data.hotkeyMap[hotykey as Command]))
          }
          localStorage.setItem('hotkeys', JSON.stringify(json))
        })
      )
      handlesMap[agg.id].push(
        agg.api.events.destroyed.watchPublish(() => {
          for (const handle of handlesMap[agg.id]) {
            handle()
          }
          delete handlesMap[agg.id]
        })
      )
    },
  }
})
