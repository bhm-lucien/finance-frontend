/**
 * 策略回測面板
 * 對當前股票跑 16 種策略回測，顯示勝率/報酬/回撤排行
 */
import { useState, useEffect } from 'react'
import { runAllStrategiesBacktest, runStrategyBacktest } from '../services/api'

type StrategyResult = {
  id: string
  name: string
  category: string
  total_trades: number
  win_rate: number
  avg_return: number
  total_return: number
  max_drawdown: number
  profit_factor: number
}

type TradeDetail = {
  date: string
  type: string
  price: number
  exit_date: string
  exit_price: number
  return_pct: number
}

type Props = {
  isOpen: boolean
  onClose: () => void
  stockId: string
}

export default function BacktestPanel({ isOpen, onClose, stockId }: Props) {
  const [results, setResults] = useState<StrategyResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [detail, setDetail] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (isOpen && stockId) {
      loadAllStrategies()
    }
  }, [isOpen, stockId])

  async function loadAllStrategies() {
    setLoading(true)
    setResults([])
    setSelectedStrategy(null)
    setDetail(null)
    try {
      const data = await runAllStrategiesBacktest(stockId, 365)
      setResults(data.strategies || [])
    } catch (e) {
      console.error('回測失敗:', e)
    } finally {
      setLoading(false)
    }
  }

  async function loadDetail(strategyId: string) {
    setSelectedStrategy(strategyId)
    setDetailLoading(true)
    try {
      const data = await runStrategyBacktest(stockId, strategyId, 365)
      setDetail(data)
    } catch (e) {
      console.error('回測詳情載入失敗:', e)
    } finally {
      setDetailLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative ml-auto w-[560px] h-full bg-dark-card border-l border-dark-border overflow-y-auto">
        {/* 標題 */}
        <div className="sticky top-0 bg-dark-card border-b border-dark-border p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">📊 策略回測 — {stockId}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* 載入中 */}
          {loading && (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full mx-auto mb-2" />
              正在回測 16 種策略...
            </div>
          )}

          {/* 策略排行表 */}
          {!loading && results.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-300 mb-2">策略排行（按勝率）</h3>
              <div className="space-y-1">
                {results.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => loadDetail(r.id)}
                    className={`w-full text-left px-3 py-2 rounded border transition ${
                      selectedStrategy === r.id
                        ? 'border-neon-blue/50 bg-neon-blue/10'
                        : 'border-dark-border hover:border-gray-500 hover:bg-dark-surface/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 w-4">{i + 1}</span>
                        <span className="text-xs text-gray-200 font-medium">{r.name}</span>
                        <span className="text-[10px] px-1 py-0.5 rounded bg-dark-surface text-gray-500">{r.category}</span>
                      </div>
                      <span className={`text-sm font-bold ${r.win_rate >= 60 ? 'text-red-400' : r.win_rate >= 50 ? 'text-orange-400' : 'text-green-400'}`}>
                        {r.win_rate}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-[10px] text-gray-500">
                      <span>交易 {r.total_trades} 次</span>
                      <span>均報酬 {r.avg_return > 0 ? '+' : ''}{r.avg_return}%</span>
                      <span>累計 {r.total_return > 0 ? '+' : ''}{r.total_return}%</span>
                      <span>回撤 {r.max_drawdown}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 策略詳情 */}
          {selectedStrategy && (
            <div className="border-t border-dark-border pt-4">
              {detailLoading ? (
                <p className="text-gray-400 text-center py-4">載入詳情...</p>
              ) : detail ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-300">
                    {detail.strategy?.name} — 詳細結果
                  </h3>

                  {/* 績效摘要 */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded bg-dark-surface border border-dark-border">
                      <p className="text-[10px] text-gray-500">勝率</p>
                      <p className={`text-lg font-bold ${detail.win_rate >= 60 ? 'text-red-400' : 'text-orange-400'}`}>{detail.win_rate}%</p>
                    </div>
                    <div className="p-2 rounded bg-dark-surface border border-dark-border">
                      <p className="text-[10px] text-gray-500">累計報酬</p>
                      <p className={`text-lg font-bold ${detail.total_return >= 0 ? 'text-red-400' : 'text-green-400'}`}>{detail.total_return > 0 ? '+' : ''}{detail.total_return}%</p>
                    </div>
                    <div className="p-2 rounded bg-dark-surface border border-dark-border">
                      <p className="text-[10px] text-gray-500">獲利因子</p>
                      <p className="text-lg font-bold text-neon-blue">{detail.profit_factor}</p>
                    </div>
                  </div>

                  {/* 訓練/驗證比較 */}
                  {detail.train_result && detail.test_result && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded border border-dark-border">
                        <p className="text-[10px] text-gray-500 mb-1">訓練期（前 70%）</p>
                        <p className="text-xs text-gray-300">勝率 {detail.train_result.win_rate}%</p>
                        <p className="text-xs text-gray-300">報酬 {detail.train_result.total_return}%</p>
                      </div>
                      <div className="p-2 rounded border border-dark-border">
                        <p className="text-[10px] text-gray-500 mb-1">驗證期（後 30%）</p>
                        <p className="text-xs text-gray-300">勝率 {detail.test_result.win_rate}%</p>
                        <p className="text-xs text-gray-300">報酬 {detail.test_result.total_return}%</p>
                      </div>
                    </div>
                  )}

                  {/* 交易明細 */}
                  {detail.trades?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">最近交易明細</p>
                      <div className="max-h-40 overflow-y-auto space-y-0.5">
                        {detail.trades.map((t: TradeDetail, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] px-1 py-0.5 rounded hover:bg-dark-surface/50">
                            <span className="text-gray-500 w-16">{t.date}</span>
                            <span className={`w-6 ${t.type === '買入' ? 'text-red-400' : 'text-green-400'}`}>{t.type}</span>
                            <span className="text-gray-300 w-12">${t.price}</span>
                            <span className="text-gray-500">→</span>
                            <span className="text-gray-300 w-12">${t.exit_price}</span>
                            <span className={`font-bold ml-auto ${t.return_pct >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {t.return_pct >= 0 ? '+' : ''}{t.return_pct}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* 無結果 */}
          {!loading && results.length === 0 && (
            <p className="text-center text-gray-500 py-8">資料不足，無法執行回測</p>
          )}
        </div>
      </div>
    </div>
  )
}
