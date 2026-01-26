# Message Aggregation

Global floating message popup functionality.

## Usage

```typescript
import { useMessage } from 'monaco-tree-editor'
import { onMounted } from 'vue'

const messageAgg = useMessage()
onMounted(() => {
  const id = messageAgg.commands.info({
    content: 'Testing...',
    loading: true,
  })
  setTimeout(() => {
    messageAgg.commands.close(id)
    messageAgg.commands.success({
      content: 'Hello Editor',
      closeable: true,
      timeoutMs: 15000,
      textTip: 'Test successful!',
    })
  }, 5000)
})
```
