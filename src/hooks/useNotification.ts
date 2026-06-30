/**
 * 瀏覽器通知 Hook — 燈號變化或風險超標時推播
 */
import { useEffect, useRef } from 'react'

interface NotificationConfig {
  enabled: boolean
  stockId: string
  signalLight: string | null
  riskLevel: string | null
  dayTradeRisk: number | null
}

export function useNotification(config: NotificationConfig) {
  const prevSignal = useRef<string | null>(null)
  const prevRisk = useRef<string | null>(null)

  // 請求通知權限
  useEffect(() => {
    if (config.enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [config.enabled])

  // 監控燈號變化
  useEffect(() => {
    if (!config.enabled || !config.signalLight) return
    if (Notification.permission !== 'granted') return

    // 首次載入不通知
    if (prevSignal.current === null) {
      prevSignal.current = config.signalLight
      return
    }

    // 燈號變化時通知
    if (prevSignal.current !== config.signalLight) {
      const lightLabels: Record<string, string> = {
        red: '🔴 紅燈：主力出貨',
        orange: '🟠 黃橙：過熱整理',
        green: '🟢 綠燈：低檔轉強',
        black: '⚫ 黑燈：跌破趨勢',
      }

      new Notification(`${config.stockId} 燈號變化`, {
        body: lightLabels[config.signalLight] ?? '燈號已更新',
        icon: '/favicon.ico',
        tag: `signal-${config.stockId}`,
      })

      prevSignal.current = config.signalLight
    }
  }, [config.signalLight, config.enabled, config.stockId])

  // 風險等級變化通知
  useEffect(() => {
    if (!config.enabled || !config.riskLevel) return
    if (Notification.permission !== 'granted') return

    if (prevRisk.current === null) {
      prevRisk.current = config.riskLevel
      return
    }

    if (prevRisk.current !== config.riskLevel && config.riskLevel === '高') {
      new Notification(`${config.stockId} 風險警告`, {
        body: `⚠️ 風險等級升高至「${config.riskLevel}」，請注意風險控管`,
        icon: '/favicon.ico',
        tag: `risk-${config.stockId}`,
      })
      prevRisk.current = config.riskLevel
    }
  }, [config.riskLevel, config.enabled, config.stockId])

  // 隔日沖風險超標
  useEffect(() => {
    if (!config.enabled || config.dayTradeRisk === null) return
    if (Notification.permission !== 'granted') return

    if (config.dayTradeRisk >= 80) {
      new Notification(`${config.stockId} 隔日沖風險超標`, {
        body: `⚠️ 隔日沖風險 ${config.dayTradeRisk}%，明日開盤有出貨壓力`,
        icon: '/favicon.ico',
        tag: `daytrade-${config.stockId}`,
      })
    }
  }, [config.dayTradeRisk, config.enabled, config.stockId])
}
