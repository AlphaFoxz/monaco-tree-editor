<script setup lang="ts">
import './index.scss'
import { type LeftSiderBarItem } from './define'
import { type BuiltInPageType } from '../define'
import { type ContextMenuItem } from '../components/context-menu/define'
import ContextMenu from '../components/context-menu/Index.vue'
import IconsSetting from '../icons/Setting.vue'
import IconsFile from '../icons/File.vue'
import ItemTemp from './ItemTemp.vue'
import { useGlobalSettings } from '../stores/global-settings-store'
import { useI18n } from '../stores/i18n-store'
import { useMonaco } from '../stores/monaco-store'

const emit = defineEmits({
  triggerActive: (_: LeftSiderBarItem) => true,
})

const { $t } = useI18n().action
const globalSettingsStore = useGlobalSettings()
function handleClick(item: LeftSiderBarItem) {
  const t = globalSettingsStore.state.opendLeftSiderBar.value
  globalSettingsStore.action.switchCurrentLeftSiderBar(item)
  if (t !== item) {
    emit('triggerActive', item)
  }
}

//========================= Manage =========================
const monacoStore = useMonaco()
const manageBtnMenu: Array<ContextMenuItem<BuiltInPageType | undefined>> = [
  { label: $t('menu.settings'), value: '<Settings>' },
  // { label: $t('menu.keyboardShortcuts'), value: '<KeyboardShortcuts>' },
]
function handleSelectManage(selected: { label: string; value?: BuiltInPageType; onSelect?: Function }) {
  if (selected.value) {
    monacoStore._action.openOrFocusPath(selected.value!)
  }
}
</script>

<template>
  <div class="left-sider-bar">
    <ItemTemp
      @click="handleClick('Explorer')"
      :current-active="globalSettingsStore.state.opendLeftSiderBar.value || ''"
      name="Explorer"
      :title="$t('menu.folders').value"
    >
      <IconsFile />
    </ItemTemp>
    <ContextMenu @select="i => handleSelectManage(i as any)" position="RB" :trigger="['Click']" :menu="manageBtnMenu">
      <ItemTemp
        :current-active="globalSettingsStore.state.opendLeftSiderBar.value || ''"
        style="position: absolute; bottom: 0"
        name="Manage"
        :title="$t('menu.manage').value"
      >
        <IconsSetting />
      </ItemTemp>
    </ContextMenu>
  </div>
</template>
