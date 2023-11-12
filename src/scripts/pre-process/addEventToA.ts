export function addEventToA(_: string, selector: string) {
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
