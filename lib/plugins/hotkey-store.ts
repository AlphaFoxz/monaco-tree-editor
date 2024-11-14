import { hotkeyToJsonString, jsonStringToHotkey, type IHotkey } from '../domain/hotkey-agg/define'
import type { HotkeyStorePlugin } from '../domain/hotkey-agg/plugins'

export const HOTKEY_STORE_PLUGIN: HotkeyStorePlugin = {
  getCachedHotkeys() {
    const cache = localStorage.getItem('hotkeys')
    if (cache) {
      return JSON.parse(cache).map((i: string) => jsonStringToHotkey(i))
    }
    return []
  },
  saveHotkeys(hotkeyMap: Record<string, IHotkey>) {
    console.log('hotkeyStore保存快捷键')
    const json: string[] = []
    for (const hotykey in hotkeyMap) {
      json.push(hotkeyToJsonString(hotkeyMap[hotykey]))
    }
    localStorage.setItem('hotkeys', JSON.stringify(json))
  },
}
