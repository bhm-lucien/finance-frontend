/**
 * AI 持倉健檢頁面
 * 使用者輸入持股張數和成本，AI 分析集中度風險、產業曝險、建議調整
 */
import { useState } from 'react'
import { fetchPortfolioHealth } from '../services/api'

interface Holding {
  stock_id: string
  shares: number
  cost: number
}

export default function PortfolioHealthPage() {
  const [holdings, setHoldings] = useState<Holding[]>([
    { stock_id: '', shares: 0, cost: 0 },
  ])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addRow() {
    setHoldings([...holdings, { stock_id: '', shares: 0, cost: 0 }])
  }

  function removeRow(index: number) {
    setHoldings(holdings.filter((_, i) => i !== index))
  }

  function updateRow(index: number, field: keyof Holding, value: string) {
    const updated = [...holdings]
    if (field === 'stock_id') {
      updated[index].stock_id = value
    } else {
      updated[index][field] = parseFloat(value) || 0
    }
    setHoldings(updated)
  }

  async function analyze() {
    const validHoldings = holdings.filter(h => h.stock_id && h.shares > 0 && h.cost > 0)
    if (validHoldings.length === 0) {
      setError('請至少輸入一筆有效持倉（代碼、股數、成本都需填寫）')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetchPortfolioHealth(validHoldings)
      setResult(res)
    } catch (e: any) {
      setError(e?.response?.data?.detail || '分析失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 頂部 */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-dark-border/50 flex-shrink-0">
        <h2 className="text-sm font-bold text-neon-blue">🏥 AI 持倉健檢</h2>
        <span className="text-gray-500 text-xs">輸入持倉資訊，AI 分析風險並提供建議</span>
      </div>

      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        {/* 左側：輸入區 */}
        <div className="w-96 bg-dark-card rounded-lg border border-dark-border/50 overflow-hidden flex flex-col flex-shrink-0">
          <div className="px-3 py-2 border-b border-dark-border/30 flex items-center justify-between flex-shrink-0">
            <h3 className="text-xs font-bold text-gray-300">📝 持倉清單</h3>
            <button onClick={addRow} className="px-2 py-0.5 text-xs bg-neon-blue/20 text-neon-blue rounded hover:bg-neon-blue/30">
              + 新增
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {/* 表頭 */}
            <div className="grid grid-cols-[80px_70px_80px_30px] gap-1 mb-1 text-[10px] text-gray-500 px-1">
              <span>代碼</span>
              <span>股數</span>
              <span>成本</span>
              <span></span>
            </div>

            {holdings.map((h, i) => (
              <div key={i} className="grid grid-cols-[80px_70px_80px_30px] gap-1 mb-1">
                <input
                  type="text"
                  value={h.stock_id}
                  onChange={e => updateRow(i, 'stock_id', e.target.value)}
                  placeholder="2330"
                  className="px-1.5 py-1 text-xs bg-dark-bg border border-dark-border rounded text-white placeholder-gray-600 focus:border-neon-blue/50 focus:outline-none"
                  maxLength={6}
                />
                <input
                  type="number"
                  value={h.shares || ''}
                  onChange={e => updateRow(i, 'shares', e.target.value)}
                  placeholder="1000"
                  className="px-1.5 py-1 text-xs bg-dark-bg border border-dark-border rounded text-white placeholder-gray-600 focus:border-neon-blue/50 focus:outline-none"
                />
                <input
                  type="number"
                  value={h.cost || ''}
                  onChange={e => updateRow(i, 'cost', e.target.value)}
                  placeholder="580"
                  className="px-1.5 py-1 text-xs bg-dark-bg border border-dark-border rounded text-white placeholder-gray-600 focus:border-neon-blue/50 focus:outline-none"
                />
                <button
                  onClick={() => removeRow(i)}
                  className="text-gray-600 hover:text-neon-red text-xs"
                >✕</button>
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-dark-border/30 flex-shrink-0">
            {error && <p className="text-neon-red text-xs mb-1">{error}</p>}
            <button
              onClick={analyze}
              disabled={loading}
              className="w-full py-2 text-sm bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30 disabled:opacity-50"
            >
              {loading ? '分析中...' : '🔍 開始健檢'}
            </button>
          </div>
        </div>

        {/* 右側：結果 */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {!result ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 text-sm">填寫左側持倉資料後點擊「開始健檢」</p>
            </div>
          ) : (
            <>
              {/* 總覽 */}
              <div className="bg-dark-card rounded-lg border border-dark-border/50 p-3">
                <h3 className="text-xs font-bold text-gray-300 mb-2">📊 持倉總覽</h3>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-gray-500 text-[10px]">總市值</p>
                    <p className="text-white font-bold text-sm">{(result.total_value / 10000).toFixed(1)}萬</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px]">總損益</p>
                    <p className={`font-bold text-sm ${result.total_pnl >= 0 ? 'text-neon-red' : 'text-neon-green'}`}>
                      {result.total_pnl >= 0 ? '+' : ''}{(result.total_pnl / 10000).toFixed(1)}萬
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px]">報酬率</p>
                    <p className={`font-bold text-sm ${result.total_pnl_pct >= 0 ? 'text-neon-red' : 'text-neon-green'}`}>
                      {result.total_pnl_pct >= 0 ? '+' : ''}{result.total_pnl_pct.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px]">風險分數</p>
                    <p className={`font-bold text-sm ${result.risk_score >= 70 ? 'text-neon-red' : result.risk_score >= 40 ? 'text-neon-orange' : 'text-neon-green'}`}>
                      {result.risk_score}/100
                    </p>
                  </div>
                </div>
              </div>

              {/* 集中度風險 */}
              <div className="bg-dark-card rounded-lg border border-dark-border/50 p-3">
                <h3 className="text-xs font-bold text-gray-300 mb-2">⚠️ 集中度風險</h3>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${
                    result.concentration_risk?.level === '高' ? 'text-neon-red' :
                    result.concentration_risk?.level === '中高' ? 'text-neon-orange' :
                    result.concentration_risk?.level === '中' ? 'text-neon-orange' : 'text-neon-green'
                  }`}>{result.concentration_risk?.level}</span>
                  <span className="text-gray-400 text-xs">{result.concentration_risk?.description}</span>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-gray-400">
                  <span>最大持股佔比：{result.concentration_risk?.top1_weight}%</span>
                  <span>前三大合計：{result.concentration_risk?.top3_weight}%</span>
                  <span>持股數：{result.concentration_risk?.stock_count} 檔</span>
                </div>
              </div>

              {/* 產業曝險 */}
              <div className="bg-dark-card rounded-lg border border-dark-border/50 p-3">
                <h3 className="text-xs font-bold text-gray-300 mb-2">🏭 產業曝險</h3>
                <div className="space-y-1.5">
                  {(result.industry_exposure ?? []).map((exp: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-gray-300 text-xs w-20 flex-shrink-0">{exp.industry}</span>
                      <div className="flex-1 h-4 bg-dark-bg rounded overflow-hidden">
                        <div
                          className={`h-full rounded transition-all ${
                            exp.risk === '高' ? 'bg-neon-red/60' :
                            exp.risk === '中' ? 'bg-neon-orange/60' : 'bg-neon-blue/40'
                          }`}
                          style={{ width: `${Math.min(exp.weight, 100)}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs w-10 text-right">{exp.weight}%</span>
                      {exp.risk === '高' && <span className="text-neon-red text-[10px]">⚠</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 持股明細 */}
              <div className="bg-dark-card rounded-lg border border-dark-border/50 p-3">
                <h3 className="text-xs font-bold text-gray-300 mb-2">📋 持股明細</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-dark-border/30">
                      <th className="text-left py-1">代碼</th>
                      <th className="text-left py-1">名稱</th>
                      <th className="text-right py-1">現價</th>
                      <th className="text-right py-1">損益%</th>
                      <th className="text-right py-1">佔比</th>
                      <th className="text-left py-1 pl-2">產業</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.stock_details ?? []).map((s: any) => (
                      <tr key={s.stock_id} className="border-b border-dark-border/10">
                        <td className="py-1 text-white font-medium">{s.stock_id}</td>
                        <td className="py-1 text-gray-300">{s.name}</td>
                        <td className="py-1 text-right text-white">{s.current_price}</td>
                        <td className={`py-1 text-right font-medium ${s.pnl_pct >= 0 ? 'text-neon-red' : 'text-neon-green'}`}>
                          {s.pnl_pct >= 0 ? '+' : ''}{s.pnl_pct.toFixed(1)}%
                        </td>
                        <td className="py-1 text-right text-gray-400">{s.weight}%</td>
                        <td className="py-1 pl-2 text-gray-500">{s.industry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AI 建議 */}
              <div className="bg-dark-card rounded-lg border border-neon-blue/30 p-3">
                <h3 className="text-xs font-bold text-neon-blue mb-2">🤖 AI 投資建議</h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {result.ai_advice || '生成中...'}
                </p>
                <p className="text-gray-600 text-[10px] mt-2">⚠️ AI 建議僅供參考，不構成投資建議</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
