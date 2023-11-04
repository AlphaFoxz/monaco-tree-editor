import { defineComponent } from 'vue'

export default defineComponent({
  emits: {
    click: (_event: MouseEvent) => true,
  },
  setup(_props, { emit }) {
    return () => {
      return (
        <svg
          onClick={(e) => emit('click', e)}
          width="1em"
          height="1em"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z"
            fill="currentColor"
          ></path>
        </svg>
      )
    }
  },
})
