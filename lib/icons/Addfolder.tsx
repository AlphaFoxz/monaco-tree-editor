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
              d="M7 3H4V0H3v3H0v1h3v3h1V4h3V3zM5.5 7H5V6h.3l.8-.9.4-.1H14V4H8V3h6.5l.5.5v10l-.5.5h-13l-.5-.5V5h1v8h12V6H6.7l-.8.9-.4.1z"
              fill="currentColor"
            />
          </svg>
        </label>
      )
    }
  },
})
