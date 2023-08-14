export function replaceHref(key: string) {
  document.querySelectorAll('a').forEach(e => {
    try {
      const value = new URL(e.href).searchParams.get(key)
      if (value) {
        e.href = value
      }
    } catch (error) {}
  })
}
