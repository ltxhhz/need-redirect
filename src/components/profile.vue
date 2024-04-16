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
  <n-flex style="margin: 10px 0">
    <n-button @click="showAddDomainModel(true)" type="primary">添加域名匹配</n-button>
  </n-flex>
  <n-data-table class="main-table" :columns="columns" :data="tableData" :row-key="row => profile.name + ':' + row.id" />
  <n-modal v-model:show="showAddDomainModelStatus" preset="dialog" title="添加配置">
    <n-flex vertical>
      <n-select placeholder="条件类型" :options="filterTypes" v-model:value="addDomainForm.type" />
      <n-input
        placeholder="匹配模式 用来匹配带有跳转目标的url"
        v-model:value="addDomainForm.detail"
        @keyup.enter="addDomain"
        :status="statusVerify(addDomainForm.type, addDomainForm.detail, true) ? 'success' : 'error'" />
      <n-flex :wrap="false" align="center">
        <n-input v-model:value="addDomainForm.getUrl.key" placeholder="获取参数的键" />
        <n-flex :wrap="false" align="center">
          <n-text style="text-wrap: nowrap;">base64:</n-text>
          <n-switch v-model:value="addDomainForm.getUrl.base64" placeholder="是否是base64" />
        </n-flex>
      </n-flex>
      <n-select placeholder="预处理类型" :options="filterTypes" v-model:value="addDomainForm.preProcess[0].preProcessType" />
      <n-input
        placeholder="匹配模式 用来匹配带有跳转目标的url的页面的url"
        v-model:value="addDomainForm.preProcess[0].preProcessDetail"
        @keyup.enter="addDomain"
        :status="statusVerify(addDomainForm.preProcess[0].preProcessType, addDomainForm.preProcess[0].preProcessDetail) ? 'success' : 'error'" />
      <n-select placeholder="预处理方法" :options="preProcessMethodOptions" v-model:value="addDomainForm.preProcess[0].preProcessMethod" />
    </n-flex>
    <template #action>
      <n-button @click="addDomain" :disabled="!addDomainForm.type || !addDomainForm.detail">添加</n-button>
    </template>
  </n-modal>
  <n-modal v-model:show="showAddProcessStatus" preset="dialog" title="添加预处理">
    <n-space vertical>
      <n-select placeholder="预处理类型" :options="filterTypes" v-model:value="addProcessForm.preProcessType" />
      <n-input
        placeholder="pattern"
        v-model:value="addProcessForm.preProcessDetail"
        @keyup.enter="addDomain"
        :status="statusVerify(addProcessForm.preProcessType, addProcessForm.preProcessDetail) ? 'success' : 'error'" />
      <n-select placeholder="预处理方法" :options="preProcessMethodOptions" v-model:value="addProcessForm.preProcessMethod" />
      <n-input placeholder="css选择器" title="如果提供则只对匹配的元素及子元素做修改" type="textarea" v-model:value="addProcessForm.preProcessSelector" />
    </n-space>
    <template #action>
      <n-button @click="addProcess" :disabled="!addProcessForm.preProcessType && !addProcessForm.preProcessDetail && !addProcessForm.preProcessMethod">添加</n-button>
    </template>
  </n-modal>
</template>
<script setup lang="tsx">
import {
  DataTableColumns,
  DataTableBaseColumn,
  NButton,
  NDataTable,
  NFlex,
  NTable,
  NSpace,
  /*  NBlockquote, NSwitch, NText, */ NModal,
  NInput,
  NSelect,
  type SelectOption,
  NSwitch,
  NTooltip,
  NText
} from 'naive-ui'
import { h, ref, toRaw, watch, reactive } from 'vue'
import { type FilterType, type Filter, type Profile, type PreProcessMethod, type PreProcess, type GetUrl, getUrlType, GetUrlType } from '@/types'

const props = defineProps<{
  profile: Profile
}>()
let profile = props.profile

console.log(profile)

console.log(props)

const emits = defineEmits<{
  (e: 'onProfileChange', v: Profile): void
}>()

