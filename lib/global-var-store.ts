import { ref } from 'vue'
import { type LeftSiderBarItem } from './left-sider-bar/define'
import { type ThemeMode } from './themes/define'

const contextMenuVisble = ref(false)
const savingFiles = ref(new Set<string>())
const savingTasks = ref<{ [k: string]: NodeJS.Timeout }>({})
const currentLeftSiderBar = ref<LeftSiderBarItem | null>('Explorer')
const currentThemeMode = ref<ThemeMode>('dark')

export function useGlobalVar() {
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
  function setCurrentLeftSiderBar(item: LeftSiderBarItem | null, autoClose = true) {
    if (autoClose && currentLeftSiderBar.value === item) {
      currentLeftSiderBar.value = null
    } else {
      currentLeftSiderBar.value = item
    }
  }
  function getCurrentLeftSiderBar() {
    return currentLeftSiderBar
  }
  function getThemeMode() {
    return currentThemeMode
  }
  return {
    contextMenuVisble,
    lockFile,
    isFileLocked,
    unlockFile,
    getOpenedTabsHeight,
    setCurrentLeftSiderBar,
    getCurrentLeftSiderBar,
    getThemeMode,
  }
}
