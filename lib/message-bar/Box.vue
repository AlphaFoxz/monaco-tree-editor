<script setup lang="ts">
import './index.scss'
import IconLoading from '../icons/Loading.vue'
import IconClose from '../icons/Close'
import { computed } from 'vue'
import { type MessageType } from '../define'

const props = defineProps({
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
const shadow = computed<string>(() => {
  const type: MessageType = props.type as MessageType
  const style = '0 0 10px '
  switch (type) {
    case 'info':
      return style + 'black'
    case 'error':
      return style + 'darkred'
    case 'warn':
      return style + 'darkorange'
    case 'success':
      return style + 'darkgreen'
    default:
      const _t: never = type
      return _t
  }
})

defineEmits({
  close: (_id: string) => true,
})
</script>
<template>
  <div class="message-container-box" :title="textTip" :style="{ boxShadow: shadow }">
    <IconClose
      v-if="closeable"
      @click="$emit('close', id)"
      :style="{ display: 'block', float: 'right', width: '16px', height: '16px', cursor: 'pointer' }"
    />
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
