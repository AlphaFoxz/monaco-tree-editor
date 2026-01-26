# About Domains

This section introduces the domains designed and implemented in this repository, their functionalities, and how to use them.

## states

- Contains properties converted to read-only while maintaining reactivity. To watch reactive values, use Vue's standard `watch` function.

```typescript
import { useMonaco } from 'monaco-tree-editor'
import { watch } from 'vue'

const monacoAgg = useMonaco()
watch(monacoAgg.states.projectName, (n, o) => {
  console.log(`Project name changed: ${o} -> ${n}`)
})
```

## commands

- Contains `business-verified functions` that retrieve business values from within the aggregation or affect internal properties.

```typescript
import { useMonaco } from 'monaco-tree-editor'
import { watch } from 'vue'

const monacoAgg = useMonaco()
// Format the code in the current editor
monacoAgg.commands.format()
```

## events

- When something happens inside the aggregation, events are published. You can listen to them using the event's `watch` function.

```typescript
import { useHotkey } from 'monaco-tree-editor'

const hotkeyAgg = useHotkey()
// Request/Reply mode: This event expects a reply. If someone is listening, they can provide data to the aggregation.
// If there are multiple listeners, the event ensures only the first valid reply is used.
hotkeyAgg.events.needLoadCache.watchRequest(({ reply }) => {
  const caches = [] // TODO: Load data from some storage medium
  const err = reply(caches) // If the reply data doesn't pass business validation, an Error instance is returned, otherwise undefined
})
// Broadcast mode: This event is only published as a broadcast, the aggregation's business doesn't care if anyone is listening.
hotkeyAgg.events.needLoadCache.watch(({ data }) => {
  const map = data.hotkeyMap // Published event data has type inference and is read-only
  console.log(map)
})
```

## plugins

- You can also add custom plugins to aggregations using the PluginHelper provided by the corresponding module.

```typescript
import { type WatchHandle } from 'vue'
import type { Command } from 'monaco-tree-editor'
import { HotkeyPluginHelper, hotkeyToJsonString, jsonStringToHotkey } from 'monaco-tree-editor'

const HOTKEY_STORE_PLUGIN = HotkeyPluginHelper.defineSetupPlugin(() => {
  // Store active watch side effects, call them when destroying
  const handlesMap: Record<string, WatchHandle[]> = {}
  return {
    register(agg) {
      // I want to load shortcuts from localStorage when the aggregation initializes
      console.debug('Loading plugin')
      handlesMap[agg.id] = []
      handlesMap[agg.id].push(
        agg.api.events.needLoadCache.watchPublishRequest(({ reply }) => {
          const cache = localStorage.getItem('hotkeys')
          if (cache) {
            return reply(JSON.parse(cache).map((i: string) => jsonStringToHotkey(i)))
          }
          return reply([])
        })
      )
      // When user modifies shortcuts, I want this plugin to provide auto-save functionality
      handlesMap[agg.id].push(
        agg.api.events.onKeybindingChangedByUser.watchPublish(({ data }) => {
          console.log('hotkeyStore saving shortcuts')
          const json: string[] = []
          for (const hotkey in data.hotkeyMap) {
            json.push(hotkeyToJsonString(data.hotkeyMap[hotkey as Command]))
          }
          localStorage.setItem('hotkeys', JSON.stringify(json))
        })
      )
      // When current instance is destroyed, clean up side effects to avoid memory leaks
      handlesMap[agg.id].push(
        agg.api.events.destroyed.watchPublish(() => {
          for (const handle of handlesMap[agg.id]) {
            handle()
          }
          delete handlesMap[agg.id]
        })
      )
    },
  }
})
```
