import './assets/main.css'
import MonacoTreeEditor from './components/monaco-tree-editor'

import { createApp } from 'vue'

import App from './App.vue'

const app = createApp(App)

app.use(MonacoTreeEditor)

app.mount('#app')
