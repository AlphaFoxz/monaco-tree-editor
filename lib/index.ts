import Editor from './Index.vue'
import { useMessage } from './stores/message-store'
import { useMonaco } from './stores/monaco-store'
import { useHotkey } from './stores/hotkey-store'
import { type Files } from './define'

export { Editor, useMessage, useHotkey, useMonaco, type Files }
