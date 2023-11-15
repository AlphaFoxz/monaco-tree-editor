import { ref, watch, defineComponent } from 'vue'
import './index.less'
import defaultFileUrl from '/icons/default_file.svg?url'
import jsUrl from '/icons/file_type_js.svg?url'
import tsUrl from '/icons/file_type_typescript.svg?url'
import tsxUrl from '/icons/file_type_reactts.svg?url'
import jsxUrl from '/icons/file_type_reactjs.svg?url'

export default defineComponent({
  props: {
    type: {
      type: String,
      default: 'default_file',
    },
  },
  setup(props) {
    const fileTypeMap = (fileType: string): string => {
      const type = fileType.split('_').slice(-1)[0]
      const config: {
        [index: string]: string
      } = {
        ts: tsUrl,
        js: jsUrl,
        tsx: tsxUrl,
        jsx: jsxUrl,
      }
      return config[type] ? config[type] : fileType
    }
    const imgSrc = ref(defaultFileUrl)
    const handleError = () => {
      imgSrc.value = defaultFileUrl
    }
    watch(
      () => props.type,
      (v) => {
        imgSrc.value = fileTypeMap(v)
      }
    )
    return () => {
      return <img src={imgSrc.value} onError={handleError} class="music-monaco-icons" />
    }
  },
})
