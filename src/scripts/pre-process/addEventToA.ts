export function addEventToA(selector: string) {
  selector = 'a' //todo 配置及使用传参
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
