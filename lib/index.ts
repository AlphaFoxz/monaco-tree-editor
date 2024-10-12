import type { Files, FileInfo } from './define'
import Editor from './Editor.vue'
import { useGlobalSettings } from './stores/global-settings-store'
import { useHotkey } from './stores/hotkey-store'
import { useMonaco } from './stores/monaco-store'
import { useMessage } from './stores/message-store'

export type { Files, FileInfo }
export { Editor, useGlobalSettings, useMessage, useMonaco, useHotkey }
