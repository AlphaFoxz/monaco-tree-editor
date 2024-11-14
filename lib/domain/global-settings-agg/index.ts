import { ref } from 'vue'
import { type LeftSiderBarItem, type ThemeMode } from '../define'
import { useI18n } from '../i18n-agg'
import { createAgg } from 'vue-fn/domain'

const agg = createAgg(() => {
  const contextMenuVisble = ref(false)
  const savingFiles = new Set<string>()
  const savingTasks = ref<{ [k: string]: NodeJS.Timeout }>({})
  const opendLeftSiderBar = ref<LeftSiderBarItem | undefined>('Explorer')
  const currentThemeMode = ref<ThemeMode>('dark')
  const { currentLanguage } = useI18n().states
  const { setLanguage } = useI18n().actions

  function lockFile(path: string, timeout: () => void, timeoutMs = 8 * 1000) {
    if (isFileLocked(path)) {
      return null
    }
    savingFiles.add(path)
    const intervalId = setInterval(() => {
      unlockFile(path)
      timeout()
    }, timeoutMs)
    savingTasks.value[path] = intervalId
    return intervalId
  }
  function isFileLocked(filePath: string) {
    return savingFiles.has(filePath)
  }
  function unlockFile(path: string) {
    savingFiles.delete(path)
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
  function switchCurrentLeftSiderBar(item: LeftSiderBarItem | undefined, autoClose = true) {
    if (autoClose && opendLeftSiderBar.value === item) {
      opendLeftSiderBar.value = undefined
    } else {
      opendLeftSiderBar.value = item
    }
  }

  return {
    events: {},
    states: {
      contextMenuVisble,
      themeMode: currentThemeMode,
      opendLeftSiderBar,
      currentLanguage,
    },
    actions: {
      _lockFile: lockFile,
      _isFileLocked: isFileLocked,
      _unlockFile: unlockFile,
      _getOpenedTabsHeight: getOpenedTabsHeight,
      switchCurrentLeftSiderBar,
      setLanguage,
      setThemeMode(theme: ThemeMode) {
        currentThemeMode.value = theme
      },
    },
  }
})

export function useGlobalSettings() {
  return agg.api
}
