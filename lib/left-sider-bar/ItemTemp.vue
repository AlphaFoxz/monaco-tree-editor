<script setup lang="ts">
defineProps({
  currentActive: {
    type: String,
    default: '',
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
