<script setup lang="ts">
import './index.scss'
import { type LeftSiderBarItem, type BuiltInPageType } from '#domain/define'
import { type ContextMenuItem } from '#components/context-menu/define'
import ContextMenu from '#components/context-menu/Index.vue'
import IconsSetting from '#icons/Setting.vue'
import IconsFile from '#icons/File.vue'
import ItemTemp from './ItemTemp.vue'
import { useGlobalSettings } from '#domain/global-settings-agg'
import { useI18n } from '#domain/i18n-agg'
import { useMonaco } from '#domain/monaco-agg'

const props = defineProps({
  monacoId: {
    type: String,
    required: true,
  },
})
const emit = defineEmits({
  triggerActive: (_: LeftSiderBarItem) => true,
})

const { $t } = useI18n().commands
const globalSettingsAgg = useGlobalSettings()
function handleClick(item: LeftSiderBarItem) {
  const t = globalSettingsAgg.states.opendLeftSiderBar.value
  globalSettingsAgg.commands.switchCurrentLeftSiderBar(item)
  if (t !== item) {
    emit('triggerActive', item)
  }
}

//========================= Manage =========================
const monacoAgg = useMonaco(undefined, props.monacoId)
const manageBtnMenu: Array<ContextMenuItem<BuiltInPageType | undefined>> = [
  { label: $t('menu.settings'), value: '<Settings>' },
  { label: $t('menu.keyboardShortcuts'), value: '<KeyboardShortcuts>' },
]
function handleSelectManage(selected: { label: string; value?: BuiltInPageType; onSelect?: Function }) {
  if (selected.value) {
    monacoAgg.commands._openOrFocusPath(selected.value!)
  }
}
</script>

<template>
  <div class="left-sider-bar">
    <ItemTemp
      @click="handleClick('Explorer')"
      :current-active="globalSettingsAgg.states.opendLeftSiderBar.value || ''"
      name="Explorer"
      :title="$t('menu.folders').value"
    >
      <IconsFile />
    </ItemTemp>
    <ContextMenu @select="i => handleSelectManage(i as any)" position="RB" :trigger="['Click']" :menu="manageBtnMenu">
      <ItemTemp
        :current-active="globalSettingsAgg.states.opendLeftSiderBar.value || ''"
        style="position: absolute; bottom: 0"
        name="Manage"
        :title="$t('menu.manage').value"
      >
        <IconsSetting />
      </ItemTemp>
    </ContextMenu>
  </div>
</template>
