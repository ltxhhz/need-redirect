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
import type { Profile } from '../option/content.vue';
const { storage, declarativeNetRequest } = chrome
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
    enable: enable.value
  })
  if (v) {
    new Promise<void>((resolve) => {
      storage.local.get(['profiles'])
        .then(e => {
          const profiles: Profile[] = e.profiles
          Promise.allSettled(profiles.map(e => chrome.declarativeNetRequest.updateDynamicRules({
            addRules: e.rules
          }))).then((e) => {
            let i = 0
            e.forEach(e => {
              if (e.status == 'rejected') {
                console.error(e)
                i++
              }
            })
            i && message.error('错误')
            resolve()
          })
        })
    }).then(() => {
      message.info('已开启')
    })
  } else {
    declarativeNetRequest.getDynamicRules().then(e => {
      declarativeNetRequest.updateDynamicRules({
        removeRuleIds: e.map(e => e.id)
      }).then(() => {
        message.success('已关闭')
      })
    })
  }
}
</script>
<style lang="less"></style>