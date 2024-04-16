import { FilterType } from './../types'
import type { PreProcessMethod, Profile } from '@/types'
import * as preProcessFunc from './pre-process'
import { throttle } from 'lodash-es'
const { webNavigation, storage, tabs, scripting } = chrome
let profiles: Profile[]
let enable = true

const saveProfiles = throttle(() => {
  storage.local.set({ profiles })
}, 1e3)

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
    for (let i = 0; i < profiles.length; i++)
      for1: {
        const profile = profiles[i]
        for (const filter of profile.filters) {
          if (matchHost(filter.detail, detail.url, filter.type)) {
            if (filter.getUrl.type == 'searchParams') {
              const value = new URL(detail.url).searchParams.get(filter.getUrl.key)
              if (value) {
                tabs.update(detail.tabId, {
                  url: value
                })
                filter.count += 1
                saveProfiles()
                break for1
              }
            }
          }
        }
      }
  })
  webNavigation.onCompleted.addListener(detail => {
    console.log(detail)
    if (!enable) {
      console.log('已关闭')
      return
    }
    for (const profile of profiles) {
      for (const filter of profile.filters) {
        for (const preProc of filter.preProcess) {
          let method: PreProcessMethod, cssSelector: string | undefined
          if (matchHost(preProc.preProcessDetail, detail.url, preProc.preProcessType) && preProc.preProcessMethod) {
            method = preProc.preProcessMethod
            cssSelector = preProc.preProcessSelector || ''
            scripting
              .executeScript({
                target: {
                  tabId: detail.tabId,
                  allFrames: true
                },
                world: 'MAIN',
                args: [filter.getUrl, cssSelector],
                func: preProcessFunc[method!]
              })
              .then(() => {
                filter.count += 1
                saveProfiles()
              })
          }
        }
      }
    }
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
