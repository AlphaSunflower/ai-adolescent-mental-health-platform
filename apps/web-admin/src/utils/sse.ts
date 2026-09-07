export interface SseOptions {
  url: string
  token?: string | null
  onMessage: (data: string) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (err: unknown) => void
  maxReconnect?: number
  reconnectDelay?: number
}

export interface SseHandle {
  close: () => void
}

/**
 * 用 fetch + ReadableStream 订阅 SSE 事件流。
 *
 * fetch 可以携带 `Authorization: Bearer` 头，避免像 EventSource 那样把 JWT 拼进
 * URL（URL 会落到 nginx/代理日志、浏览器历史与 Referer，属令牌泄露）。
 *
 * 返回 { close }，在组件卸载时调用以关闭连接并停止重连。
 */
export function sseSubscribe(opts: SseOptions): SseHandle {
  const {
    url,
    token,
    onMessage,
    onOpen,
    onClose,
    onError,
    maxReconnect = 3,
    reconnectDelay = 3000,
  } = opts

  let controller: AbortController | null = null
  let closed = false
  let reconnectCount = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  const connect = async () => {
    if (closed) return
    controller = new AbortController()
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
      })

      if (!res.ok) throw new Error(`SSE 连接失败: ${res.status}`)

      const body = res.body
      if (!body) throw new Error('SSE 无响应流')

      onOpen?.()

      const reader = body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (!closed) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        let sepIndex: number
        while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, sepIndex)
          buffer = buffer.slice(sepIndex + 2)
          const dataLine = frame
            .split('\n')
            .find((line) => line.startsWith('data:'))
            ?.slice(5)
          if (dataLine) onMessage(dataLine.trim())
        }
      }

      if (!closed) throw new Error('SSE 连接被服务端关闭')
    } catch (err) {
      if (closed) return
      onError?.(err)
      if (reconnectCount < maxReconnect) {
        reconnectCount += 1
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null
          void connect()
        }, reconnectDelay)
      }
    } finally {
      if (closed) onClose?.()
    }
  }

  void connect()

  return {
    close: () => {
      closed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      controller?.abort()
    },
  }
}
