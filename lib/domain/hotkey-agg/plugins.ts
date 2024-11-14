import type { IHotkey } from './define'

export interface HotkeyStorePlugin {
  getCachedHotkeys(): IHotkey[]
  saveHotkeys(hotkeyMap: Record<string, IHotkey>): void
}
