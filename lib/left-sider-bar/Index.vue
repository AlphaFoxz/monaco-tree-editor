<script setup lang="ts">
import './index.scss'
import type { LeftSiderBarItem } from './define'
import IconsSetting from '../icons/Setting'
import FileOutlined from '@ant-design/icons-vue/FileOutlined'
import ItemTemp from './ItemTemp.vue'
import { useGlobalVar } from '../global-var-store'

const emit = defineEmits({
  triggerActive: (item: LeftSiderBarItem) => true,
})

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
      :currentActive="globalVarStore.getCurrentLeftSiderBar().value"
      name="Explorer"
    >
      <FileOutlined
    /></ItemTemp>
    <ItemTemp
      @click="$emit('triggerActive', 'Setting')"
      :currentActive="globalVarStore.getCurrentLeftSiderBar().value"
      style="position: absolute; bottom: 0"
    >
      <IconsSetting />
    </ItemTemp>
  </div>
</template>
