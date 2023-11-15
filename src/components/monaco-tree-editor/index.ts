import Editor from './Index.vue'

export { Editor }

const MonacoTreeEditor = {
  install(Vue: any) {
    Vue.component('MonacoTreeEditor', Editor)
  },
}

export default MonacoTreeEditor
