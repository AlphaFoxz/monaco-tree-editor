import './assets/main.css'
import MonacoTreeEditor from './components/monaco-tree-editor'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(MonacoTreeEditor)

app.mount('#app')
