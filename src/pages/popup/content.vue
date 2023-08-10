<template>
  <n-layout content-style="padding:5px">
    <n-space vertical align="center" style="width: 100px;height: 100px;">
      <n-switch v-model:value="enable" @update-value="switchChange">
        <template #checked>
          启用
        </template>
        <template #unchecked>
          禁用
        </template>
      </n-switch>
    </n-space>
  </n-layout>
</template>
<script setup lang="ts">
import { NSwitch, NLayout, NSpace, useMessage } from 'naive-ui'
import { ref } from 'vue'
const { storage } = chrome
const enable = ref(true)
const message = useMessage()
storage.local.get('enable').then(e => {
  console.log(e);

  if (e.enable != undefined) {
    enable.value = e.enable
  }
})

function switchChange(v: boolean) {
  storage.local.set({
    enable: v
  }).then(() => {
    message.success(`已${v ? '开启' : '关闭'}`)
  })
}
</script>
<style lang="less"></style>