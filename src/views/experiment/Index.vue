<script setup lang="ts">
import { useAgg } from './agg'

const agg = useAgg()
function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  agg.actions.setName(value)
  console.log(value)
}
</script>

<template>
  <div style="width: 100%; height: 50px">
    <input :value="agg.states.name.value" @input="handleInput" />
  </div>
</template>

<style scoped>
input {
  width: 100%;
  font-size: 2rem;
}
</style>
