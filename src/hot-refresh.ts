// 加上开发环境的判断
// 最终打包时 tree shaking 会移除这段用不到的代码
if (import.meta.env.DEV) {
  console.log('热重载客户端启动');

  const ws = new WebSocket(`ws://localhost:${process.env.build_notifier_port ||14514}`)

  ws.onmessage = (event) => {
    let msg = JSON.parse(event.data)
    if (msg === 'watch-build-ok') {
      window.location.reload()//刷新页面
      // chrome.runtime.reload()//刷新插件
    }
  }
}
