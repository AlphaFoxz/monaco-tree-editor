import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '#domains': fileURLToPath(new URL('./lib/domains', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(loadEnv(mode, process.cwd()).VITE_SERVER_PORT) || 5173,
    },
    optimizeDeps: {
      include: [],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    // base: '/monaco-tree-editor/',
    build: {
      minify: 'esbuild',
      outDir: 'dist',
      target: 'esnext',
      // terserOptions: {
      //   module: true,
      //   mangle: false,
      // },
      cssCodeSplit: true,
      lib: {
        entry: fileURLToPath(new URL('./lib/index.ts', import.meta.url)),
        name: 'monaco-tree-editor',
        fileName: 'index',
        formats: ['es'],
      },
      rollupOptions: {
        external: ['vue', 'monaco-editor'],
        output: {
          globals: {
            vue: '__Vue',
            'monaco-editor': '__MonacoEditor',
          },
        },
      },
    },
  }
})
