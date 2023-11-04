import { ref, watch, defineComponent } from 'vue'
import './index.less'

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
        ts: 'typescript',
        js: 'js',
        tsx: 'reactts',
        jsx: 'reactjs',
      }
      return config[type] ? `file_type_${config[type]}` : fileType
    }
    const getSvgPath = (fileName: string) => {
      return new URL(`/icons/${fileName}.svg`, import.meta.url).href
    }
    const imgSrc = ref('/icons/default_file.svg')
    const handleError = () => {
      imgSrc.value = getSvgPath('default_file')
    }
    watch(
      () => props.type,
      (v) => {
        imgSrc.value = getSvgPath(fileTypeMap(v))
      }
    )
    return () => {
      return <img src={imgSrc.value} onError={handleError} class="music-monaco-icons" />
    }
  },
})
