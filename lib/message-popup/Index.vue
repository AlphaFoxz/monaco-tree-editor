<script setup lang="tsx">
import './index.scss'
import BoxTemp from './Box.vue'
import { useMessage } from '../domain/message-agg'
import { ref, onMounted } from 'vue'

const messageStore = useMessage()
const messages = messageStore.states.messages
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
          @close="messageStore.actions.close"
          @mousemove="messageStore.actions._keepAlive(item.id!)"
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
