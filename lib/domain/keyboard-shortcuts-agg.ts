import { createUnmountableAgg } from 'vue-fn/domain'
import { computed, ref } from 'vue'
import { nanoid } from 'nanoid'
import { type KeyName, toFacadeKey } from './define'
import { type Command, type When, Hotkey } from './hotkey-agg'

const aggMap: Record<string, ReturnType<typeof createAgg>> = {}

function createAgg(id: string) {
  return createUnmountableAgg((context) => {
    context.onScopeDispose(() => {
      delete aggMap[id]
    })

    const when = ref()
    const command = ref()
    const ctrlKey = ref(false)
    const altKey = ref(false)
    const shiftKey = ref(false)
    const key = ref<KeyName>()
    const display = computed(() => {
      const str = []
      if (ctrlKey.value) {
        str.push('Ctrl')
      }
      if (altKey.value) {
        str.push('Alt')
      }
      if (shiftKey.value) {
        str.push('Shift')
      }
      const k = key.value as string
      if (k && k !== 'Control' && k !== 'Shift' && k !== 'Alt') {
        str.push(key.value)
      }
      return str.join(' + ')
    })

    function onKeyboardEvent(e: KeyboardEvent) {
      ctrlKey.value = e.ctrlKey
      altKey.value = e.altKey
      shiftKey.value = e.shiftKey
      key.value = toFacadeKey(e.key)
    }
    return {
      states: {
        display,
      },
      actions: {
        onKeyboardEvent,
        reset(w: When, c: Command) {
          when.value = w
          command.value = c
          ctrlKey.value = false
          altKey.value = false
          shiftKey.value = false
          key.value = undefined
        },
        getHotkey() {
          let k = key.value as string | undefined
          if (k === 'Control' || k === 'Shift' || k === 'Alt') {
            k = undefined
          }
          return new Hotkey({
            when: when.value,
            key: k as KeyName | undefined,
            command: command.value,
            ctrlKey: ctrlKey.value,
            altKey: altKey.value,
            shiftKey: shiftKey.value,
          })
        },
      },
    }
  })
}

export function useKeyboardShortcuts() {
  const id = nanoid()
  const agg = createAgg(id)
  aggMap[id] = agg
  return agg.api
}
