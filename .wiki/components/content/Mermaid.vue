<script setup>
const slot = useSlots()
const el = ref(null)
const rendered = ref(false)
const mermaidStore = useMermaid()

async function render() {
  if (!el.value) {
    return
  }
  if (el.value.querySelector('svg')) {
    // Already rendered
    return
  }

  // Iterate children to remove comments
  for (const child of el.value.childNodes) {
    if (child.nodeType === Node.COMMENT_NODE) {
      el.value.removeChild(child)
    }
  }

  el.value.classList.add('mermaid')
  rendered.value = true
  mermaidStore.action.run(el.value)
}

onMounted(() => {
  render()
})
</script>

<template>
  <pre ref="el" :style="{ display: rendered ? 'block' : 'none' }">
    <ContentSlot :use="$slots.default" unwrap="p"/> 
  </pre>
</template>

<style lang="scss">
.dark-mode pre.mermaid {
  .cluster-label span {
    color: #fff !important;
  }
  .cluster rect {
    fill: #4e4e4e !important;
  }
  .flowchart-link {
    stroke: #fff !important;
  }
  marker {
    color: #fff !important;
  }
  path {
    stroke: #fff;
  }
}
</style>
