import type { Plugin } from "vite"
import { WebSocketServer, WebSocket } from "ws"

export default function (): Plugin {
  let wss: WebSocketServer | undefined
  let ws: WebSocket | undefined
  let timer: NodeJS.Timeout | undefined

  // 发送通知
  const send = (msg: string) => {
    if (!ws) return
    msg = JSON.stringify(msg)
    ws.send(msg)
  }

  // 清理资源
  // 如果不清空变量的引用，插件将不会自动退出
  const close = () => {
    ws && ws.close()
    wss && wss.close()
    clearTimeout(timer)
    ws = undefined
    wss = undefined
    timer = undefined
  }

  return {
    name: 'build-notifier',
    apply(config, { command }) {
      const canUse = command === 'build' && Boolean(config.build?.watch)
      if (canUse) {
        console.log('热重载服务端启动');

        wss = new WebSocketServer({ port: Number(process.env.build_notifier_port) || 14514 })
        wss.on('connection', (client) => {
          ws = client
        })
      }
      return canUse
    },
    closeBundle() {
      timer = setTimeout(() => send('watch-build-ok'), 500)
    },
    watchChange() {
      clearTimeout(timer)
    },
    closeWatcher() {
      close()
    }
  }
}
