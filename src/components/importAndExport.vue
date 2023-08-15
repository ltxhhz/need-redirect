<template>
  <n-scrollbar>
    <n-code :code="JSON.stringify(profiles, undefined, 2)" language="json" show-line-numbers />
  </n-scrollbar>
</template>
<script setup lang="ts">
import { toRaw, ref } from "vue";
import { NCode, NScrollbar } from 'naive-ui'
import { Profile } from '@/types';

import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
hljs.registerLanguage('json', json)

let profiles = ref<Profile[]>()

chrome.storage.local.get(['profiles']).then(e => {
  profiles.value = e.profiles || []
  console.log(toRaw(profiles));
})

</script>
<style lang="less"></style>