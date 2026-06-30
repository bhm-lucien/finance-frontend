/**
 * 歷史回測頁面 — 驗證分析模型的準確度和策略績效
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { fetchBacktestAccuracy, fetchBacktestPnl } from '../services/api'
import { getStockName } from '../data/stockNames'

export default function BacktestPage() {
  const [stockId, setStockId] = useState('2330')
  const [days, setDays] = useState(180)
  const [loading, setLoading] = useState(false)
  const [accuracy, setAccuracy] = useState<any>(null)
  const [pnl, setPnl] = useState<any>(null)

  async function runBacktest() {
    setLoading(true)
    try {
      const [accResult, pnlResult] = await Promise.all([
        fetchBacktestAccuracy(stockId, days),
        fetchBacktestPnl(stockId, days),
      ])
      setAccuracy(accResult)
      setPnl(pnlResult)
    } catch (err) {
      console.error('回測失敗:', err)
    } finally {
      setLoading(false)
    }
  }

  // 權益曲線圖
  const equityOption = pnl?.equity_curve ? {
    backgroundColor: 'transparent',
    grid: { left: '10%', right: '5%', top: '10%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: pnl.equity_curve.map((d: any) => d.date.slice(5)),
      axisLabel: { color: '#6b7280', fontSize: 10 },
      axisLine: { lineStyle: { color: '#1a3a5c' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280', fontSize: 10, formatter: (v: number) => `${(v/10000).toFixed(0)}萬` },
      splitLine: { lineStyle: { color: '#1a3a5c33' } },
    },
    tooltip: { trigger: 'axis', backgroundColor: '#111827', borderColor: '#1a3a5c', textStyle: { color: '#e2e8f0' } },
    series: [{
      type: 'line',
      data: pnl.equity_curve.map((d: any) => d.value),
      smooth: true,
      lineStyle: { color: '#00d4ff', width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,212,255,0.15)' }, { offset: 1, color: 'rgba(0,212,255,0)' }] } },
      symbol: 'none',
    }],
  } : null

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-dark-bg">
      {/* 頂部 */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-dark-border bg-dark-card/90">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-neon-blue hover:text-white transition text-sm">← 返回儀表板</Link>
          <h1 className="text-lg font-bold text-white">歷史回測</h1>
        </div>
      </header>

      {/* 設定區 */}
      <div className="px-6 py-4 border-b border-dark-border flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">股票代碼：</label>
          <input
            value={stockId}
            onChange={e => setStockId(e.target.value)}
            className="w-20 px-2 py-1 text-sm bg-dark-bg border border-dark-border rounded text-white focus:border-neon-blue/50 focus:outline-none"
            maxLength={6}
          />
          <span className="text-xs text-gray-500">{getStockName(stockId)}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">回測天數：</label>
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="px-2 py-1 text-sm bg-dark-bg border border-dark-border rounded text-white focus:outline-none"
          >
            <option value={60}>60 天</option>
            <option value={120}>120 天</option>
            <option value={180}>180 天</option>
            <option value={365}>365 天</option>
          </select>
        </div>
        <button
          onClick={runBacktest}
          disabled={loading}
          className="px-4 py-1.5 text-sm bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30 transition disabled:opacity-50"
        >
          {loading ? '回測中...' : '開始回測'}
        </button>
      </div>

      {/* 結果區 */}
      <div className="flex-1 overflow-y-auto p-6">
        {!accuracy && !pnl && !loading && (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg mb-2">選擇股票和天數後，點擊「開始回測」</p>
            <p className="text-xs">系統會用歷史資料驗證燈號準確度和策略績效</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-3 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">正在回測中，請稍候...</p>
          </div>
        )}

        {accuracy && pnl && !loading && (
          <div className="space-y-6">
            {/* 績效摘要卡片 */}
            <div className="grid grid-cols-4 gap-4">
              <SummaryCard
                label="燈號準確率"
                value={`${accuracy.accuracy}%`}
                color={accuracy.accuracy >= 60 ? 'text-neon-green' : 'text-neon-orange'}
              />
              <SummaryCard
                label="策略報酬率"
                value={`${pnl.total_return_pct > 0 ? '+' : ''}${pnl.total_return_pct}%`}
                color={pnl.total_return_pct >= 0 ? 'text-neon-red' : 'text-neon-green'}
              />
              <SummaryCard
                label="買入持有報酬"
                value={`${pnl.buy_hold_return_pct > 0 ? '+' : ''}${pnl.buy_hold_return_pct}%`}
                color={pnl.buy_hold_return_pct >= 0 ? 'text-neon-red' : 'text-neon-green'}
              />
              <SummaryCard
                label="勝率"
                value={`${pnl.win_rate}%`}
                color={pnl.win_rate >= 50 ? 'text-neon-green' : 'text-neon-orange'}
              />
            </div>

            {/* 權益曲線 */}
            <div className="card-glow rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3">權益曲線（策略：{pnl.strategy}）</h3>
              {equityOption && (
                <ReactECharts option={equityOption} style={{ height: '250px' }} />
              )}
              <div className="flex gap-6 mt-2 text-xs text-gray-400">
                <span>初始資金：{(pnl.initial_capital / 10000).toFixed(0)} 萬</span>
                <span>最終資金：<span className={pnl.total_return_pct >= 0 ? 'text-neon-red' : 'text-neon-green'}>{(pnl.final_value / 10000).toFixed(1)} 萬</span></span>
                <span>交易次數：{pnl.total_trades} 次</span>
                <span>獲利：{pnl.win_trades} 次 / 虧損：{pnl.lose_trades} 次</span>
              </div>
            </div>

            {/* 燈號統計 */}
            <div className="card-glow rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3">各燈號回測統計</h3>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(accuracy.signal_stats || {}).map(([sig, stats]: [string, any]) => (
                  <div key={sig} className="bg-dark-bg rounded p-3 text-center">
                    <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                      sig === 'red' ? 'bg-neon-red' :
                      sig === 'orange' ? 'bg-neon-orange' :
                      sig === 'green' ? 'bg-neon-green' : 'bg-gray-500'
                    }`} />
                    <p className="text-xs text-gray-400">{sig === 'red' ? '紅燈' : sig === 'orange' ? '黃橙' : sig === 'green' ? '綠燈' : '黑燈'}</p>
                    <p className="text-lg font-bold text-white">{stats.accuracy}%</p>
                    <p className="text-[10px] text-gray-500">觸發 {stats.count} 次</p>
                    <p className="text-[10px] text-gray-500">平均5日報酬 {stats.avg_5d_return > 0 ? '+' : ''}{stats.avg_5d_return}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 最近交易紀錄 */}
            <div className="card-glow rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3">最近交易紀錄</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-dark-border">
                      <th className="text-left py-2">日期</th>
                      <th className="text-left py-2">動作</th>
                      <th className="text-right py-2">價格</th>
                      <th className="text-right py-2">損益</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pnl.trades || []).map((t: any, i: number) => (
                      <tr key={i} className="border-b border-dark-border/30">
                        <td className="py-1.5 text-gray-300">{t.date}</td>
                        <td className={`py-1.5 font-medium ${t.action === '買進' ? 'text-neon-red' : 'text-neon-green'}`}>
                          {t.action}
                        </td>
                        <td className="py-1.5 text-right text-white">{t.price}</td>
                        <td className={`py-1.5 text-right font-medium ${
                          (t.pnl_pct ?? 0) >= 0 ? 'text-neon-red' : 'text-neon-green'
                        }`}>
                          {t.pnl_pct !== undefined ? `${t.pnl_pct > 0 ? '+' : ''}${t.pnl_pct}%` : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 最近燈號紀錄 */}
            <div className="card-glow rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3">最近 20 筆燈號紀錄</h3>
              <div className="grid grid-cols-5 gap-2">
                {(accuracy.recent_signals || []).map((s: any, i: number) => (
                  <div key={i} className={`text-center p-2 rounded text-[10px] border ${
                    s.correct ? 'border-neon-green/30 bg-neon-green/5' : 'border-neon-red/30 bg-neon-red/5'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${
                      s.signal === 'red' ? 'bg-neon-red' :
                      s.signal === 'orange' ? 'bg-neon-orange' :
                      s.signal === 'green' ? 'bg-neon-green' : 'bg-gray-500'
                    }`} />
                    <p className="text-gray-400">{s.date.slice(5)}</p>
                    <p className={s.future_5d_return >= 0 ? 'text-neon-red' : 'text-neon-green'}>
                      {s.future_5d_return > 0 ? '+' : ''}{s.future_5d_return}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card-glow rounded-lg p-4 text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
