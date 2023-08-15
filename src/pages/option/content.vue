<template>
  <n-layout has-sider class="container">
    <n-layout-sider bordered content-style="padding:20px">
      <n-h2 style="text-align: center;">NeedRedirect</n-h2>
      <n-space vertical>
        <n-list clickable show-divider>
          <template #header>
            <n-text type="info">设置</n-text>
          </template>
          <n-list-item @click.stop="profileSelect('setting', 0)">
            <template #prefix>
              <n-space align="center" item-style="line-height:0">
                <n-icon>
                  <save />
                </n-icon>
              </n-space>
            </template>
            <n-text>导入/导出</n-text>
          </n-list-item>
        </n-list>
        <n-list clickable show-divider>
          <template #header>
            <n-text type="info">配置</n-text>
          </template>
          <n-list-item v-for="profile, index of profiles" @click.stop="profileSelect('profile', index)" class="list-item">
            <n-text>
              {{ profile.name }}
            </n-text>
            <template #suffix>
              <n-popconfirm @positive-click="removeProfile(index)">
                确定要删除吗
                <template #trigger>
                  <n-button size="tiny" circle quaternary @click.stop class="suffix-btn">
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
            <n-button block @click="showAddModel()">
              <template #icon>
                <n-icon>
                  <plus />
                </n-icon>
              </template>
              添加
            </n-button>
          </template>
          <n-text>先添加一个配置吧</n-text>
        </n-tooltip>
        <n-button v-if="dev" block @click="test">测试</n-button>
        <n-divider dashed></n-divider>
      </n-space>
    </n-layout-sider>
    <n-layout>
      <n-layout-header bordered ref="header">
        <n-space justify="space-between" align="center" style="padding: 20px;">
          <n-h3 prefix="bar" style="margin: 0;" align-text>
            <n-text>{{ topLeftTitle }}</n-text>
          </n-h3>
          <n-space>
            <n-button @click.stop="changeTheme" quaternary>主题{{ props.themeMode }}</n-button>
            <n-button quaternary tag="a" href="https://github.com/ltxhhz/need-redirect" target="_blank">仓库</n-button>
          </n-space>
        </n-space>
      </n-layout-header>
      <n-layout-content content-style="padding: 24px;">
        <profile v-if="selected.value == 'profile'" :profile="profiles[selected.index]"
          @on-profile-change="onProfileChange">
        </profile>
        <i-a-e v-else-if="selected.value == 'setting' && selected.index == 0"
          :style="{ height: `calc(100vh - ${footer?.$el?.offsetHeight}px - 24px * 2 - ${header?.$el?.offsetHeight}px)` }"></i-a-e>
        <div v-else
          :style="{ height: `calc(100vh - ${footer?.$el?.offsetHeight}px - 24px * 2 - ${header?.$el?.offsetHeight}px)` }"
          style="display: flex;align-items: center;justify-content: center;">
          <n-text depth="3" style="font-size: 100px;user-select: none;">Need Redirect</n-text>
        </div>
      </n-layout-content>
      <n-layout-footer ref="footer" bordered position="absolute">
        <n-space align="center" style="padding: 20px;">
          <n-text v-if="selected.value == 'profile' && profiles[selected.index]" type="primary">
            生效次数 {{ profiles[selected.index].count }}
          </n-text>
          <template v-else-if="selected.value == 'setting' && selected.index == 0">
            <n-button @click.stop="copyProfiles" secondary>复制</n-button>
            <n-button @click="importProfiles">导入</n-button>
          </template>
          <template v-else>
            footer
          </template>
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
      </template>
    </n-space>
    <template #action>
      <n-button @click="addProfile">确定</n-button>
    </template>
  </n-modal>
</template>
<script setup lang="ts">

import { reactive, ref, toRaw, ComponentPublicInstance, h } from 'vue';
import { NLayout, NLayoutHeader, NLayoutSider, NLayoutContent, NLayoutFooter, useMessage, NButton, NH2, NSpace, NText, NDivider, NList, NListItem, NModal, NRadioGroup, NRadio, NInput, NSwitch, NTooltip, NEmpty, NH3, NIcon, NPopconfirm, useDialog } from 'naive-ui'
import { Trash, Plus, /* Cog, */ Save } from '@vicons/fa'
import profile from '@/components/profile.vue';
import IAE from '@/components/importAndExport.vue';
import type { ThemeMode } from './App.vue'
import { Profile, profilesType } from '@/types.ts';

