/**
 * 籌碼連續性分析頁面
 * 顯示外資/投信連買排行、大戶持股、融資融券
 */
import { useEffect, useState } from 'react'
import { fetchChipContinuityRanking, fetchChipContinuity } from '../services/api'

interface Props {
  onSelectStock?: (stockId: string) => void
}

export default function ChipContinuityPage({ onSelectStock }: Props) {
  const [ranking, setRanking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [selectedStock, setSelectedStock] = useState<any>(null)

  useEffect(() => {
    loadRanking()
  }, [days])

  async function loadRanking() {
    setLoading(true)
    try {
      const result = await fetchChipContinuityRanking(20, days)
      setRanking(result)
    } catch (e) {
      console.error('載入連買排行失敗:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleStockClick(stockId: string) {
    try {
      const detail = await fetchChipContinuity(stockId, days)
      setSelectedStock(detail)
    } catch (e) {
      console.error('載入籌碼明細失敗:', e)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 頂部控制列 */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-dark-border/50 flex-shrink-0">
        <h2 className="text-sm font-bold text-neon-blue">📊 籌碼連續性分析</h2>
        <div className="flex gap-1 ml-auto">
          {[10, 20, 30, 60].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-2 py-0.5 text-xs rounded ${days === d ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {d}日
            </button>
          ))}
        </div>
      </div>

      {/* 主要內容 */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        {/* 左側：排行榜 */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* 外資連買排行 */}
          <div className="flex-1 bg-dark-card rounded-lg border border-dark-border/50 overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-dark-border/30 flex-shrink-0">
              <h3 className="text-xs font-bold text-neon-red">🏦 外資連買排行</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-1">
              {loading ? (
                <p className="text-gray-500 text-xs text-center py-4">載入中...</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-dark-border/30">
                      <th className="text-left py-1 px-1">#</th>
                      <th className="text-left py-1">代碼</th>
                      <th className="text-left py-1">名稱</th>
                      <th className="text-right py-1">連買天</th>
                      <th className="text-right py-1 pr-1">累計(張)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ranking?.foreign_top ?? []).map((item: any, i: number) => (
                      <tr
                        key={item.stock_id}
                        className="hover:bg-dark-surface/50 cursor-pointer border-b border-dark-border/10"
                        onClick={() => { handleStockClick(item.stock_id); onSelectStock?.(item.stock_id) }}
                      >
                        <td className="py-1 px-1 text-gray-500">{i + 1}</td>
                        <td className="py-1 text-white font-medium">{item.stock_id}</td>
                        <td className="py-1 text-gray-300">{item.name}</td>
                        <td className="py-1 text-right text-neon-red font-bold">{item.streak}</td>
                        <td className="py-1 text-right pr-1 text-gray-400">{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 投信連買排行 */}
          <div className="flex-1 bg-dark-card rounded-lg border border-dark-border/50 overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-dark-border/30 flex-shrink-0">
              <h3 className="text-xs font-bold text-neon-purple">🏛️ 投信連買排行</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-1">
              {loading ? (
                <p className="text-gray-500 text-xs text-center py-4">載入中...</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-dark-border/30">
                      <th className="text-left py-1 px-1">#</th>
                      <th className="text-left py-1">代碼</th>
                      <th className="text-left py-1">名稱</th>
                      <th className="text-right py-1">連買天</th>
                      <th className="text-right py-1 pr-1">累計(張)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ranking?.trust_top ?? []).map((item: any, i: number) => (
                      <tr
                        key={item.stock_id}
                        className="hover:bg-dark-surface/50 cursor-pointer border-b border-dark-border/10"
                        onClick={() => { handleStockClick(item.stock_id); onSelectStock?.(item.stock_id) }}
                      >
                        <td className="py-1 px-1 text-gray-500">{i + 1}</td>
                        <td className="py-1 text-white font-medium">{item.stock_id}</td>
                        <td className="py-1 text-gray-300">{item.name}</td>
                        <td className="py-1 text-right text-neon-purple font-bold">{item.streak}</td>
                        <td className="py-1 text-right pr-1 text-gray-400">{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* 右側：個股明細 */}
        <div className="w-72 bg-dark-card rounded-lg border border-dark-border/50 overflow-hidden flex flex-col flex-shrink-0">
          <div className="px-3 py-2 border-b border-dark-border/30 flex-shrink-0">
            <h3 className="text-xs font-bold text-gray-300">📋 個股籌碼明細</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {!selectedStock ? (
              <p className="text-gray-500 text-xs text-center py-8">點擊左側排行榜查看明細</p>
            ) : (
              <div className="space-y-3">
                <div className="text-center pb-2 border-b border-dark-border/30">
                  <p className="text-white font-bold">{selectedStock.stock_id}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">外資連買</span>
                    <span className={`font-bold ${selectedStock.foreign_streak > 0 ? 'text-neon-red' : selectedStock.foreign_streak < 0 ? 'text-neon-green' : 'text-gray-400'}`}>
                      {selectedStock.foreign_streak > 0 ? `連買 ${selectedStock.foreign_streak} 天` : selectedStock.foreign_streak < 0 ? `連賣 ${Math.abs(selectedStock.foreign_streak)} 天` : '無連續'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">外資累計</span>
                    <span className={`${selectedStock.foreign_total > 0 ? 'text-neon-red' : 'text-neon-green'}`}>
                      {selectedStock.foreign_total > 0 ? '+' : ''}{selectedStock.foreign_total.toLocaleString()} 張
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">投信連買</span>
                    <span className={`font-bold ${selectedStock.trust_streak > 0 ? 'text-neon-red' : selectedStock.trust_streak < 0 ? 'text-neon-green' : 'text-gray-400'}`}>
                      {selectedStock.trust_streak > 0 ? `連買 ${selectedStock.trust_streak} 天` : selectedStock.trust_streak < 0 ? `連賣 ${Math.abs(selectedStock.trust_streak)} 天` : '無連續'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">投信累計</span>
                    <span className={`${selectedStock.trust_total > 0 ? 'text-neon-red' : 'text-neon-green'}`}>
                      {selectedStock.trust_total > 0 ? '+' : ''}{selectedStock.trust_total.toLocaleString()} 張
                    </span>
                  </div>
                </div>

                <div className="border-t border-dark-border/30 pt-2 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">融資趨勢</span>
                    <span className={`${selectedStock.margin_trend === '增加' ? 'text-neon-orange' : selectedStock.margin_trend === '減少' ? 'text-neon-blue' : 'text-gray-400'}`}>
                      {selectedStock.margin_trend}（{selectedStock.margin_change > 0 ? '+' : ''}{selectedStock.margin_change.toLocaleString()}張）
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">融券趨勢</span>
                    <span className={`${selectedStock.short_trend === '增加' ? 'text-neon-orange' : selectedStock.short_trend === '減少' ? 'text-neon-blue' : 'text-gray-400'}`}>
                      {selectedStock.short_trend}（{selectedStock.short_change > 0 ? '+' : ''}{selectedStock.short_change.toLocaleString()}張）
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">大戶持股變化</span>
                    <span className={`font-bold ${selectedStock.big_holder_change > 0 ? 'text-neon-red' : 'text-neon-green'}`}>
                      {selectedStock.big_holder_change > 0 ? '+' : ''}{selectedStock.big_holder_change}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
