import { ref } from 'vue'

const contextMenuVisble = ref(false)
const savingFiles = ref<Set<string>>(new Set())

export function useGlobalVar() {
  return {
    contextMenuVisble,
    savingFiles,
  }
}