const message = useMessage()
const dialog = useDialog()
const { storage } = chrome
const dev = import.meta.env.DEV
const props = defineProps<{
  themeMode: ThemeMode
}>()

const emits = defineEmits<{
  (e: 'update:themeMode', v: ThemeMode): void
}>()

const addTypes = {
  searchParams: 'searchParams',
  other: '其他'
}

//#region 添加配置
type AddTypes = keyof typeof addTypes
const header = ref<ComponentPublicInstance | null>(null)
const footer = ref<ComponentPublicInstance | null>(null)
const profileName = ref('')
const addType = ref<AddTypes>('searchParams')
const searchParamsOptions = reactive({
  key: '',
  base64: false
})
const showAddModelStatus = ref(false)
const topLeftTitle = ref('')
//#endregion

type SelectedType = '' | 'profile' | 'setting'

const selected = reactive<{
  index: number,
  value: SelectedType
}>({
  index: -1,
  value: ''
})

const profiles = reactive<Profile[]>([])

storage.local.get(['profiles'], e => {
  console.log(e)
  profiles.push(...(e.profiles || []))
})

storage.local.onChanged.addListener(changes => {
  if (changes.profiles?.newValue) {
    profiles.length = 0
    profiles.push(...changes.profiles.newValue)
  }
})

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

function profileSelect(type: SelectedType, item: number) {
  selected.index = item
  selected.value = type

  topLeftTitle.value = type //'配置.' + profiles[item].name
}

function addProfile() {
  message.success('添加成功')
  profiles.push({
    name: profileName.value,
    type: 'searchParams',
    filters: [{
      id: 0,
      type: 'hostWildcard',
      detail: '*.example.com',
      preProcess: [{
        // id: 0,
        preProcessType: 'regexp',
        preProcessDetail: 'zhuanlan.example.com/p/.*',
        preProcessMethod: 'replaceHref'
      }]
    }],
    count: 0,
    key: searchParamsOptions.key,
    base64: searchParamsOptions.base64
  })
  storage.local.set({
    profiles: toRaw(profiles)
  }).catch((e) => {
    console.error(e)
    message.error(`添加失败 ${e?.message}`)
  })
  showAddModel(false)
}

function onProfileChange(profile: Profile) {
  console.log('onProfileChange', profile)
  profiles[selected.index] = profile
  storage.local.set({
    profiles: toRaw(profiles)
  }).then(() => {

  }).catch((e) => {
    console.error(e);
    message.error(`保存失败 ${e?.message}`)
  })
}

function removeProfile(id: number) {
  profiles.splice(id - 1, 1)
  storage.local.set({
    profiles: toRaw(profiles)
  }).then(() => {
    message.success('删除成功')
    if (selected.value == 'profile') {
      selected.index = -1
      selected.value = ''
    }
  }).catch((e) => {
    console.error(e);
    message.error(`删除失败 ${e?.message}`)
  })
}

function changeTheme() {
  console.log(props.themeMode);
  if (props.themeMode == 'auto') {
    emits('update:themeMode', 'light')
    message.success(`切换主题为 light`)
  } else if (props.themeMode == 'light') {
    emits('update:themeMode', 'dark')
    message.success(`切换主题为 dark`)
  } else {
    emits('update:themeMode', 'auto')
    message.success(`切换主题为 auto`)
  }
}

function copyProfiles() {
  navigator.clipboard.writeText(JSON.stringify(toRaw(profiles)))
    .then(() => {
      message.success('复制成功')
    })
    .catch(e => {
      console.error(e);
      message.error('复制失败')
    })
}

function importProfiles() {
  const str = ref('')
  dialog.create({
    content() {
      return h(NInput, {
        placeholder: '输入json字符串',
        value: str.value,
        type: 'textarea',
        "onUpdate:value": (e) => {
          str.value = e
        }
      })
    },
    title: '导入配置',
    positiveText: '确定',
    onPositiveClick() {
      try {
        const arr: Profile[] = JSON.parse(str.value)
        if (profilesType.decode(arr)._tag == 'Right') {
          storage.local.set({
            profiles: arr.map(e => (e.count = 0, e))
          }).then(() => {
            message.success('导入成功')
          })
        } else {
          message.error('导入失败，请检查')
          return false
        }
      } catch (error) {
        console.error(error);
        message.error('导入失败，请检查')
        return false
      }
    },
  })
}

function test() {

}
</script>
<style lang="less" scoped>
.container {
  height: 100vh;
  display: flex;

}

.suffix-btn {
  opacity: 0;
}

.list-item:hover {
  .suffix-btn {
    opacity: 1;
  }
}
</style>