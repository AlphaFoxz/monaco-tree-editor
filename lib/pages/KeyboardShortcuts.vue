<script setup lang="ts">
import './index.scss'
import { useI18n } from '#domain/i18n-agg'
import { type When, type Command, type IHotkey, useHotkey, IDEA_KEYBINDINGS } from '#domain/hotkey-agg'
import { useKeyboardShortcuts } from '#domain/keyboard-shortcuts-agg'
import Modal from '#components/modal/Index.vue'
import { nextTick, ref } from 'vue'

const props = defineProps({
  monacoId: {
    type: String,
    required: true,
  },
})

const { t } = useI18n().commands
const hotkeyStore = useHotkey(props.monacoId)
const componentRef = ref<HTMLDivElement>()
const keyboardShortcutsRef = ref<HTMLInputElement>()
const search = ref('')
const modalVisible = ref(false)
const keyboardShortcutsStore = useKeyboardShortcuts()
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
function displayModalHotkey(): string {
  return keyboardShortcutsStore.states.display.value
}
function resetHotkeys() {
  hotkeyStore.commands.addKeybindings(IDEA_KEYBINDINGS)
}
function handleOpenModal(when: When, command: Command) {
  keyboardShortcutsStore.commands.reset(when, command)
  modalVisible.value = true
  nextTick(() => keyboardShortcutsRef.value!.focus())
}
function handleKeyboardShortcutsKeydown(e: Event) {
  e.preventDefault()
  console.debug('input')
  const event = e as KeyboardEvent
  if (!event.ctrlKey && !event.altKey && !event.shiftKey && event.key === 'Enter') {
    hotkeyStore.commands.addKeybindingByUser(keyboardShortcutsStore.commands.getHotkey())
    modalVisible.value = false
  } else {
    keyboardShortcutsStore.commands.onKeyboardEvent(event)
  }
}
</script>

<template>
  <div class="monaco-tree-editor-pages" ref="componentRef">
    <div class="tool-box">
      <input v-model="search" :placeholder="t('keybindings.toolBox.search')" />
      <button @click="resetHotkeys">{{ t('keybindings.toolBox.reset') }}</button>
    </div>
    <div class="monaco-tree-editor-pages-item table">
      <div class="header">
        <div>{{ t('keybindings.options.header.command') }}</div>
        <div>{{ t('keybindings.options.header.keybinding') }}</div>
      </div>
      <div class="content" v-for="(hotkey, i) in hotkeyStore.states.hotkeyMap" :key="i">
        <div
          v-show="!search || hotkey.command.toLowerCase().includes(search.toLowerCase().trim())"
          class="content-item"
          @dblclick="handleOpenModal(hotkey.when, hotkey.command)"
        >
          <label>{{ hotkey.command }}</label>
          <label>{{ displayHotkey(hotkey) }}</label>
        </div>
      </div>
    </div>
    <Modal :monaco-id="monacoId" v-model:visible="modalVisible" :target="componentRef">
      <div class="modal">
        <label>Press desired key combination and then press ENTER</label>
        <input ref="keyboardShortcutsRef" :value="displayModalHotkey()" @keydown="handleKeyboardShortcutsKeydown" />
      </div>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.tool-box {
  display: grid;
  grid-template-columns: 1fr auto;
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
.modal {
  display: flex;
  flex-direction: column;
  background-color: var(--monaco-bg-base-1);
  width: 350px;
  height: 110px;
  label {
    text-align: center;
    font-weight: lighter;
    font-size: 0.8rem;
  }
  input {
    width: 330px;
    margin: 10px;
    height: 24px;
    font-size: 14px;
    text-align: center;
    background-color: var(--monaco-bg-base-2);
  }
}
</style>
