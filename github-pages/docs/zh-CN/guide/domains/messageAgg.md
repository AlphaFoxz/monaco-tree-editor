# 消息推送

- 全局浮动的消息弹窗功能

## 使用方法

```typescript
import { useMessage } from 'monaco-tree-editor'
import { onMounted } from 'vue'

const messageAgg = useMessage()
onMounted(() => {
  const id = messageAgg.commands.info({
    content: '测试中..',
    loading: true,
  })
  setTimeout(() => {
    messageAgg.commands.close(id)
    messageAgg.commands.success({
      content: 'Hello Editor',
      closeable: true,
      timeoutMs: 15000,
      textTip: '测试成功!',
    })
  }, 5000)
})
```
