/**
 * 相關性分析頁面
 * 自選股漲跌相關性矩陣
 */
import { useEffect, useState } from 'react'
import { fetchCorrelationMatrix } from '../services/api'

interface Props {
  watchlist: string[]
}

export default function CorrelationPage({ watchlist }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [days, setDays] = useState(60)

  useEffect(() => {
    if (watchlist.length >= 2) {
      loadCorrelation()
    }
  }, [watchlist, days])

  async function loadCorrelation() {
    setLoading(true)
    try {
      const result = await fetchCorrelationMatrix(watchlist, days)
      setData(result)
    } catch (e) {
      console.error('相關性分析失敗:', e)
    } finally {
      setLoading(false)
    }
  }

  if (watchlist.length < 2) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm">至少需要 2 檔自選股才能計算相關性</p>
          <p className="text-gray-500 text-xs mt-1">請先在自選股清單中加入股票</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 頂部 */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-dark-border/50 flex-shrink-0">
        <h2 className="text-sm font-bold text-neon-blue">🔗 相關性分析</h2>
        <span className="text-gray-500 text-xs">（自選股 {watchlist.length} 檔）</span>
        <div className="flex gap-1 ml-auto">
          {[30, 60, 90].map(d => (
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
        {/* 左側：相關性矩陣 */}
        <div className="flex-1 bg-dark-card rounded-lg border border-dark-border/50 overflow-auto p-3">
          {loading ? (
            <p className="text-gray-500 text-xs text-center py-8">計算中...</p>
          ) : data?.matrix?.length > 0 ? (
            <div className="overflow-auto">
              <table className="text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-1.5 text-gray-500"></th>
                    {data.stocks.map((sid: string, i: number) => (
                      <th key={sid} className="p-1.5 text-gray-300 font-medium text-center min-w-[50px]">
                        <div className="text-[10px]">{data.names[i]}</div>
                        <div className="text-gray-500">{sid}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.stocks.map((sid: string, i: number) => (
                    <tr key={sid}>
                      <td className="p-1.5 text-gray-300 font-medium whitespace-nowrap">
                        <span className="text-[10px]">{data.names[i]}</span>
                        <span className="text-gray-500 ml-1">{sid}</span>
                      </td>
                      {data.matrix[i].map((val: number, j: number) => (
                        <td
                          key={j}
                          className="p-1.5 text-center font-mono min-w-[50px]"
                          style={{ backgroundColor: getCorrColor(val, i === j) }}
                        >
                          <span className={`text-[10px] font-bold ${i === j ? 'text-gray-400' : 'text-white'}`}>
                            {i === j ? '-' : val.toFixed(2)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-xs text-center py-8">無資料</p>
          )}
        </div>

        {/* 右側：高/低相關性配對 */}
        <div className="w-64 flex flex-col gap-3 flex-shrink-0">
          {/* 高相關性 */}
          <div className="flex-1 bg-dark-card rounded-lg border border-dark-border/50 overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-dark-border/30 flex-shrink-0">
              <h3 className="text-xs font-bold text-neon-orange">⚠️ 高相關性（≥0.7）</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">漲跌同步，分散效果差</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {(data?.high_corr_pairs ?? []).length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">無高相關配對 ✓</p>
              ) : (
                <div className="space-y-1.5">
                  {data.high_corr_pairs.map((pair: any, i: number) => (
                    <div key={i} className="p-1.5 rounded bg-neon-orange/5 border border-neon-orange/20">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-[10px]">{pair.name_a} ↔ {pair.name_b}</span>
                        <span className="text-neon-orange font-bold text-xs">{pair.corr.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 低相關性 */}
          <div className="flex-1 bg-dark-card rounded-lg border border-dark-border/50 overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-dark-border/30 flex-shrink-0">
              <h3 className="text-xs font-bold text-neon-green">✓ 低相關性（≤0.2）</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">走勢獨立，分散效果佳</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {(data?.low_corr_pairs ?? []).length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">無低相關配對</p>
              ) : (
                <div className="space-y-1.5">
                  {data.low_corr_pairs.map((pair: any, i: number) => (
                    <div key={i} className="p-1.5 rounded bg-neon-green/5 border border-neon-green/20">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-[10px]">{pair.name_a} ↔ {pair.name_b}</span>
                        <span className="text-neon-green font-bold text-xs">{pair.corr.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 圖例 */}
          <div className="bg-dark-card rounded-lg border border-dark-border/50 p-2">
            <p className="text-[10px] text-gray-500 mb-1">相關性數值說明：</p>
            <div className="flex items-center gap-1 text-[9px]">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(244,67,54,0.6)' }}></span>
              <span className="text-gray-400">≥0.7 高度正相關</span>
            </div>
            <div className="flex items-center gap-1 text-[9px]">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(66,66,66,0.6)' }}></span>
              <span className="text-gray-400">≈0 無相關</span>
            </div>
            <div className="flex items-center gap-1 text-[9px]">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(76,175,80,0.6)' }}></span>
              <span className="text-gray-400">≤-0.3 負相關</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCorrColor(val: number, isDiagonal: boolean): string {
  if (isDiagonal) return 'rgba(30,30,50,0.5)'
  if (val >= 0.7) return 'rgba(244,67,54,0.4)'
  if (val >= 0.5) return 'rgba(255,152,0,0.3)'
  if (val >= 0.3) return 'rgba(255,193,7,0.2)'
  if (val >= -0.3) return 'rgba(66,66,66,0.3)'
  return 'rgba(76,175,80,0.3)'
}