const columns: DataTableColumns<Filter> = [
  {
    title: '#',
    key: '',
    render(_rowData, rowIndex) {
      return rowIndex + 1
    }
  },
  {
    type: 'expand',
    expandable: rowData => !!rowData.preProcess.length,
    renderExpand: (rowData, rowIndex) => {
      console.log(rowData)
      return (
        <NTable>
          <thead>
            <tr>
              <th>预处理类型</th>
              <th>预处理匹配模式</th>
              <th>预处理方法</th>
              <th>预处理选择器</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rowData.preProcess.map((item, index) => {
              return (
                <tr key={index}>
                  <td>
                    <NSelect
                      options={filterTypes}
                      value={item.preProcessType}
                      size="small"
                      onUpdate:value={(v: Filter['type']) => {
                        profile.filters[rowIndex].preProcess[index].preProcessType = v
                      }}></NSelect>
                  </td>
                  <td>
                    <NInput
                      value={item.preProcessDetail}
                      status={statusVerify(item.preProcessType, item.preProcessDetail) ? 'success' : 'error'}
                      size="small"
                      placeholder="用来匹配带有跳转目标的url的页面的url"
                      onUpdate:value={(v: string) => {
                        profile.filters[rowIndex].preProcess[index].preProcessDetail = v
                      }}
                    />
                  </td>
                  <td>
                    <NSelect
                      options={preProcessMethodOptions}
                      value={item.preProcessMethod}
                      size="small"
                      onUpdate:value={(v: PreProcessMethod) => {
                        profile.filters[rowIndex].preProcess[index].preProcessMethod = v
                      }}></NSelect>
                  </td>
                  <td>
                    <NInput
                      value={item.preProcessSelector}
                      size="small"
                      status="success"
                      /* status={statusVerify(item.preProcessType, item.preProcessSelector) ? 'success' : 'error'} */
                      title="如果提供则只对匹配的元素及子元素做修改"
                      placeholder="用来匹配带有跳转目标的url的a元素，默认为 a[href]"
                      onUpdate:value={(v: string) => {
                        profile.filters[rowIndex].preProcess[index].preProcessSelector = v
                      }}
                    />
                  </td>
                  <td>
                    <NButton size="small" type="error" onClick={() => removeProcess(rowData, rowIndex, index)}>
                      删除
                    </NButton>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </NTable>
      )
    }
  },
  {
    title: '匹配类型',
    key: 'type',
    render(rowData, rowIndex) {
      return h(NSelect, {
        options: filterTypes,
        value: rowData.type,
        size: 'small',
        'onUpdate:value': (v: Filter['type']) => {
          profile.filters[rowIndex].type = v
        }
      })
    }
  },
  {
    title: '匹配模式',
    key: 'detail',
    render(rowData, rowIndex) {
      const status = statusVerify(rowData.type, rowData.detail) ? 'success' : 'error'
      return h(NInput, {
        value: rowData.detail,
        size: 'small',
        status,
        'onUpdate:value': (v: string) => {
          profile.filters[rowIndex].detail = v
        }
      })
    }
  },
  {
    title: '获取方式',
    key: 'type',
    render(rowData, rowIndex) {
      return h(NSelect, {
        options: getUrlType.map(e => ({ label: e.value, value: e.value })),
        value: rowData.getUrl.type,
        size: 'small',
        'onUpdate:value': (v: GetUrlType) => {
          profile.filters[rowIndex].getUrl.type = v
        }
      })
    }
  },
  {
    title(_column: DataTableBaseColumn) {
      return h(NTooltip, null, {
        default: () => h(NText, () => '不同类型的获取方式使用不同的参数\n比如 searchParams 获取参数为 search，path 获取参数为 正则表达式'),
        trigger: () => h(NText, () => '获取参数')
      })
    },
    key: 'key',
    render(rowData, rowIndex) {
      return h(NInput, {
        value: rowData.getUrl.key,
        size: 'small',
        'onUpdate:value': (v: string) => {
          profile.filters[rowIndex].getUrl.key = v
        }
      })
    }
  },
  {
    title: '需要base64解码',
    key: 'base64',
    render(rowData, rowIndex) {
      return h(NSwitch, {
        checked: rowData.getUrl.base64,
        size: 'small',
        'onUpdate:checked': (v: boolean) => {
          profile.filters[rowIndex].getUrl.base64 = v
        }
      })
    }
  },
  {
    title: '操作',
    key: 'actions',
    render(rowData, rowIndex) {
      return h(NSpace, {}, () => [
        h(
          NButton,
          {
            type: 'primary',
            size: 'small',
            onClick() {
              addProcessIndex = rowIndex
              showAddPrecessModel()
            }
          },
          () => '添加预处理'
        ),
        h(
          NButton,
          {
            type: 'warning',
            size: 'small',
            onClick() {
              delDomain(rowData.id)
            }
          },
          () => '删除'
        )
      ])
    }
  },
  {
    title: '生效次数',
    key: 'count'
  }
]

const preProcessMethodOptions: SelectOption[] = [
  {
    label: '屏蔽事件跳转',
    value: 'addEventToA'
  },
  {
    label: '替换跳转url',
    value: 'replaceHref'
  }
]

const tableData = ref<Filter[]>()

watch(
  () => props.profile,
  v => {
    profile = v
    tableData.value = v.filters
  },
  {
    deep: true,
    immediate: true
  }
)

watch(
  () => profile,
  v => {
    console.log('profile update')
    emits('onProfileChange', toRaw(v))
  },
  {
    deep: true
  }
)

const showAddDomainModelStatus = ref(false)
const filterTypes: SelectOption[] = [
  {
    label: '域名通配符',
    value: 'hostWildcard'
  },
  {
    label: 'url通配符',
    value: 'urlWildcard'
  },
  {
    label: '正则表达式',
    value: 'regexp'
  }
]

const addDomainForm = reactive<{
  type: Filter['type']
  detail: string
  preProcess: [
    {
      preProcessType: Filter['type'] | undefined
      preProcessDetail: string | undefined
      preProcessMethod: PreProcessMethod | undefined
      preProcessSelector: string | undefined
    }
  ]
  getUrl: GetUrl
}>({
  type: 'hostWildcard',
  detail: '',
  preProcess: [
    {
      preProcessType: undefined,
      preProcessDetail: undefined,
      preProcessMethod: undefined,
      preProcessSelector: undefined
    }
  ],
  getUrl: {
    type: 'searchParams',
    base64: false,
    key: ''
  }
})

const addProcessForm = reactive<Partial<PreProcess>>({
  preProcessType: undefined,
  preProcessDetail: undefined,
  preProcessMethod: undefined
})

let addProcessIndex = -1

const showAddProcessStatus = ref(false)
function statusVerify(type: FilterType | undefined, v: string | undefined, required?: true): boolean
function statusVerify(type?: FilterType, v?: string, required?: boolean) {
  const regexp = {
    urlWildcard: /^(\*|http|https|file|ftp|chrome-extension):\/\/(\*|\*\.[^\/\*]+|[^\/\*]+)?(\/.*)$/,
    hostWildcard: /^\*|\*\.[^\/\*]+|[^\/\*]+$/
  }
  if (!required && (!type || !v)) return true

  if (type == 'regexp') {
    try {
      new RegExp(v!)
      return true
    } catch (error) {
      return false
    }
  } else {
    return regexp[type!].test(v!)
  }
}

function showAddDomainModel(show: boolean = true) {
  if (show) {
    addDomainForm.type = 'hostWildcard'
    addDomainForm.detail = ''
    addDomainForm.preProcess[0].preProcessDetail = addDomainForm.preProcess[0].preProcessType = undefined
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
  const obj: Filter = {
    ...toRaw(addDomainForm),
    id: getAvailableId(),
    count: 0
  } as Filter
  if (!obj.preProcess[0]?.preProcessDetail || !obj.preProcess[0]?.preProcessMethod || !obj.preProcess[0]?.preProcessType) {
    obj.preProcess.length = 0
  }
  profile.filters.push(obj)
  showAddDomainModel(false)
}
function addProcess() {
  profile.filters[addProcessIndex].preProcess.push({
    ...(toRaw(addProcessForm) as PreProcess)
  })
  showAddPrecessModel(false)
}

function delDomain(index: number) {
  for (let i = 0; i < profile.filters.length; i++) {
    const host = profile.filters[i]
    if (host.id == index) {
      profile.filters.splice(i, 1)
      break
    }
  }
}
function removeProcess(_row: Filter, rowIndex: number, index: number) {
  return profile.filters[rowIndex].preProcess.splice(index, 1)
}
</script>
<style lang="less">
.main-table tr > td:nth-child(1) {
  user-select: none;
}
</style>
