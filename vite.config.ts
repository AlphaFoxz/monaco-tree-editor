/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./lib', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: [],
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    // base: '/monaco-tree-editor/',
    build: {
      minify: 'esbuild',
      outDir: 'dist',
      target: 'esnext',
      cssCodeSplit: true,
      lib: {
        entry: fileURLToPath(new URL('./lib/index.ts', import.meta.url)),
        name: 'monaco-tree-editor',
        fileName: 'index',
        formats: ['es', 'umd'],
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }
})
