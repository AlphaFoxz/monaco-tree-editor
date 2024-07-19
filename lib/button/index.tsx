import { defineComponent } from 'vue'
import './index.scss'

export default defineComponent({
  props: {
    type: {
      type: String,
      default: '',
    },
  },
  emits: {
    click: (_e: MouseEvent) => true,
  },
  setup(props, { emit, slots }) {
    return () => {
      return (
        <div
          onClick={(e) => emit('click', e)}
          class={`monaco-tree-editor-button monaco-tree-editor-button-${props.type}`}
        >
          {slots.default?.()}
        </div>
      )
    }
  },
})
