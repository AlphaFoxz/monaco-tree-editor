import type { Mermaid } from 'mermaid'

const running = ref(true)
const queue = reactive<HTMLElement[]>([])
let mermaid: Mermaid
import('mermaid').then((module) => {
  mermaid = module.default
  running.value = false
})
watch([running, queue], (v) => {
  if (v[0] || v[1].length === 0) {
    return
  }
  const el: HTMLElement = v[1].shift()!
  if (running.value) {
    return
  }
  running.value = true
  mermaid.run({ nodes: [el] }).then(() => {
    running.value = false
  })
})

function run(el: HTMLElement) {
  queue.push(el)
}

export default function useMermaid() {
  return {
    action: { run },
  }
}
