# Monaco Aggregation

Extends monaco-editor functionality.

## Usage

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useMonaco, Editor as MonacoTreeEditor } from 'monaco-tree-editor'
import * as monaco from 'monaco-editor'

const monacoAgg = useMonaco(monaco)
watch(monacoAgg.states.projectName, (n, o) => {
  console.log(`Project name changed: ${o} -> ${n}`)
})
</script>

<template>
  <MonacoTreeEditor />
</template>
```
