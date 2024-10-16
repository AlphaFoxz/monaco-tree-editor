import { readonly, ref } from 'vue'
import { type LeftSiderBarItem } from '../left-sider-bar/define'
import { type ThemeMode } from '../themes/define'
import { type Language, useI18n } from './i18n-store'

namespace data {
  const contextMenuVisble = ref(false)
  const savingFiles = ref(new Set<string>())
  const savingTasks = ref<{ [k: string]: NodeJS.Timeout }>({})
  const opendLeftSiderBar = ref<LeftSiderBarItem | null>('Explorer')
  const currentThemeMode = ref<ThemeMode>('dark')
  const { currentLanguage } = useI18n().state
  const { setLanguage } = useI18n().action

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

  // ==================== expose api ====================
  export const api = {
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
      setLanguage,
      async setThemeMode(theme: ThemeMode) {
        currentThemeMode.value = theme
      },
      setOpendLeftSiderBar(item: LeftSiderBarItem | null) {
        opendLeftSiderBar.value = item
      },
    },
  }
}

export function useGlobalSettings() {
  return data.api
}
