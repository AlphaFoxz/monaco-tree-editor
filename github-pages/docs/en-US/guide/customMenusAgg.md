# Custom Menus

```typescript
import { type ComputedRef, ref } from 'vue'
// ================ Custom Menus =================
/**
 * Custom fileMenu and folderMenu will be inserted into the tree structure's context menu
 */
const fileMenu = ref([
  { label: 'Custom Selection 1', value: 'any type that not null' },
  { label: 'Custom Selection 2', value: 2 },
  { label: 'Custom File Option 3', value: { id: 3, description: 'value can be any non-null value' } },
])
const folderMenu = ref([{ label: 'backup', value: 'backupFolder' }])
/*
 * Click the settings icon in the bottom left to show custom menus
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
