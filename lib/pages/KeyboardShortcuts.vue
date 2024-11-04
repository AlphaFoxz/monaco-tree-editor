<script setup lang="ts">
import './index.scss'
import { useI18n } from '../domain/i18n-agg'
import { type When, type Command, IHotkey, Hotkey, useHotkey } from '../domain/hotkey-agg'
import Modal from '../components/modal/Index.vue'
import { ref } from 'vue'

const props = defineProps({
  monacoId: {
    type: String,
    required: true,
  },
})

const { $t } = useI18n().actions
const hotkeyStore = useHotkey(props.monacoId)
const componentRef = ref<HTMLDivElement>()
const search = ref('')
function displayHotkey(hotkey: IHotkey): string {
  if (!hotkey.key) {
    return '-'
  }
  let str = []
  if (hotkey.ctrlKey) {
    str.push('Ctrl')
  }
  if (hotkey.altKey) {
    str.push('Alt')
  }
  if (hotkey.shiftKey) {
    str.push('Shift')
  }
  str.push(hotkey.key)
  return str.join(' + ')
}
function editHotkey(when: When, command: Command) {
  const hotkey = new Hotkey({
    when,
    key: 'A',
    command,
  })
  hotkeyStore.actions.addKeybinding(hotkey)
}
</script>

<template>
  <div class="monaco-tree-editor-pages" ref="componentRef">
    <input class="search" v-model="search" placeholder="Type to search in keybindings" />
    <div class="monaco-tree-editor-pages-item table">
      <div class="header">
        <div>{{ $t('keybindings.options.header.command').value }}</div>
        <div>{{ $t('keybindings.options.header.keybinding').value }}</div>
      </div>
      <div class="content" v-for="(hotkey, i) in hotkeyStore.states.hotkeyMap" :key="i">
        <div
          v-show="!search || hotkey.command.toLowerCase().includes(search.toLowerCase().trim())"
          class="content-item"
        >
          <label>{{ hotkey.command }}</label>
          <label>{{ displayHotkey(hotkey) }}</label>
        </div>
      </div>
    </div>
    <Modal :monaco-id="monacoId" :visible="false" :target="componentRef"><div>123123123</div></Modal>
  </div>
</template>

<style scoped lang="scss">
.search {
  width: 100%;
}
.table {
  margin: 10px 0;
  padding: 0;

  .header {
    background-color: var(--monaco-bg-base-2);
    display: grid;
    grid-template-columns: 1fr 1fr;
    & > * {
      font-weight: bold;
    }
  }
  .content {
    line-height: 24px;
    user-select: none;

    &-item {
      &:hover {
        background-color: var(--monaco-bg-base-3);
      }
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
}
</style>
