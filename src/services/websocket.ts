/**
 * WebSocket 服務 — 連接後端即時報價推播
 *
 * 負責：
 * 1. 建立/管理與後端的 WebSocket 連線
 * 2. 訂閱/取消訂閱股票即時報價
 * 3. 自動重連
 * 4. 分發報價更新給訂閱者
 */

type QuoteData = {
  price: number
  open: number
  high: number
  low: number
  yesterday_close: number
  volume: number
  single_volume: number
  change: number
  change_pct: number
  bid: number
  ask: number
  time: string
  name: string
  is_realtime: boolean
  source: string
}

type MessageHandler = (symbol: string, data: QuoteData) => void

// WebSocket 連線狀態
let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10
const RECONNECT_DELAY = 3000 // 3 秒

// 訂閱者管理：每個 symbol 可以有多個 listener
const listeners: Map<string, Set<MessageHandler>> = new Map()

// 全域狀態 listener
type StatusHandler = (connected: boolean) => void
const statusListeners: Set<StatusHandler> = new Set()

function getWsUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || ''

  if (apiUrl) {
    // 從 API URL 推導 WebSocket URL
    const url = new URL(apiUrl)
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    // 移除路徑中的 /api 部分
    const basePath = url.pathname.replace(/\/api\/?$/, '')
    return `${protocol}//${url.host}${basePath}/ws/quotes`
  }

  // 開發環境預設
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.hostname}:8000/ws/quotes`
}

function notifyStatus(connected: boolean) {
  statusListeners.forEach(handler => handler(connected))
}

function connect() {
  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) {
    return
  }

  const url = getWsUrl()
  ws = new WebSocket(url)

  ws.onopen = () => {
    console.log('[WS] 已連線至即時報價服務')
    reconnectAttempts = 0
    notifyStatus(true)

    // 重新訂閱所有已註冊的 symbol
    listeners.forEach((_handlers, symbol) => {
      ws?.send(JSON.stringify({ action: 'subscribe', symbol }))
    })
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)

      if (msg.type === 'quote_update') {
        const symbol = msg.symbol as string
        const data = msg.data as QuoteData
        const handlers = listeners.get(symbol)
        if (handlers) {
          handlers.forEach(handler => handler(symbol, data))
        }
      }
    } catch (e) {
      console.error('[WS] 解析訊息失敗:', e)
    }
  }

  ws.onclose = () => {
    console.log('[WS] 連線已關閉')
    notifyStatus(false)
    scheduleReconnect()
  }

  ws.onerror = (error) => {
    console.error('[WS] 連線錯誤:', error)
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn('[WS] 已達最大重連次數，停止重連')
    return
  }

  reconnectAttempts++
  const delay = RECONNECT_DELAY * Math.min(reconnectAttempts, 5)
  console.log(`[WS] ${delay / 1000} 秒後嘗試重連 (第 ${reconnectAttempts} 次)`)

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    connect()
  }, delay)
}

/**
 * 訂閱一檔股票的即時報價
 * @returns 取消訂閱的函式
 */
export function subscribeQuote(symbol: string, handler: MessageHandler): () => void {
  // 確保 WebSocket 已連線
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connect()
  }

  // 註冊 listener
  if (!listeners.has(symbol)) {
    listeners.set(symbol, new Set())

    // 如果 WebSocket 已開啟，立即訂閱
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'subscribe', symbol }))
    }
  }
  listeners.get(symbol)!.add(handler)

  // 回傳取消訂閱函式
  return () => {
    const handlers = listeners.get(symbol)
    if (handlers) {
      handlers.delete(handler)

      // 如果這個 symbol 沒有 listener 了，取消訂閱
      if (handlers.size === 0) {
        listeners.delete(symbol)
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: 'unsubscribe', symbol }))
        }
      }
    }
  }
}

/**
 * 監聽連線狀態變化
 * @returns 取消監聽的函式
 */
export function onConnectionStatus(handler: StatusHandler): () => void {
  statusListeners.add(handler)
  // 立即通知目前狀態
  handler(ws?.readyState === WebSocket.OPEN)
  return () => {
    statusListeners.delete(handler)
  }
}

/**
 * 手動斷線（頁面離開時呼叫）
 */
export function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (ws) {
    ws.close()
    ws = null
  }
}

/**
 * 取得目前連線狀態
 */
export function isConnected(): boolean {
  return ws?.readyState === WebSocket.OPEN
}
