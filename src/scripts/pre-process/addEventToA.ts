import { GetUrl } from '@/types'

export function addEventToA(_: GetUrl, selector?: string) {
  if (!selector) {
    selector = 'a[href]'
  }
  const extractDomain = (url: string) => {
    // 匹配顶级域名和二级域名
    const domain = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)(?:\.[^:\/\n?\.\s]+){1,2}/gim)

    // 提取顶级域名和二级域名
    if (domain !== null && domain.length > 0) {
      return domain[0].replace(/^https?:\/\//i, '').replace(/^www\./i, '')
    }
  }
  let num = 0
  document.querySelectorAll<HTMLAnchorElement>(selector).forEach(a => {
    if (/^(https?|ftp):\/\/|^\.\/|^\..\/|^\/?\w+\/?/.test(a.href) && extractDomain(a.href) != extractDomain(location.href)) {
      a.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        open(a.href)
      })
      num++
    }
  })
  console.log(`已修改 ${num} 个链接`)
  return num
}
