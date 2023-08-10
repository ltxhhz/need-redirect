import type { Profile } from '@/types'
const { webNavigation, storage, tabs } = chrome
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
    console.log('触发')
    console.log('navigation', detail)
    profiles.some((e, i) => {
      if (e.filters.some(e => matchHost(e.detail, detail.url, e.type == 'wildcard'))) {
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
})

storage.local.onChanged.addListener(e => {
  if (e.profiles?.newValue) {
    profiles = e.profiles.newValue
  } else if (e.enable?.newValue != undefined) {
    enable = e.enable.newValue
  }
})

function matchHost(pattern: string, url: string, wildcard = false) {
  return new RegExp(wildcard ? pattern.replace(/\*/g, '[^.]*') : pattern).test(new URL(url).host)
}

function countPlus(profile: Profile, index: number) {
  const arr = [...profiles]
  profile.count++
  arr[index] = profile
  return storage.local.set({
    profiles: arr
  })
}
