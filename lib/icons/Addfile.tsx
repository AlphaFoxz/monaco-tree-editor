import { defineComponent } from 'vue'

export default defineComponent({
  emits: {
    click: (_e: MouseEvent) => true,
  },
  setup(_props, { emit }) {
    return () => {
      return (
        <label style={{ cursor: 'pointer' }}>
          <svg
            onClick={(e) => emit('click', e)}
            width="1em"
            height="1em"
            viewBox="0 0 16 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M4 7H3V4H0V3h3V0h1v3h3v1H4v3zm6.5-5.9l3.4 3.5.1.4v8.5l-.5.5h-10l-.5-.5V8h1v5h9V6H9V2H5V1h5.2l.3.1zM10 2v3h2.9L10 2z"
              fill="currentColor"
            ></path>
          </svg>
        </label>
      )
    }
  },
})
