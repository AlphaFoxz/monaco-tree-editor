import { h } from 'vue'
import PrettierIcon from '../icons/Prettier'
import { useMonaco } from '../monaco-store'
import './index.less'

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
    monacoStore.monaco.languages.registerDocumentFormattingEditProvider('javascript', {
      provideDocumentFormattingEdits,
    })
    monacoStore.monaco.languages.registerDocumentFormattingEditProvider('typescript', {
      provideDocumentFormattingEdits,
    })
    setTimeout(() => {
      monacoStore.monaco.languages.registerDocumentFormattingEditProvider('html', {
        provideDocumentFormattingEdits,
      })
    }, 3000)
    monacoStore.monaco.languages.registerDocumentFormattingEditProvider('css', {
      provideDocumentFormattingEdits,
    })
    monacoStore.monaco.languages.registerDocumentFormattingEditProvider('less', {
      provideDocumentFormattingEdits,
    })
  }
  loadPrettier()

  return h('div', { ...props }, [h(PrettierIcon)])
}

export default Prettier
