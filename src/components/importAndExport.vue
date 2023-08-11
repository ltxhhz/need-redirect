<template>
  <n-code :code="JSON.stringify(profiles, undefined, 2)" language="json" show-line-numbers />
</template>
<script setup lang="ts">
import {  toRaw, ref } from "vue";
import { NCode } from 'naive-ui'
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