<template>
  <!-- <n-space vertical>
    <n-blockquote type="primary" style="margin: 5px 0;">{{ rule1.condition.regexFilter }}</n-blockquote>
    <n-space align="center">
      <n-text type="primary">
        匹配方式
      </n-text>
      todo
      <n-switch v-model:value="useAllDomains" @update:value="useAllDomainsChange">
        <template #checked>
          包含
        </template>
        <template #unchecked>
          排除
        </template>
      </n-switch>
      <n-switch v-model:value="useAllDomains" @update:value="useAllDomainsChange">
        <template #checked>
          全部域名
        </template>
        <template #unchecked>
          指定域名
        </template>
      </n-switch>
    </n-space>
  </n-space> -->
  <n-space style="margin: 10px 0;">
    <n-button @click="showAddDomainModel(true)" type="primary">添加域名</n-button>
  </n-space>
  <n-data-table :columns="columns" :data="tableData" />
  <n-modal v-model:show="showAddDomainModelStatus" preset="dialog" title="添加配置">
    <n-space vertical>
      <n-select placeholder="条件类型" :options="filterTypes" v-model:value="addDomainForm.type" />
      <n-input placeholder="pattern" v-model:value="addDomainForm.detail" @keyup.enter="addDomain"
        :status="statusVerify(addDomainForm.type, addDomainForm.detail) ? 'success' : 'error'" />
      <n-select placeholder="预处理类型" :options="filterTypes" v-model:value="addDomainForm.preProcessType" />
      <n-input placeholder="pattern" v-model:value="addDomainForm.preProcessDetail" @keyup.enter="addDomain"
        :status="statusVerify(addDomainForm.preProcessType, addDomainForm.preProcessDetail) ? 'success' : 'error'" />
    </n-space>
    <template #action>
      <n-button @click="addDomain" :disabled="!addDomainForm.type && !addDomainForm.detail">添加</n-button>
    </template>
  </n-modal>
</template>
<script setup lang="ts">
import { DataTableColumns, NButton, NDataTable, NSpace,/*  NBlockquote, NSwitch, NText, */ NModal, NInput, NSelect, type SelectOption } from 'naive-ui';
import { h, ref, toRaw, watch, reactive } from 'vue'
import type { FilterType, Filter, Profile } from '@/types'


const props = defineProps<{
  profile: Profile
}>()
const profile = props.profile

console.log(profile);

console.log(props);

const emits = defineEmits<{
  (e: 'onProfileChange', v: Profile): void
}>()

const columns: DataTableColumns<Filter> = [/* {
  type:'expand',
  expandable:(rowData)=>rowData.preProcess,
  renderExpand:rowData=>{
    return h()
  }
}, */{
    title: '类型',
    key: 'type',
    render(rowData, rowIndex) {
      return h(NSelect, {
        options: filterTypes,
        value: rowData.type,
        size: 'small',
        "onUpdate:value": (v: Filter['type']) => {
          profile.filters[rowIndex].type = v
        }
      })
    },
  }, {
    title: 'pattern',
    key: 'detail',
    render(rowData, rowIndex) {
      const status = statusVerify(rowData.type, rowData.detail) ? 'success' : 'error'
      return h(NInput, {
        value: rowData.detail,
        size: 'small',
        status,
        "onUpdate:value": (v: string) => {
          profile.filters[rowIndex].detail = v
        }
      })
    },
  }, {
    title: '预处理类型',
    key: 'type',
    render(rowData, rowIndex) {
      return h(NSelect, {
        options: filterTypes,
        value: rowData.preProcessType,
        size: 'small',
        "onUpdate:value": (v: Filter['type']) => {
          profile.filters[rowIndex].preProcessType = v
        }
      })
    },
  }, {
    title: '预处理',
    key: 'preProcess',
    render(rowData, rowIndex) {
      const status = statusVerify(rowData.preProcessType, rowData.preProcessDetail) ? 'success' : 'error'
      return h(NInput, {
        value: rowData.preProcessDetail,
        status,
        size: 'small',
        "onUpdate:value": (v: string) => {
          profile.filters[rowIndex].preProcessDetail = v
          console.log('status', status)
        }
      })
    },
  }, {
    title: '操作',
    key: 'actions',
    render(rowData,/*  rowIndex */) {
      return h(NButton, {
        type: 'warning',
        size: 'small',
        onClick() {
          delDomain(rowData.id)
        },
      }, {
        default: () => '删除'
      })
    },
  }]

const tableData = ref<Filter[]>()

watch(() => profile, (v) => {
  tableData.value = v.filters
}, {
  deep: true,
  immediate: true
})

watch(() => profile, (v) => {
  console.log('profile update');
  emits('onProfileChange', toRaw(v))
}, {
  deep: true,
})

const showAddDomainModelStatus = ref(false)
const filterTypes: SelectOption[] = [{
  label: '域名通配符',
  value: 'hostWildcard'
}, {
  label: 'url通配符',
  value: 'urlWildcard'
}, {
  label: '正则表达式',
  value: 'regexp'
}]

const addDomainForm = reactive<{
  type: Filter['type'],
  detail: string | undefined,
  preProcessType: Filter['type'] | undefined,
  preProcessDetail: string | undefined
}>({
  type: 'hostWildcard',
  detail: undefined,
  preProcessType: undefined,
  preProcessDetail: undefined
})
function statusVerify(type?: FilterType, v?: string) {
  const regexp = {
    urlWildcard: /^(\*|http|https|file|ftp|chrome-extension):\/\/(\*|\*\.[^\/\*]+|[^\/\*]+)?(\/.*)$/,
    hostWildcard: /^\*|\*\.[^\/\*]+|[^\/\*]+$/,
  }
  if (!type || !v) return true

  if (type == 'regexp') {
    try {
      new RegExp(v)
      return true
    } catch (error) {
      return false
    }
  } else {
    return regexp[type].test(v)
  }
}

function showAddDomainModel(show: boolean = true) {
  if (show) {
    addDomainForm.type = 'hostWildcard'
    addDomainForm.detail = addDomainForm.preProcessDetail = addDomainForm.preProcessType = undefined
  }
  showAddDomainModelStatus.value = show
}

function getAvailableId() {
  const arr = profile.filters.map(e => e.id)
  for (let i = 0; i < arr.length; i++) {
    if (!arr.includes(i)) {
      return i
    }
  }
}

function addDomain() {
  profile.filters.push({
    ...addDomainForm,
    id: getAvailableId()!
  } as Filter)
  showAddDomainModel(false)
}

function delDomain(index: number) {
  for (let i = 0; i < profile.filters.length; i++) {
    const host = profile.filters[i];
    if (host.id == index) {
      profile.filters.splice(i, 1)
      break
    }
  }
}

</script>
<style lang="less"></style>