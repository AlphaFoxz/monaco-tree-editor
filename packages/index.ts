import Editor from './monaco-tree-editor/Index.vue'

let plugin: { install?: Function } = {}
plugin.install = function (vue) {
  vue.component('monaco-tree-editor', Editor)
}
export default plugin
