import { ref } from 'vue'

const contextMenuVisble = ref(false)
const savingFiles = ref(new Set<string>())
const savingTasks = ref<{ [k: string]: NodeJS.Timeout }>({})

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
  return {
    contextMenuVisble,
    lockFile,
    isFileLocked,
    unlockFile,
    getOpenedTabsHeight,
  }
}
