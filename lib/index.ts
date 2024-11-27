// ================ 聚合 aggregations ================
import type { Files, FileInfo } from '#domain/monaco-agg'
import Editor from '#lib/Editor.vue'
import { useGlobalSettings } from '#domain/global-settings-agg'
import { useHotkey } from '#domain/hotkey-agg'
import { useMonaco } from '#domain/monaco-agg'
import { useMessage } from '#domain/message-agg'

export type { Files, FileInfo }
export { Editor, useGlobalSettings, useMessage, useMonaco, useHotkey }

// ================ 插件 plugins ================
import { HotkeyPluginHelper } from '#domain/hotkey-agg'
import { HOTKEY_STORE_PLUGIN } from '#domain-plugin/hotkey-store'

export { HOTKEY_STORE_PLUGIN, HotkeyPluginHelper }
