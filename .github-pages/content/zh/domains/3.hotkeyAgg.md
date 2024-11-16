# ~~快捷键~~

- 不推荐，这个 api 马上会被弃用
- 在未来的版本中，会有另一个新的交互式快捷键设置功能被内置

```typescript
import { useHotkey } from 'monaco-tree-editor'

const hotkeyStore = useHotkey()
// 焦点在根组件的时候触发
hotkeyStore.actions.listen('root', (event: KeyboardEvent) => {})
// 焦点在编辑器内的时候触发
hotkeyStore.actions.listen('editor', (event: KeyboardEvent) => {
  if (event.ctrlKey && !event.shiftKey && !event.altKey && (event.key === 's' || event.key === 'S')) {
    // do something...
  }
})
```
