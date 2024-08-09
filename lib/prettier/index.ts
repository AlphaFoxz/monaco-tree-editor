import { h } from 'vue'
import PrettierIcon from '../icons/Prettier.vue'
import { useMonaco } from '../stores/monaco-store'
import './index.scss'

const monacoStore = useMonaco()
const Prettier = (props: any) => {
  async function loadPrettier() {
    function provideDocumentFormattingEdits(_model: any) {
      return null
      // const p = window.require('prettier')
      // if (!p.prettier) return
      // const text = p.prettier.format(model.getValue(), {
      //   filepath: model.uri.path,
      //   plugins: p.prettierPlugins,
      //   singleQuote: true,
      //   tabWidth: 4,
      // })

      // return [
      //   {
      //     range: model.getFullModelRange(),
      //     text,
      //   },
      // ]
    }
    monacoStore.state.monaco.languages.registerDocumentFormattingEditProvider('javascript', {
      provideDocumentFormattingEdits,
    })
    monacoStore.state.monaco.languages.registerDocumentFormattingEditProvider('typescript', {
      provideDocumentFormattingEdits,
    })
    setTimeout(() => {
      monacoStore.state.monaco.languages.registerDocumentFormattingEditProvider('html', {
        provideDocumentFormattingEdits,
      })
    }, 3000)
    monacoStore.state.monaco.languages.registerDocumentFormattingEditProvider('css', {
      provideDocumentFormattingEdits,
    })
    monacoStore.state.monaco.languages.registerDocumentFormattingEditProvider('less', {
      provideDocumentFormattingEdits,
    })
  }
  loadPrettier()

  return h('div', { ...props }, [h(PrettierIcon)])
}

export default Prettier
