const url = new URL(location.href)
const target = url.searchParams.get("url")
const base64 = Boolean(url.searchParams.get("base64"))
console.log("target", target)

if (target) {
  document.body.innerHTML += `如果你看到这行字说明插件已经识别到二次跳转url并且正在重定向如果<br/>你能读完这句话说明目标网址响应太慢了，而这并不是插件的问题`
  location.href = target
} else {
  document.writeln("没有有效的跳转参数")
}
