

export function replaceHref(key:string) {
  document.querySelectorAll('a').forEach(e => {
    const value = new URL(e.href).searchParams.get(key)
    if (value) {
      e.href = value
    }
  })
}