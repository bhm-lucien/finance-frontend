/**
 * 即時報價 Hook — 訂閱股票即時報價推播
 *
 * 使用方式：
 * const { quote, isConnected } = useRealtimeQuote('2330')
 *
 * quote 會隨著後端推播即時更新
 */
import { useState, useEffect, useRef } from 'react'
import { subscribeQuote, onConnectionStatus } from '../services/websocket'

export type RealtimeQuote = {
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

export function useRealtimeQuote(symbol: string | null) {
  const [quote, setQuote] = useState<RealtimeQuote | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const prevSymbol = useRef<string | null>(null)

  // 監聽連線狀態
  useEffect(() => {
    const unsubscribe = onConnectionStatus(setIsConnected)
    return unsubscribe
  }, [])

  // 訂閱報價
  useEffect(() => {
    if (!symbol) {
      setQuote(null)
      return
    }

    // 切換股票時清空舊資料
    if (prevSymbol.current !== symbol) {
      setQuote(null)
      prevSymbol.current = symbol
    }

    const unsubscribe = subscribeQuote(symbol, (_sym, data) => {
      setQuote(data)
    })

    return unsubscribe
  }, [symbol])

  return { quote, isConnected }
}
