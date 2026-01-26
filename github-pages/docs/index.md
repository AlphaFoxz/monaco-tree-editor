<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Detect browser language and redirect
  const browserLang = navigator.language || navigator.languages?.[0] || 'en-US'

  // Check if browser language is Chinese
  if (browserLang.startsWith('zh')) {
    // Redirect to Chinese version
    window.location.href = '/monaco-tree-editor/zh-CN/'
  } else {
    // Default to English version
    window.location.href = '/monaco-tree-editor/en-US/'
  }
})
</script>

<template>
  <div class="redirecting">
    <p>Redirecting to your language version...</p>
    <p>正在跳转到适合您的语言版本...</p>
  </div>
</template>

<style scoped>
.redirecting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

p {
  font-size: 1.2rem;
  color: var(--vp-c-text-1);
}
</style>
