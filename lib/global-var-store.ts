import { ref } from 'vue'

const contextMenuVisble = ref(false)

export function useGlobalVarStore() {
  return {
    contextMenuVisble,
  }
}
