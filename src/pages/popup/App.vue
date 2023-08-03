<template>
  <n-config-provider :theme="lightMode ? lightTheme : darkTheme">
    <n-message-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NMessageProvider, NConfigProvider, lightTheme, darkTheme } from 'naive-ui'
import { ref } from 'vue';

const mm = window.matchMedia('(prefers-color-scheme: light)')
const lightMode = ref(mm.matches)
mm.addEventListener('change', (ev) => {
  lightMode.value = ev.matches
})
</script>

<style scoped></style>
