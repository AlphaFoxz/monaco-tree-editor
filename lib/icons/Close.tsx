import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    return () => {
      return (
        <svg
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            d="M3,3 L21,21 M3,21 L21,3"
          />
        </svg>
      )
    }
  },
})
