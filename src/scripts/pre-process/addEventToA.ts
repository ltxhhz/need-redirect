import { GetUrl } from '@/types'

export function addEventToA(_: GetUrl, selector?: string) {
  if (!selector) {
    selector = 'a[href]'
  }
  let num = 0
  document.querySelectorAll<HTMLAnchorElement>(selector).forEach(a => {
    if (/^(https?|ftp):\/\/|^\.\/|^\..\/|^\/?\w+\/?/.test(a.href)) {
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
