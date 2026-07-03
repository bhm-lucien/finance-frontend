/**
 * 自選股監控面板 — 即時報價表格 + 異動警報
 */
import { useEffect, useState, useRef } from 'react'
import { getStockName } from '../data/stockNames'
import { fetchBatchRealtime } from '../services/api'

interface WatchlistPanelProps {
  isOpen: boolean
  onClose: () => void
  watchlist: string[]
  currentStock: string
  onSelect: (stockId: string) => void
  onAdd: (stockId: string) => void
  onRemove: (stockId: string) => void
}

interface QuoteData {
  stock_id: string
  price: number
  change_pct: number
  change: number
  volume: number
  high: number
  low: number
  name?: string
}

export default function WatchlistPanel({
  isOpen, onClose, watchlist, currentStock, onSelect, onAdd, onRemove
}: WatchlistPanelProps) {
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({})
  const [alerts, setAlerts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const prevQuotes = useRef<Record<string, QuoteData>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 載入即時報價
  useEffect(() => {
    if (isOpen && watchlist.length > 0) {
      loadQuotes()
      // 每 30 秒刷新
      intervalRef.current = setInterval(loadQuotes, 30000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isOpen, watchlist])

  async function loadQuotes() {
    if (watchlist.length === 0) return
    setLoading(true)
    try {
      const result = await fetchBatchRealtime(watchlist)
      const newQuotes: Record<string, QuoteData> = {}
      const newAlerts: string[] = []

      for (const q of result.quotes) {
        newQuotes[q.stock_id] = q

        // 異動偵測
        const prev = prevQuotes.current[q.stock_id]
        if (prev) {
          // 漲幅突然加大
          if (q.change_pct > 3 && prev.change_pct <= 3) {
            newAlerts.push(`🚀 ${q.stock_id} ${getStockName(q.stock_id)} 漲幅突破 3%！目前 +${q.change_pct.toFixed(1)}%`)
          }
          // 跌幅加大
          if (q.change_pct < -3 && prev.change_pct >= -3) {
            newAlerts.push(`⚠️ ${q.stock_id} ${getStockName(q.stock_id)} 跌幅超過 3%！目前 ${q.change_pct.toFixed(1)}%`)
          }
          // 量能爆發（成交量突然增加 50%）
          if (prev.volume > 0 && q.volume > prev.volume * 1.5) {
            newAlerts.push(`📊 ${q.stock_id} ${getStockName(q.stock_id)} 量能異常放大！`)
          }
        }
      }

      prevQuotes.current = newQuotes
      setQuotes(newQuotes)
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 10))
      }
    } catch (e) {
      console.error('批量報價失敗:', e)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* 遮罩 */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* 面板 */}
      <div className="fixed top-0 right-0 h-full w-[420px] z-50 bg-dark-card border-l border-dark-border shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-dark-border flex-shrink-0">
          <h2 className="text-sm font-bold text-neon-blue">📊 自選股監控面板</h2>
          <div className="flex items-center gap-2">
            {loading && <span className="text-[10px] text-gray-500">更新中...</span>}
            <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">✕</button>
          </div>
        </div>

        {/* 新增輸入 */}
        <div className="p-2 border-b border-dark-border flex-shrink-0">
          <form onSubmit={(e) => {
            e.preventDefault()
            const input = (e.target as HTMLFormElement).elements.namedItem('stockInput') as HTMLInputElement
            const val = input.value.trim()
            if (val && /^\d{4,6}$/.test(val)) {
              onAdd(val)
              input.value = ''
            }
          }}>
            <div className="flex gap-2">
              <input
                name="stockInput"
                type="text"
                placeholder="輸入代碼加入監控"
                className="flex-1 px-2.5 py-1.5 text-xs bg-dark-bg border border-dark-border rounded text-white placeholder-gray-500 focus:border-neon-blue/50 focus:outline-none"
                maxLength={6}
              />
              <button type="submit" className="px-3 py-1.5 text-xs bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30">
                加入
              </button>
            </div>
          </form>
        </div>

        {/* 異動警報 */}
        {alerts.length > 0 && (
          <div className="px-2 py-1.5 border-b border-dark-border/50 max-h-24 overflow-y-auto flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-neon-orange font-bold">🔔 異動警報</span>
              <button onClick={() => setAlerts([])} className="text-[10px] text-gray-500 hover:text-gray-300">清除</button>
            </div>
            {alerts.map((alert, i) => (
              <p key={i} className="text-[10px] text-gray-300 py-0.5">{alert}</p>
            ))}
          </div>
        )}

        {/* 即時報價表格 */}
        <div className="flex-1 overflow-y-auto">
          {watchlist.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-8">尚無自選股</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-dark-card z-10">
                <tr className="text-gray-500 border-b border-dark-border/50">
                  <th className="text-left py-2 px-2">代碼</th>
                  <th className="text-left py-2">名稱</th>
                  <th className="text-right py-2">現價</th>
                  <th className="text-right py-2">漲跌%</th>
                  <th className="text-right py-2">成交量</th>
                  <th className="text-center py-2 px-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map(id => {
                  const q = quotes[id]
                  const isUp = (q?.change_pct ?? 0) > 0
                  const isDown = (q?.change_pct ?? 0) < 0
                  return (
                    <tr
                      key={id}
                      className={`border-b border-dark-border/10 cursor-pointer transition ${
                        id === currentStock ? 'bg-neon-blue/10' : 'hover:bg-dark-surface/50'
                      }`}
                      onClick={() => onSelect(id)}
                    >
                      <td className="py-2 px-2 text-white font-medium">{id}</td>
                      <td className="py-2 text-gray-300">{getStockName(id)}</td>
                      <td className="py-2 text-right text-white font-medium">
                        {q?.price ? q.price.toFixed(2) : '--'}
                      </td>
                      <td className={`py-2 text-right font-bold ${isUp ? 'text-neon-red' : isDown ? 'text-neon-green' : 'text-gray-400'}`}>
                        {q?.change_pct !== undefined ? `${isUp ? '+' : ''}${q.change_pct.toFixed(2)}%` : '--'}
                      </td>
                      <td className="py-2 text-right text-gray-400">
                        {q?.volume ? `${(q.volume / 1000).toFixed(0)}K` : '--'}
                      </td>
                      <td className="py-2 text-center px-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemove(id) }}
                          className="text-gray-600 hover:text-neon-red"
                        >✕</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-2 border-t border-dark-border text-[9px] text-gray-600 text-center flex-shrink-0">
          自選股存儲在本機 | 每 30 秒自動更新報價
        </div>
      </div>
    </>
  )
}
