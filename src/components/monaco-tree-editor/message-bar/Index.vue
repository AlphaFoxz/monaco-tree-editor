<script setup lang="tsx">
import './index.less'
import BoxTemp from './Box.vue'
import { type MessageOptions } from '../define'
import { useMessage } from '../message-store'
import { watch, ref } from 'vue'

const messageStore = useMessage()
const messages = ref<MessageOptions[]>(messageStore.messages)
watch(
  () => messageStore.messages,
  (n) => {
    messages.value = n
  }
)
</script>

<template>
  <Teleport to="body">
    <div>
      <div class="message-container">
        <BoxTemp
          v-for="item in messages"
          @close="messageStore.close"
          @mousemove="messageStore.keepAlive(item.id!)"
          :id="item.id!"
          :closeable="item.closeable"
          :loading="item.loading"
          :text-tip="item.textTip"
          :type="item.type"
        >
          {{ item.content }}
        </BoxTemp>
      </div>
    </div>
  </Teleport>
</template>
