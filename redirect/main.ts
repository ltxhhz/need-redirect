import type { Profile } from '@/pages/option/content.vue'
const url = new URL(location.href)
const target = url.searchParams.get('url')
const base64 = url.searchParams.get('base64') == 'true'
const id = url.searchParams.get('id')
console.log('target', target)

if (id) {
  chrome.storage.local.get(['profiles']).then(e => {
    for (const profile of <Profile[]>e.profiles) {
      if (profile.id + '' == id) {
        profile.count++
        chrome.storage.local.set({
          profiles: e.profiles
        })
        break
      }
    }
  })
}

if (target) {
  document.body.innerHTML += `如果你看到这行字说明插件已经识别到二次跳转url并且正在重定向如果<br/>你能读完这句话说明目标网址响应太慢了，而这并不是插件的问题`
  location.href = base64 ? atob(target) : target
} else {
  document.body.innerHTML = '没有有效的跳转参数'
}
