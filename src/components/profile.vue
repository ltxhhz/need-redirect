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
      <n-select placeholder="预处理类型" :options="filterTypes" v-model:value="addDomainForm.preProcess[0].preProcessType" />
      <n-input placeholder="pattern" v-model:value="addDomainForm.preProcess[0].preProcessDetail" @keyup.enter="addDomain"
        :status="statusVerify(addDomainForm.preProcess[0].preProcessType, addDomainForm.preProcess[0].preProcessDetail) ? 'success' : 'error'" />
      <n-select placeholder="预处理方法" :options="preProcessMethodOptions"
        v-model:value="addDomainForm.preProcess[0].preProcessMethod" />
    </n-space>
    <template #action>
      <n-button @click="addDomain" :disabled="!addDomainForm.type && !addDomainForm.detail">添加</n-button>
    </template>
  </n-modal>
  <n-modal v-model:show="showAddProcessStatus" preset="dialog" title="添加预处理">
    <n-space vertical>
      <n-select placeholder="预处理类型" :options="filterTypes" v-model:value="addProcessForm.preProcessType" />
      <n-input placeholder="pattern" v-model:value="addProcessForm.preProcessDetail" @keyup.enter="addDomain"
        :status="statusVerify(addProcessForm.preProcessType, addProcessForm.preProcessDetail) ? 'success' : 'error'" />
      <n-select placeholder="预处理方法" :options="preProcessMethodOptions" v-model:value="addProcessForm.preProcessMethod" />
      <n-input placeholder="css选择器" title="如果提供则只对匹配的元素及子元素做修改" type="textarea"
        v-model:value="addProcessForm.preProcessSelector" />
    </n-space>
    <template #action>
      <n-button @click="addProcess"
        :disabled="!addProcessForm.preProcessType && !addProcessForm.preProcessDetail && !addProcessForm.preProcessMethod">添加</n-button>
    </template>
  </n-modal>
</template>
<script setup lang="ts">
import { DataTableColumns, NButton, NDataTable, NSpace,/*  NBlockquote, NSwitch, NText, */ NModal, NInput, NSelect, type SelectOption, NText } from 'naive-ui';
import { h, ref, toRaw, watch, reactive } from 'vue'
import type { FilterType, Filter, Profile, PreProcessMethod, PreProcess } from '@/types'


const props = defineProps<{
  profile: Profile
}>()
let profile = props.profile

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
    colSpan: (rowData) => rowData.preProcess.length == 0 ? 3 : 1,
    render(rowData, rowIndex) {
      if (rowData.preProcess.length) {
        return h(NSpace, {
          vertical: true,
        }, () => rowData.preProcess.map((e, i) => h(NSelect, {
          options: filterTypes,
          value: e.preProcessType,
          size: 'small',
          "onUpdate:value": (v: Filter['type']) => {
            profile.filters[rowIndex].preProcess[i].preProcessType = v
          }
        })))
      } else {
        return h(NText, {}, () => '空')
      }
    },
  }, {
    title: '预处理pattern',
    key: 'preProcess',
    render(rowData, rowIndex) {
      return h(NSpace, {
        vertical: true,
      }, () => rowData.preProcess.map((e, i) => {
        const status = statusVerify(e.preProcessType, e.preProcessDetail) ? 'success' : 'error'
        return h(NInput, {
          value: e.preProcessDetail,
          status,
          size: 'small',
          "onUpdate:value": (v: string) => {
            profile.filters[rowIndex].preProcess[i].preProcessDetail = v
            console.log('status', status)
          }
        })
      }))
    },
  }, {
    title: '预处理方法',
    key: 'preProcessMethod',
    render(rowData, rowIndex) {
      return h(NSpace, {
        vertical: true,
      }, () => rowData.preProcess.map((e, i) => h(NSelect, {
        value: e.preProcessMethod,
        options: preProcessMethodOptions,
        size: 'small',
        "onUpdate:value": (v: PreProcessMethod) => {
          profile.filters[rowIndex].preProcess[i].preProcessMethod = v
        }
      })))
    },
  }, {
    title: '预处理选择器',
    key: 'preProcessSelector',
    render(rowData, rowIndex) {
      return h(NSpace, {
        vertical: true,
      }, () => rowData.preProcess.map((e, i) => {
        const status = 'success'//statusVerify(e.preProcessType, e.preProcessSelector) ? 'success' : 'error'
        return h(NInput, {
          value: e.preProcessSelector,
          status,
          size: 'small',
          placeholder: 'css选择器，一行一个',
          title: '如果提供则只对匹配的元素及子元素做修改',
          "onUpdate:value": (v: string) => {
            profile.filters[rowIndex].preProcess[i].preProcessSelector = v
            console.log('status', status)
          }
        })
      }))
    },
  }, {
    title: '操作',
    key: 'actions',
    render(rowData, rowIndex) {
      return h(NSpace, {}, () => [
        h(NButton, {
          type: 'primary',
          size: 'small',
          onClick() {
            addProcessIndex = rowIndex
            showAddPrecessModel()
          }
        }, () => '添加'),
        h(NButton, {
          type: 'warning',
          size: 'small',
          onClick() {
            delDomain(rowData.id)
          },
        }, () => '删除'),
      ])
    },
  }]

const preProcessMethodOptions: SelectOption[] = [{
  label: '屏蔽事件跳转', value: 'addEventToA'
}, {
  label: '替换跳转url', value: 'replaceHref'
}]

const tableData = ref<Filter[]>()

watch(() => props.profile, (v) => {
  profile = v
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
  preProcess: [{
    preProcessType: Filter['type'] | undefined,
    preProcessDetail: string | undefined,
    preProcessMethod: PreProcessMethod | undefined,
    preProcessSelector: string | undefined
  }],
}>({
  type: 'hostWildcard',
  detail: undefined,
  preProcess: [{
    preProcessType: undefined,
    preProcessDetail: undefined,
    preProcessMethod: undefined,
    preProcessSelector: undefined
  }]
})

const addProcessForm = reactive<Partial<PreProcess>>({
  preProcessType: undefined,
  preProcessDetail: undefined,
  preProcessMethod: undefined
})

let addProcessIndex = -1

const showAddProcessStatus = ref(false)

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
    addDomainForm.detail = addDomainForm.preProcess[0].preProcessDetail = addDomainForm.preProcess[0].preProcessType = undefined
    addDomainForm.preProcess[0].preProcessMethod = undefined
  }
  showAddDomainModelStatus.value = show
}

function showAddPrecessModel(show = true) {
  if (show) {
    addProcessForm.preProcessType = addProcessForm.preProcessDetail = addProcessForm.preProcessMethod = undefined
  }
  showAddProcessStatus.value = show
}

function getAvailableId() {
  const arr = profile.filters.map(e => e.id)
  for (let i = 0; i < arr.length; i++) {
    if (!arr.includes(i)) {
      return i
    }
  }
  return arr.length
}

function addDomain() {
  const obj = {
    ...toRaw(addDomainForm),
    id: getAvailableId()
  } as Filter
  if (!obj.preProcess[0]?.preProcessDetail || !obj.preProcess[0]?.preProcessMethod || !obj.preProcess[0]?.preProcessType) {
    obj.preProcess.length = 0
  }
  profile.filters.push(obj)
  showAddDomainModel(false)
}
function addProcess() {
  profile.filters[addProcessIndex].preProcess.push({
    ...toRaw(addProcessForm) as PreProcess
  })
  showAddPrecessModel(false)
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