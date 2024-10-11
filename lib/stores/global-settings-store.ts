import { readonly, ref } from 'vue'
import { type LeftSiderBarItem } from '../left-sider-bar/define'
import { type ThemeMode } from '../themes/define'
import { useI18n } from '../locale'
import type { Language } from '../locale/define'
import { useMonaco } from './monaco-store'

const contextMenuVisble = ref(false)
const savingFiles = ref(new Set<string>())
const savingTasks = ref<{ [k: string]: NodeJS.Timeout }>({})
const opendLeftSiderBar = ref<LeftSiderBarItem | null>('Explorer')
const currentThemeMode = ref<ThemeMode>('dark')
const { currentLanguage } = useI18n()
let monacoStore: any

function lockFile(path: string, timeout: () => void, timeoutMs = 8 * 1000) {
  if (isFileLocked(path)) {
    return null
  }
  savingFiles.value.add(path)
  const intervalId = setInterval(() => {
    unlockFile(path)
    timeout()
  }, timeoutMs)
  savingTasks.value[path] = intervalId
  return intervalId
}
function isFileLocked(filePath: string) {
  return savingFiles.value.has(filePath)
}
function unlockFile(path: string) {
  savingFiles.value.delete(path)
  const intervalId = savingTasks.value[path]
  if (intervalId) {
    delete savingTasks.value[path]
    clearInterval(intervalId)
  }
}
function getOpenedTabsHeight(): number {
  return document.getElementsByClassName('monaco-tree-editor-opened-tab')[0].clientHeight
}
/**
 * Switch current active left sider bar, if `autoClose` = true and the param `item` is
 * the same as currentLeftSiderBar.value, it will close
 * @param item
 * @param autoClose
 */
function switchCurrentLeftSiderBar(item: LeftSiderBarItem | null, autoClose = true) {
  if (autoClose && opendLeftSiderBar.value === item) {
    opendLeftSiderBar.value = null
  } else {
    opendLeftSiderBar.value = item
  }
}
/**
 * Change language
 * @param lang
 */
function changeLanguage(lang: Language) {
  currentLanguage.value = lang
}

// ==================== expose api ====================
const api = {
  state: {
    contextMenuVisble: readonly(contextMenuVisble),
    themeMode: readonly(currentThemeMode),
    opendLeftSiderBar: readonly(opendLeftSiderBar),
    currentLanguage: readonly(currentLanguage),
  },
  _action: {
    lockFile,
    isFileLocked,
    unlockFile,
    getOpenedTabsHeight,
  },
  action: {
    switchCurrentLeftSiderBar,
    changeLanguage,
    async setThemeMode(theme: ThemeMode) {
      if (!monacoStore) {
        monacoStore = useMonaco()
      }
      await monacoStore._action.untilMonacoImported()
      currentThemeMode.value = theme
    },
    setOpendLeftSiderBar(item: LeftSiderBarItem | null) {
      opendLeftSiderBar.value = item
    },
  },
}

/**
 * Custom hook for global settings.
 *
 * @param {Object} options - Optional parameters to set initial values.
 * @param {ThemeMode} options.currentThemeMode - The initial theme mode.
 * @param {boolean} options.contextMenuVisble - The initial visibility of the context menu.
 * @param {Language} options.currentLanguage - The initial language.
 * @returns {Object} - An object containing the state and actions related to the global settings.
 */
export function useGlobalSettings(options?: {
  currentThemeMode?: ThemeMode
  contextMenuVisble?: boolean
  currentLanguage?: Language
}) {
  // Set initial values from options parameter if provided
  if (options?.currentThemeMode) {
    currentThemeMode.value = options.currentThemeMode
  }
  if (options?.contextMenuVisble) {
    contextMenuVisble.value = options.contextMenuVisble
  }
  if (options?.currentLanguage) {
    currentLanguage.value = options.currentLanguage
  }

  // Return an object containing the state and actions related to the global settings
  return api
}
