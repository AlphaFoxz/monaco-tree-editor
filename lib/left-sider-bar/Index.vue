<script setup lang="ts">
import './index.scss'
import { type LeftSiderBarItem } from './define'
import IconsSetting from '../icons/Setting.vue'
import FileOutlined from '@ant-design/icons-vue/FileOutlined'
import ItemTemp from './ItemTemp.vue'
import { useGlobalVar } from '../global-var-store'
import { useI18n } from '../locale'

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
</script>

<template>
  <div class="left-sider-bar">
    <ItemTemp
      @click="handleClick('Explorer')"
      :current-active="globalVarStore.getCurrentLeftSiderBar().value || ''"
      name="Explorer"
      :title="$t('button.folders').value"
    >
      <FileOutlined
    /></ItemTemp>
    <ItemTemp
      @click="$emit('triggerActive', 'Setting')"
      :current-active="globalVarStore.getCurrentLeftSiderBar().value || ''"
      style="position: absolute; bottom: 0"
      name="Setting"
      :title="$t('button.manage').value"
    >
      <IconsSetting />
    </ItemTemp>
  </div>
</template>
