import { GetUrl } from '@/types'

export function replaceHref(getUrl: GetUrl, selector?: string) {
  if (!selector) {
    selector = 'a[href]'
  }
  console.log('开始处理', selector)
  let num = 0
  document.querySelectorAll<HTMLAnchorElement>(selector).forEach(e => {
    try {
      if (getUrl.type === 'searchParams') {
        const value = new URL(e.href).searchParams.get(getUrl.key)
        if (value) {
          if (getUrl.base64) {
            e.href = btoa(value)
          } else {
            e.href = value
          }
          num++
        }
      } else if (getUrl.type === 'path') {
        let regStr = getUrl.key
        let num = 1
        if (getUrl.key.startsWith('/')) {
          const res = getUrl.key.match(/^\/(.+)\/\[(\d+)\]$/)
          if (res) {
            regStr = res[1]
            num = Number(res[2])
          }
        }
        const re = new RegExp(regStr)
        const value = e.href.match(re)?.[num]
        if (value) {
          if (getUrl.base64) {
            e.href = btoa(value)
          } else {
            e.href = value
          }
          num++
        }
      }
    } catch (error) {}
  })
  console.log(`已修改 ${num} 个链接`)
  return num
}
