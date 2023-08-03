<template>
  <n-layout has-sider class="container">
    <n-layout-sider bordered content-style="padding:20px">
      <n-h2 style="text-align: center;">NeedRedirect</n-h2>
      <n-space vertical>
        <n-list clickable show-divider>
          <template #header>
            <n-text type="info">配置</n-text>
          </template>
          <n-list-item v-for="profile of profiles" @click.stop="profileSelect(profile.id)">
            {{ profile.name }}
            <template #suffix>
              <n-popconfirm @positive-click="removeProfile(profile.id)">
                确定要删除吗
                <template #trigger>
                  <n-button circle quaternary @click.stop>
                    <template #icon>
                      <n-icon>
                        <trash />
                      </n-icon>
                    </template>
                  </n-button>
                </template>
              </n-popconfirm>
            </template>
          </n-list-item>
          <n-empty v-if="!profiles.length" description="还没有任何配置">
            <template #extra>
              <n-button size="small" @click="showAddModel()">
                添加一个
              </n-button>
            </template>
          </n-empty>
          <n-divider />
        </n-list>
        <n-tooltip :show="!profiles.length" placement="right-start">
          <template #trigger>
            <n-button block @click="showAddModel()">添加</n-button>
          </template>
          <n-text>先添加一个配置吧</n-text>
        </n-tooltip>
        <n-button block @click="deleteRule">删除</n-button>
        <n-button block @click="getEnabled">启用的</n-button>
        <n-button block @click="test">测试</n-button>
        <n-divider dashed></n-divider>
      </n-space>
    </n-layout-sider>
    <n-layout>
      <n-layout-header bordered>
        <n-space justify="space-between" align="center" style="padding: 20px;">
          <n-h3 prefix="bar" style="margin: 0;" align-text>
            <n-text>{{ topLeftTitle }}</n-text>
          </n-h3>
          <n-space>
            <n-button @click="" quaternary>主题</n-button>
            <n-button quaternary tag="a" href="https://github.com/ltxhhz/need-redirect" target="_blank">仓库</n-button>
          </n-space>
        </n-space>
      </n-layout-header>
      <n-layout-content content-style="padding: 24px;">
        <profile v-if="selected.startsWith('profile-')" :profile="profileParams.profile!"
          @on-profile-change="onProfileChange" :rule="profileParams.rule!" @on-rule-change="onRuleChange">
        </profile>
      </n-layout-content>
      <n-layout-footer bordered position="absolute">
        <n-space justify="space-between" align="center" style="padding: 20px;">
          footer
        </n-space>
      </n-layout-footer>
    </n-layout>
  </n-layout>
  <n-modal v-model:show="showAddModelStatus" preset="dialog" title="添加配置">
    <n-space vertical>
      <n-input placeholder="配置名" v-model:value="profileName"></n-input>
      <n-radio-group v-model:value="addType" name="radiogroup">
        <n-space>
          <n-radio v-for="k, v in addTypes" :key="k" :value="k">
            {{ v }}
          </n-radio>
        </n-space>
      </n-radio-group>
      <template v-if="addType == 'searchParams'">
        <n-space align="center">
          <n-input placeholder="searchParams 属性名" v-model:value="searchParamsOptions.key"></n-input>
          base64解码<n-switch v-model:value="searchParamsOptions.base64"></n-switch>
        </n-space>
        <n-input placeholder="要匹配的子目录(以'/'开头,可为空)" v-model:value="searchParamsOptions.path"></n-input>
      </template>
    </n-space>
    <template #action>
      <n-button @click="addProfile">确定</n-button>
    </template>
  </n-modal>
</template>
<script setup lang="ts">

import { reactive, ref, toRaw } from 'vue';
import { NLayout, NLayoutHeader, NLayoutSider, NLayoutContent, NLayoutFooter, useMessage, NButton, NH2, NSpace, NText, NDivider, NList, NListItem, NModal, NRadioGroup, NRadio, NInput, NSwitch, NTooltip, NEmpty, NH3, NIcon, NPopconfirm } from 'naive-ui'
import { Trash } from '@vicons/fa'
import profile from './profile.vue';

const message = useMessage()
const { storage, declarativeNetRequest, runtime } = chrome

const addTypes = {
  searchParams: 'searchParams',
  other: '其他'
}

let availableIds: number[] = []

