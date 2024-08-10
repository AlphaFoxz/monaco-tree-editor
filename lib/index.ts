import Editor from './Index.vue'
import { useGlobalSettings } from './stores/global-settings-store'
import { useHotkey } from './stores/hotkey-store'
import { useMessage } from './stores/message-store'
import { useMonaco } from './stores/monaco-store'
import type { Files } from './define'

export { Editor, useGlobalSettings, useMessage, useHotkey, useMonaco, type Files }
