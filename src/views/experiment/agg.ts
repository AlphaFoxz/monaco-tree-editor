import { createSharedSingletonAgg } from 'vue-fn/shared-domain'

const agg = createSharedSingletonAgg('agg', (context) => {
  const sharedRefs = context.sharedRefs({ name: 'Hello World!' })
  return {
    states: { name: sharedRefs.name },
    actions: {
      setName(n: string) {
        sharedRefs.name.value = n
      },
    },
  }
})

export function useAgg() {
  return agg.api
}
