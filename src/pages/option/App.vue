<template>
  <n-config-provider :theme="lightMode ? lightTheme : darkTheme">
    <!-- <n-dialog-provider> -->
      <n-message-provider>
        <content />
      </n-message-provider>
    <!-- </n-dialog-provider> -->
  </n-config-provider>
</template>

<script setup lang="ts">
import { NMessageProvider, NConfigProvider, lightTheme, darkTheme } from 'naive-ui'
import content from './content.vue'
import { ref } from 'vue';

const mm = window.matchMedia('(prefers-color-scheme: light)')
const lightMode = ref(mm.matches)
mm.addEventListener('change', (ev) => {
  lightMode.value = ev.matches
})
</script>

<style scoped></style>
