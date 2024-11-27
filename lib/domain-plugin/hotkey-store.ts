import { type WatchHandle, watch } from 'vue'
import { HotkeyPluginHelper } from '../domain/hotkey-agg'
import { type Command, hotkeyToJsonString, jsonStringToHotkey } from '../domain/hotkey-agg/define'

export const HOTKEY_STORE_PLUGIN = HotkeyPluginHelper.createSetupPlugin(() => {
  const handlesMap: Record<string, WatchHandle[]> = {}
  return {
    mount({ api, aggHash }) {
      console.debug('加载插件')
      handlesMap[aggHash] = []
      handlesMap[aggHash].push(
        watch(api.states.hotkeyMap, () => {
          console.debug('更新快捷键')
        })
      )
      api.events.needLoadCache.watchPublishRequest(({ reply }) => {
        const cache = localStorage.getItem('hotkeys')
        if (cache) {
          return reply(JSON.parse(cache).map((i: string) => jsonStringToHotkey(i)))
        }
        return reply([])
      })
      api.events.onKeybindingChangedByUser.watchPublish(({ data }) => {
        console.log('hotkeyStore保存快捷键')
        const json: string[] = []
        for (const hotykey in data.hotkeyMap) {
          json.push(hotkeyToJsonString(data.hotkeyMap[hotykey as Command]))
        }
        localStorage.setItem('hotkeys', JSON.stringify(json))
      })
      handlesMap[aggHash].push(
        api.events.destroyed.watchPublish(() => {
          for (const handle of handlesMap[aggHash]) {
            handle()
          }
          delete handlesMap[aggHash]
        })
      )
    },
  }
})
