<script setup lang="ts">
import IconsSetting from '../icons/Setting'
import FileOutlined from '@ant-design/icons-vue/FileOutlined'
</script>

<template>
  <div class="left-sider-bar">
    <label><FileOutlined /></label>
    <label style="position: absolute; bottom: 0"><IconsSetting /></label>
  </div>
</template>

<style scoped lang="scss">
.left-sider-bar {
  position: relative;
  background-color: var(--monaco-bg-1);
  width: 50px;
  height: 100%;

  label {
    cursor: pointer;
    height: 50px;
    width: 100%;

    svg {
      height: 35px;
      width: 35px;
    }
  }
}
</style>
