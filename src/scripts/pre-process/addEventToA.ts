export function addEventToA(selector: string) {
  document.querySelectorAll(selector).forEach(a => {
    a.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      open(a.href)
    })
  })
}
