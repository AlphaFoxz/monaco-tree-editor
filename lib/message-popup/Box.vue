<script setup lang="ts">
import './index.scss'
import IconLoading from '../icons/Loading.vue'
import IconClose from '../icons/Close.vue'
import { type MessageType } from '../domain/define'

defineProps({
  id: {
    type: String,
    required: true,
  },
  closeable: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  textTip: {
    type: String,
    default: undefined,
  },
  type: {
    type: String,
    default: 'info',
    validator: (v: string) => {
      return !!(v as MessageType)
    },
  },
})

defineEmits({
  close: (_id: string) => true,
})
</script>
<template>
  <div class="message-container-box" :title="textTip">
    <IconClose v-if="closeable" @click="$emit('close', id)" class="message-container-box-close" />
    <label>
      <slot></slot
      ><IconLoading
        v-if="loading"
        :width="16"
        :height="16"
        :style="{ display: 'inline-block', marginLeft: '8px', color: 'rgb(106,227,251)' }"
    /></label>
  </div>
</template>
