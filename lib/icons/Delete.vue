<script setup lang="ts">
defineEmits({
  click: (_event: MouseEvent) => true,
})
</script>
<template>
  <label :style="{ cursor: 'pointer' }">
    <svg
      @click="(e) => $emit('click', e)"
      width="1em"
      height="1em"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 011-1h3a1 1 0 011 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
        fill="currentColor"
      ></path>
    </svg>
  </label>
</template>
