import { createSharedSingletonAgg } from 'vue-fn/shared-domain'

const agg = createSharedSingletonAgg('agg', (context) => {
  const name = context.sharedRef('name', 'Hello World!')
  return {
    states: { name },
    actions: {
      setName(n: string) {
        name.value = n
      },
    },
  }
})

export function useAgg() {
  return agg.api
}
