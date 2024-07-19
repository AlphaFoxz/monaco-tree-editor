<script setup lang="ts">
defineProps({
  currentActive: {
    type: String,
  },
  name: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div :class="`left-sider-bar-item ${currentActive === name ? 'active' : ''}`">
    <slot></slot>
  </div>
</template>
