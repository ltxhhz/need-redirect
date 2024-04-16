import { GetUrl } from "@/types"

export function addEventToA(_: GetUrl, selector?: string) {
  if (!selector) {
    selector = 'a[href]'
  }
  document.querySelectorAll<HTMLAnchorElement>(selector).forEach(a => {
    if (/^(https?|ftp):\/\/|^\.\/|^\..\/|^\/?\w+\/?/.test(a.href)) {
      a.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        open(a.href)
      })
    }
  })
}
