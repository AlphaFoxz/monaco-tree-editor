<script setup lang="tsx">
import './index.scss'
import BoxTemp from './Box.vue'
import { useMessage } from '../stores/message-store'
import { ref, onMounted } from 'vue'

const messageStore = useMessage()
const messages = messageStore.state.messages
const to = ref('body')
onMounted(() => {
  to.value = '#monaco-tree-editor-root'
})
</script>

<template>
  <Teleport :to="to">
    <div>
      <div class="message-container">
        <BoxTemp
          v-for="item in messages"
          @close="messageStore.action.close"
          @mousemove="messageStore._action.keepAlive(item.id!)"
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
