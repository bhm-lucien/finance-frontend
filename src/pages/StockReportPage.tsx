/**
 * AI 個股研究報告頁面
 * 基本面分析：公司概況、營收成長、DCF 估值、三情境、風險、評等
 */
import { useEffect, useState } from 'react'
import { fetchStockReport } from '../services/api'

interface Props {
  stockId: string
  stockName: string
}

export default function StockReportPage({ stockId, stockName }: Props) {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReport()
  }, [stockId])

  async function loadReport() {
    setLoading(true)
    setError('')
    try {
      const result = await fetchStockReport(stockId)
      setReport(result)
    } catch (e: any) {
      setError(e?.response?.data?.detail || '報告生成失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto p-3 lg:p-4">
      {/* 標題 */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h2 className="text-sm lg:text-base font-bold text-neon-blue">📋 AI 個股研究報告</h2>
          <p className="text-gray-400 text-xs mt-0.5">{stockId} {stockName} — 基本面深度分析</p>
        </div>
        <button
          onClick={loadReport}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30 disabled:opacity-50"
        >
          {loading ? '生成中...' : '🔄 重新生成'}
        </button>
      </div>

      {/* 載入中 */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-neon-blue text-sm animate-pulse">🤖 AI 正在分析 {stockId} {stockName}...</p>
            <p className="text-gray-500 text-xs mt-1">首次生成約需 10-20 秒</p>
          </div>
        </div>
      )}

      {/* 錯誤 */}
      {error && !loading && (
        <div className="p-3 rounded bg-neon-red/10 border border-neon-red/30 text-neon-red text-sm">
          {error}
        </div>
      )}

      {/* 報告內容 */}
      {report && !loading && (
        <div className="space-y-3">
          {/* 指標概覽 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <MetricCard label="目前股價" value={report.metrics?.current_price} suffix="" color={report.metrics?.change_pct >= 0 ? 'red' : 'green'} />
            <MetricCard label="52 週高" value={report.metrics?.high_52w} suffix="" color="gray" />
            <MetricCard label="52 週低" value={report.metrics?.low_52w} suffix="" color="gray" />
            <MetricCard label="52週位置" value={`${report.metrics?.position_52w}%`} suffix="" color="blue" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="5 日報酬" value={`${report.metrics?.return_5d > 0 ? '+' : ''}${report.metrics?.return_5d}%`} color={report.metrics?.return_5d >= 0 ? 'red' : 'green'} />
            <MetricCard label="20 日報酬" value={`${report.metrics?.return_20d > 0 ? '+' : ''}${report.metrics?.return_20d}%`} color={report.metrics?.return_20d >= 0 ? 'red' : 'green'} />
            <MetricCard label="60 日報酬" value={`${report.metrics?.return_60d > 0 ? '+' : ''}${report.metrics?.return_60d}%`} color={report.metrics?.return_60d >= 0 ? 'red' : 'green'} />
          </div>

          {/* 各報告區塊 */}
          <ReportSection icon="🏢" title="公司概況" content={report.report?.company_overview} />
          <ReportSection icon="📈" title="營收成長性分析" content={report.report?.revenue_analysis} />
          <ReportSection icon="💰" title="估值分析（DCF）" content={report.report?.dcf_valuation} color="blue" />
          <ReportSection icon="🎯" title="三情境目標價" content={report.report?.scenarios} color="orange" />
          <ReportSection icon="⚠️" title="風險矩陣" content={report.report?.risk_matrix} color="red" />
          <ReportSection icon="⭐" title="投資評等" content={report.report?.investment_rating} color="green" />

          {/* 更新時間 */}
          <p className="text-gray-600 text-[10px] text-center pt-2">
            更新時間：{report.update_time} ｜ ⚠️ AI 生成內容僅供參考，不構成投資建議
          </p>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, suffix = '', color = 'gray' }: { label: string; value: any; suffix?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    red: 'text-neon-red',
    green: 'text-neon-green',
    blue: 'text-neon-blue',
    orange: 'text-neon-orange',
    gray: 'text-white',
  }
  return (
    <div className="bg-dark-card rounded border border-dark-border/50 p-2 text-center">
      <p className="text-gray-500 text-[10px]">{label}</p>
      <p className={`font-bold text-sm ${colorMap[color] || 'text-white'}`}>{value}{suffix}</p>
    </div>
  )
}

function ReportSection({ icon, title, content, color = 'gray' }: { icon: string; title: string; content?: string; color?: string }) {
  if (!content) return null

  const borderMap: Record<string, string> = {
    blue: 'border-neon-blue/30',
    orange: 'border-neon-orange/30',
    red: 'border-neon-red/30',
    green: 'border-neon-green/30',
    gray: 'border-dark-border/50',
  }

  return (
    <div className={`bg-dark-card rounded-lg border ${borderMap[color] || borderMap.gray} p-3`}>
      <h3 className="text-xs font-bold text-gray-300 mb-1.5">{icon} {title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}
