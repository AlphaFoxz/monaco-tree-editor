# ~~Hotkeys~~

Not recommended, this API will be deprecated soon.
In future versions, a new interactive shortcut settings feature will be built-in.

```typescript
import { useHotkey } from 'monaco-tree-editor'

const hotkeyStore = useHotkey()
// Triggered when focus is on the root component
hotkeyStore.actions.listen('root', (event: KeyboardEvent) => {})
// Triggered when focus is inside the editor
hotkeyStore.actions.listen('editor', (event: KeyboardEvent) => {
  if (event.ctrlKey && !event.shiftKey && !event.altKey && (event.key === 's' || event.key === 'S')) {
    // do something...
  }
})
```
