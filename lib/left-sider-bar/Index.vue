<script setup lang="ts">
import './index.scss'
import { type LeftSiderBarItem } from './define'
import ContextMenu from '../components/context-menu/Index.vue'
import { type ContextMenuItem } from '../components/context-menu/define'
import IconsSetting from '../icons/Setting.vue'
import FileOutlined from '@ant-design/icons-vue/FileOutlined'
import ItemTemp from './ItemTemp.vue'
import { useGlobalVar } from '../global-var-store'
import { useI18n } from '../locale'
import { useMonaco } from '../monaco-store'

const emit = defineEmits({
  triggerActive: (item: LeftSiderBarItem) => true,
})

const { $t } = useI18n()
const globalVarStore = useGlobalVar()
function handleClick(item: LeftSiderBarItem) {
  const t = globalVarStore.getCurrentLeftSiderBar().value
  globalVarStore.setCurrentLeftSiderBar(item)
  if (t !== item) {
    emit('triggerActive', item)
  }
}

//========================= Manage =========================
const monacoStore = useMonaco()
const manageBtnMenu: Array<ContextMenuItem<any>> = [{ label: $t('menu.settings') }]
function handleSelectManage() {
  monacoStore.openOrFocusPath('<Settings>')
}
</script>

<template>
  <div class="left-sider-bar">
    <ItemTemp
      @click="handleClick('Explorer')"
      :current-active="globalVarStore.getCurrentLeftSiderBar().value || ''"
      name="Explorer"
      :title="$t('menu.folders').value"
    >
      <FileOutlined
    /></ItemTemp>
    <ContextMenu @select="handleSelectManage" position="RB" :trigger="['Click']" :menu="manageBtnMenu">
      <ItemTemp
        :current-active="globalVarStore.getCurrentLeftSiderBar().value || ''"
        style="position: absolute; bottom: 0"
        name="Manage"
        :title="$t('menu.manage').value"
      >
        <IconsSetting />
      </ItemTemp>
    </ContextMenu>
  </div>
</template>
