import { defineConfig } from 'cypress'
import { loadEnv } from 'vite'

export default defineConfig({
  e2e: {
    baseUrl: `http://127.0.0.1:${loadEnv('test', process.cwd()).VITE_SERVER_PORT}/test`,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
