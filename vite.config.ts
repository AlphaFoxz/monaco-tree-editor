import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./lib', import.meta.url)),
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  base: '/monaco-tree-editor/',
  build: {
    minify: 'esbuild',
    outDir: 'dist',
    target: 'esnext',
    cssCodeSplit: true,
    lib: {
      entry: path.resolve(__dirname, './lib/index.ts'),
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
})
