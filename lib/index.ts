import type { Files, FileInfo } from './domain/monaco-agg'
import Editor from './Editor.vue'
import { useGlobalSettings } from './domain/global-settings-agg'
import { useHotkey } from './domain/hotkey-agg'
import { useMonaco } from './domain/monaco-agg'
import { useMessage } from './domain/message-agg'

export type { Files, FileInfo }
export { Editor, useGlobalSettings, useMessage, useMonaco, useHotkey }
