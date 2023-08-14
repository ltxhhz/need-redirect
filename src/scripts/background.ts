import { FilterType } from './../types.d'
import type { PreProcessMethod, Profile } from '@/types'
import * as preProcessFunc from './pre-process'
const { webNavigation, storage, tabs, scripting } = chrome
let profiles: Profile[]
let enable = true
storage.local.get(['profiles', 'enable']).then(e => {
  profiles = e.profiles
  enable = e.enable
  // tabs.onUpdated.addListener((id, info, tab) => {
  //   console.log('onUpdate', id, tab)
  //   console.log('onUpdate', info.url)
  //   if (info.url || tab.status == 'loading') {

  //     // const url = info.url || tab.url
  //   }
  // })
  webNavigation.onBeforeNavigate.addListener(detail => {
    if (!enable) {
      console.log('已关闭')
      return
    }
    profiles.some((e, i) => {
      if (e.filters.some(e => matchHost(e.detail, detail.url, e.type))) {
        if (e.type == 'searchParams') {
          const value = new URL(detail.url).searchParams.get(e.key)
          if (value) {
            tabs.update(detail.tabId, {
              url: value
            })
            countPlus(e, i)
            return true
          }
        }
      }
    })
  })
  webNavigation.onCompleted.addListener(detail => {
    console.log(detail)
    if (!enable) {
      console.log('已关闭')
      return
    }
    profiles.some((e, i) => {
      let method: PreProcessMethod

      if (e.filters.some(e => e.preProcess.some(e => matchHost(e.preProcessDetail, detail.url, e.preProcessType) && ((method = e.preProcessMethod), true)))) {
        console.log('aaa')

        scripting
          .executeScript({
            target: {
              tabId: detail.tabId,
              allFrames: true
            },
            world: 'MAIN',
            args: [e.key], //todo 适配其他方法
            func: preProcessFunc[method!]
          })
          .then(() => {
            countPlus(e, i)
          })
        return true
      }
    })
  })
})

storage.local.onChanged.addListener(e => {
  if (e.profiles?.newValue) {
    profiles = e.profiles.newValue
  } else if (e.enable?.newValue != undefined) {
    enable = e.enable.newValue
  }
})

function matchHost(pattern: string | undefined, url: string, type?: FilterType) {
  if (!pattern) return false
  if (type == 'hostWildcard') {
    return new RegExp(pattern.replace(/\*/g, '[^.]*')).test(new URL(url).host)
  } else if (type == 'urlWildcard') {
    return new RegExp(pattern.replace(/\*/g, '[^.]*')).test(url)
  } else {
    return new RegExp(pattern).test(url)
  }
}

function countPlus(profile: Profile, index: number) {
  const arr = [...profiles]
  profile.count++
  arr[index] = profile
  return storage.local.set({
    profiles: arr
  })
}
