# 自定义菜单

```typescript
import { type ComputedRef, ref } from 'vue'
// ================ 自定义菜单 =================
/**
 * 自定义fileMenu和folderMenu将插入到树形结构的右键菜单中
 */
const fileMenu = ref([
  { label: 'Custom Selection 1', value: 'any type that not null' },
  { label: 'Custom Selection 2', value: 2 },
  { label: '自定义文件选项 3', value: { id: 3, decription: 'value可以是任意非空值' } },
])
const folderMenu = ref([{ label: 'backup', value: 'backupFolder' }])
/*
 * 点击左下角的设置图标后，将展示自定义菜单
 */
const settingsMenu = ref([
  {
    label: 'exit',
    handler: () => {
      alert('exit')
    },
  },
])
const handleContextMenuSelect = (path: string, item: { label: string | ComputedRef<string>; value: string }) => {
  console.warn('path: ' + path + '\nitem: ' + item)
}
```

```vue
<template>
  <MonacoTreeEditor
    :file-menu="fileMenu"
    :folder-menu="folderMenu"
    :settings-menu="settingsMenu"
    @contextmenu-select="handleContextMenuSelect"
  ></MonacoTreeEditor>
</template>
```