function getAvailableId() {
  let id = availableIds.shift()
  if (id) {
    storage.local.set({
      availableIds
    })
    return id
  }
  id = profiles.length + 1
  return id
}

//#region 添加配置
type AddTypes = keyof typeof addTypes

const profileName = ref('')
const addType = ref<AddTypes>('searchParams')
const searchParamsOptions = reactive({
  key: '',
  path: '',
  base64: false
})
const showAddModelStatus = ref(false)
const topLeftTitle = ref('')
//#endregion

const selected = ref('')

export type Profile = {
  id: number
  name: string
  domains: string[]
} & {
  type: 'searchParams'
  key: string
  base64: boolean
}

const rules = reactive<chrome.declarativeNetRequest.Rule[]>([])
const profiles = reactive<Profile[]>([])

declarativeNetRequest.getDynamicRules()
  .then(e => {
    console.log(e);
    rules.push(...e)
  })
storage.local.get(['profiles', 'availableIds'], e => {
  console.log(e)
  profiles.push(...(e.profiles || []))
  availableIds = e.availableIds || []
})

function deleteRule() {
  declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [Number(prompt('id', '1'))]
  })
}
function getEnabled() {
  declarativeNetRequest.getEnabledRulesets()
    .then(console.log)
}

function initAddModel() {
  profileName.value = ''
  addType.value = 'searchParams'
  searchParamsOptions.key = ''
  searchParamsOptions.base64 = false
}

function showAddModel(show: boolean = true) {
  if (show) {
    initAddModel()
    showAddModelStatus.value = true
  } else {
    showAddModelStatus.value = false
  }
}

const profileParams: {
  profile?: Profile,
  rule?: chrome.declarativeNetRequest.Rule
} = {}

function profileSelect(item: number) {
  profileParams.profile = profiles[item - 1]
  profileParams.rule = rules.find(e => e.id == item)!
  selected.value = 'profile-' + item
  console.log(selected.value, profiles);
  topLeftTitle.value = '配置.' + profileParams.profile.name
}

function addProfile() {
  const id = getAvailableId()
  let rule: chrome.declarativeNetRequest.Rule
  declarativeNetRequest.updateDynamicRules({
    addRules: [rule = {
      id,
      action: {
        type: declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: {
          regexSubstitution: `chrome-extension://${runtime.id}/redirect/index.html?url=\\1&base64=${searchParamsOptions.base64}`
        }
      },
      condition: {
        regexFilter: `^https?://[^/]+/.*\\?.*&?\\b${searchParamsOptions.key}=([^&]+)`,
        resourceTypes: [declarativeNetRequest.ResourceType.MAIN_FRAME],
        requestMethods: [declarativeNetRequest.RequestMethod.GET]
      },
    }]
  }).then(() => {
    message.success('添加成功')
    rules.push(rule)
    profiles.push({
      name: profileName.value,
      type: 'searchParams',
      id,
      domains: ['example.com'],
      key: searchParamsOptions.key,
      base64: searchParamsOptions.base64
    })
    storage.local.set({
      profiles: toRaw(profiles)
    })
    showAddModel(false)
  }).catch((e) => {
    console.error(e)
    message.error(`添加失败 ${e?.message}`)
  })
}

function onProfileChange(profile: Profile) {
  console.log('onProfileChange', profile)

  profiles.forEach((p, i) => {
    if (p.id == profile.id) {
      profiles[i] = profile
    }
  });
  storage.local.set({
    profiles: toRaw(profiles)
  }).then(() => {

  }).catch((e) => {
    console.error(e);
    message.error(`保存失败 ${e?.message}`)
  })
}

function onRuleChange(rule: chrome.declarativeNetRequest.Rule) {
  console.log(rule);

  declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [rule.id],
    addRules: [rule]
  }).then(() => {

  }).catch((e) => {
    console.error(e);
    message.error(`保存失败 ${e?.message}`)
  })
}

function removeProfile(id: number) {

  profiles.splice(id - 1, 1)
  Promise.all([storage.local.set({
    profiles: toRaw(profiles)
  }),
  declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [id]
  })]).then(() => {
    message.success('删除成功')
  }).catch((e) => {
    console.error(e);
    message.error(`删除失败 ${e?.message}`)
  })
}

function test() {

}
</script>
<style lang="less">
.container {
  height: 100vh;
  display: flex;

}
</style>