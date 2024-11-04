import { nanoid } from 'nanoid'
import { ref } from 'vue'
import { type MessageOptions } from '../message-popup/define'
import { debounce } from '../common'
import { createUnmountableAgg } from 'vue-fn/domain'

const aggMap: Record<string, ReturnType<typeof createAgg>> = {}
function createAgg(monacoId: string) {
  return createUnmountableAgg(() => {
    const monacoInstanceId = ref(monacoId)
    const messages = ref<MessageOptions[]>([])
    const debounceMap = new Map<string, Function>()
    function genId() {
      return nanoid()
    }
    function pushMessage(options: MessageOptions): string {
      console.debug('推送消息', options)
      const id = genId()
      options.id = id
      messages.value = [...messages.value, options]
      if (options.timeoutMs && options.timeoutMs > 0) {
        const closeFn = debounce(() => {
          autoClose(id)
        }, options.timeoutMs)
        debounceMap.set(id, closeFn)
        closeFn()
      }
      return id
    }
    /**
     * Popup info message
     * @param options
     * @returns id
     */
    function info(options: MessageOptions): string {
      return pushMessage({
        ...options,
        type: 'info',
      })
    }
    /**
     * Popup success message
     * @param options
     * @returns id
     */
    function success(options: MessageOptions): string {
      return pushMessage({
        ...options,
        type: 'success',
      })
    }
    /**
     * Popup warn message
     * @param options
     * @returns id
     */
    function warn(options: MessageOptions): string {
      return pushMessage({
        ...options,
        type: 'warn',
      })
    }
    /**
     * Popup error message
     * @param options
     * @returns id
     */
    function error(options: MessageOptions): string {
      return pushMessage({
        ...options,
        type: 'error',
      })
    }
    /**
     * Close message by id
     * @param id
     */
    function close(id: string) {
      messages.value = messages.value.filter((item) => item.id !== id)
      debounceMap.delete(id)
    }
    function autoClose(id: string) {
      const item = messages.value.find((i) => i.id === id)
      if (item && item.timeoutMs && item.timeoutMs > 0) {
        close(id)
      }
    }
    /**
     * Update message options by id
     * @param options
     */
    function updateOptions(options: MessageOptions & {}) {
      messages.value.forEach((item) => {
        if (item.id === options.id) {
          Object.assign(item, options)
        }
      })
    }
    function keepAlive(id: string) {
      const closeFn = debounceMap.get(id)
      if (closeFn) {
        closeFn()
      }
    }

    return {
      states: {
        messages,
      },
      actions: {
        _keepAlive: keepAlive,
        info,
        success,
        warn,
        error,
        updateOptions,
        close,
      },
      destory() {
        delete aggMap[monacoInstanceId.value]
      },
    }
  })
}

export function useMessage(monacoInstanceId: string = 'default') {
  if (!aggMap[monacoInstanceId]) {
    const agg = createAgg(monacoInstanceId)
    aggMap[monacoInstanceId] = agg
  }
  return aggMap[monacoInstanceId].api
}
