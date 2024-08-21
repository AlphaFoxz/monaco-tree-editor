<script setup lang="ts">
import Image from 'primevue/image'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
})
const config = useRuntimeConfig()
</script>

<template>
  <Image :src="(config.public.NUXT_APP_BASE_URL || '') + src" preview></Image>
</template>
