<template>
  <n-config-provider :theme="lightMode ? lightTheme : darkTheme">
    <n-message-provider>
      <content />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NMessageProvider, NConfigProvider, lightTheme, darkTheme } from 'naive-ui'
import { ref, watch } from 'vue';
import type { ThemeMode } from '../option/App.vue';
import Content from './content.vue';

const themeMode1 = ref<ThemeMode>('auto')
const mm = window.matchMedia('(prefers-color-scheme: light)')
const lightMode = ref(mm.matches)

mm.addEventListener('change', (ev) => {
  if (themeMode1.value == 'auto') {
    lightMode.value = ev.matches
  }
})

chrome.storage.local.get(['themeMode']).then(e => {
  if (e.themeMode) {
    themeMode1.value = e.themeMode
  } else {
    chrome.storage.local.set({
      themeMode: 'auto'
    })
  }
  lightMode.value = themeMode1.value == 'light'
})
watch(() => themeMode1.value, v => {
  console.log('change', v);

  if (v == 'auto') {
    lightMode.value = mm.matches
  } else {
    lightMode.value = themeMode1.value == 'light'
  }
  chrome.storage.local.set({
    themeMode: v
  })
})
</script>

<style scoped></style>
