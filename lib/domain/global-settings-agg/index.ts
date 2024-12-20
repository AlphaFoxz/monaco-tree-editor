import { ref } from 'vue'
import { type LeftSiderBarItem, type ThemeMode } from '../define'
import { useI18n } from '#domain/i18n-agg'
import { createSingletonAgg } from 'vue-fn/domain'

const agg = createSingletonAgg(() => {
  // =================== 主题颜色 ==================
  const currentThemeMode = ref<ThemeMode>('dark')

  // ================== 国际化 i18n ==================
  const { currentLanguage } = useI18n().states
  const { setLanguage } = useI18n().commands

  // =================== 其他 ==================
  const contextMenuVisble = ref(false)
  const savingFiles = new Set<string>()
  const savingTasks = ref<{ [k: string]: NodeJS.Timeout }>({})
  const opendLeftSiderBar = ref<LeftSiderBarItem | undefined>('Explorer')

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
    commands: {
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
