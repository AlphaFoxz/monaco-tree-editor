import './assets/main.css'
import MonacoTreeEditor from './components/monaco-tree-editor/Index.vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.component('MonacoTreeEditor', MonacoTreeEditor)

app.mount('#app')
