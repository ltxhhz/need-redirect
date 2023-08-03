<template>
  <n-space vertical>
    <n-blockquote type="primary" style="margin: 5px 0;">{{ rule1.condition.regexFilter }}</n-blockquote>
    <n-space align="center">
      <n-text type="primary">
        匹配方式
      </n-text>
      <n-switch v-model:value="useAllDomains" @update:value="useAllDomainsChange">
        <template #checked>
          全部域名
        </template>
        <template #unchecked>
          指定域名
        </template>
      </n-switch>
    </n-space>
  </n-space>
  <template v-if="!useAllDomains">
    <n-space style="margin: 10px 0;">
      <n-button @click="showAddDomainModel(true)">添加域名</n-button>
    </n-space>
    <n-data-table :columns="columns" :data="tableData" />
  </template>
  <n-modal v-model:show="showAddDomainModelStatus" preset="dialog" title="添加配置">
    <n-space vertical>
      <n-input placeholder="输入域名" v-model:value="domain" @keyup.enter="addDomain"></n-input>
    </n-space>
    <template #action>
      <n-button @click="addDomain">添加</n-button>
    </template>
  </n-modal>
</template>
<script setup lang="ts">
import { DataTableColumns, NButton, NDataTable, NSpace, NBlockquote, NSwitch, NText, NModal, NInput } from 'naive-ui';
import { h, ref, toRaw, watch } from 'vue'
import type { Profile } from './content.vue'


const props = defineProps<{
  profile: Profile,
  rule: chrome.declarativeNetRequest.Rule
}>()
const profile1 = props.profile,
  rule1 = props.rule
console.log(profile1, rule1);

console.log(props);

const emits = defineEmits<{
  (e: 'onProfileChange', v: Profile): void,
  (e: 'onRuleChange', v: chrome.declarativeNetRequest.Rule): void
}>()

const columns: DataTableColumns<(typeof tableData.value)[number]> = [{
  title: '域名',
  key: 'domain',
  colSpan: (_, rowIndex) => rowIndex ? 1 : 2
}, {
  title: '操作',
  key: 'actions',
  render(rowData,/*  rowIndex */) {
    return h(NButton, {
      type: 'warning',
      onClick() {
        delDomain(rowData.domain)
      },
    }, {
      default: () => '删除'
    })
  },
}]

const useAllDomains = ref(!rule1.condition.requestDomains)

function useAllDomainsChange(value: boolean) {
  rule1.condition.requestDomains = value ? undefined : profile1.domains
  emits('onRuleChange', toRaw(rule1))
}

const tableData = ref(profile1.domains.map(e => ({ domain: e })))

watch(() => profile1, (v) => {
  tableData.value = v.domains.map(e => ({ domain: e }))
}, { deep: true })

const showAddDomainModelStatus = ref(false)
const domain = ref('')

function showAddDomainModel(show: boolean = true) {
  showAddDomainModelStatus.value = show
}

function addDomain() {
  let url
  if (/^https?/.test(domain.value)) {
    url = new URL(domain.value)
    profile1.domains.push(url.hostname)
  } else {
    profile1.domains.push(domain.value)
  }
  emits('onProfileChange', toRaw(profile1))
  showAddDomainModel(false)
}

function delDomain(domain: string) {
  for (let i = 0; i < profile1.domains.length; i++) {
    const host = profile1.domains[i];
    if (host == domain) {
      profile1.domains.splice(i, 1)
      emits('onProfileChange', toRaw(profile1))
      break
    }
  }
}

</script>
<style lang="less"></style>