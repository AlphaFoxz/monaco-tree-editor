import { nanoid } from 'nanoid'
import { ref } from 'vue'
import { type MessageOptions } from './define'
import { debounce } from '../common'
import { createMultiInstanceAgg } from 'vue-fn/domain'

const aggMap: Record<string, ReturnType<typeof createAgg>> = {}
function createAgg(monacoId: string) {
  return createMultiInstanceAgg(monacoId, (context) => {
    context.onScopeDispose(() => {
      delete aggMap[monacoId]
    })
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
    function info(options: MessageOptions): string {
      return pushMessage({
        ...options,
        type: 'info',
      })
    }
    function success(options: MessageOptions): string {
      return pushMessage({
        ...options,
        type: 'success',
      })
    }
    function warn(options: MessageOptions): string {
      return pushMessage({
        ...options,
        type: 'warn',
      })
    }
    function error(options: MessageOptions): string {
      return pushMessage({
        ...options,
        type: 'error',
      })
    }
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
      commands: {
        _keepAlive: keepAlive,
        info,
        success,
        warn,
        error,
        updateOptions,
        close,
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
