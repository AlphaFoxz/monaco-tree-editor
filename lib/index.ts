import type { Files, FileInfo } from './domains/monaco-agg'
import Editor from './Editor.vue'
import { useGlobalSettings } from './domains/global-settings-agg'
import { useHotkey } from './domains/hotkey-agg'
import { useMonaco } from './domains/monaco-agg'
import { useMessage } from './domains/message-agg'

// ================ 加载插件 plugin ================
import { registerHotkeyPlugin } from './domains/hotkey-agg'
import { HOTKEY_STORE_PLUGIN } from './domain-plugins/hotkey-store'
registerHotkeyPlugin(HOTKEY_STORE_PLUGIN)

export type { Files, FileInfo }
export { Editor, useGlobalSettings, useMessage, useMonaco, useHotkey }
