/**
 * 頂部標題列 — 顯示系統名稱、即時報價、日期時間
 */
import { ReactNode, useState, useEffect } from 'react'

interface RealtimeData {
  price: number
  open: number
  high: number
  low: number
  volume: number
  single_volume: number
  change: number
  change_pct: number
  bid: number
  ask: number
  time: string
  is_realtime: boolean
  limit_up?: number
  limit_down?: number
}

interface HeaderProps {
  stockId: string
  stockName?: string
  latest: {
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
    change: number
    change_pct: number
  } | null
  realtime?: RealtimeData | null
  children?: ReactNode
}

export default function Header({ stockId, stockName, latest, realtime, children }: HeaderProps) {
  // 即時時鐘
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
  // 優先使用即時資料
  const price = realtime?.price || latest?.close || 0
  const change = realtime?.change ?? latest?.change ?? 0
  const changePct = realtime?.change_pct ?? latest?.change_pct ?? 0
  const volume = realtime?.volume || (latest ? Math.round(latest.volume / 1000) : 0)
  const singleVol = realtime?.single_volume || 0
  const bid = realtime?.bid || price
  const ask = realtime?.ask || price
  const isRealtime = realtime?.is_realtime ?? false

  const isUp = change >= 0
  const changeColor = isUp ? 'text-neon-red' : 'text-neon-green'
  const arrow = isUp ? '▲' : '▼'

  return (
    <header className="relative z-50 flex items-center justify-between px-5 py-2.5 border-b border-dark-border bg-dark-card/90 backdrop-blur header-scanline">
      {/* 左側標題 + 股票選擇 */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-wider">
            <span className="text-neon-blue">飆股追獵者</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-0.5 tracking-wide">
            AI 主力行為判讀系統
          </p>
        </div>
        {children}
      </div>

      {/* 中間即時報價 */}
      <div className="flex items-center gap-5">
        <InfoCell label="股票" value={`${stockId} ${stockName ?? ''}`} />
        <InfoCell
          label="目前價"
          value={price > 0 ? price.toFixed(2) : '--'}
          valueClass={changeColor}
        />
        <InfoCell
          label="漲跌"
          value={`${arrow} ${Math.abs(change).toFixed(2)} (${Math.abs(changePct).toFixed(2)}%)`}
          valueClass={changeColor}
        />
        <InfoCell label="單量" value={singleVol > 0 ? String(singleVol) : '--'} />
        <InfoCell label="總量" value={volume > 0 ? String(volume) : '--'} />
        <InfoCell label="買進" value={bid > 0 ? bid.toFixed(2) : '--'} valueClass="text-neon-red" />
        <InfoCell label="賣出" value={ask > 0 ? ask.toFixed(2) : '--'} valueClass="text-neon-green" />
        <InfoCell label="漲停" value={realtime?.limit_up ? realtime.limit_up.toFixed(2) : '--'} valueClass="text-neon-red" />
        <InfoCell label="跌停" value={realtime?.limit_down ? realtime.limit_down.toFixed(2) : '--'} valueClass="text-neon-green" />
      </div>

      {/* 右側日期 + 即時狀態 */}
      <div className="text-right flex items-center gap-3">
        <div>
          <p className="text-[11px] text-gray-400">
            日期 &nbsp; <span className="text-white font-medium">{dateStr}</span>
          </p>
          <p className="text-[11px] text-gray-400">
            時間 &nbsp; <span className="text-white font-medium">{timeStr}</span>
          </p>
          <p className="text-[9px] mt-0.5">
            {isRealtime ? (
              <span className="text-neon-green">● 即時</span>
            ) : (
              <span className="text-gray-500">○ 收盤</span>
            )}
            <span className="text-neon-blue/70 ml-2"></span>
          </p>
        </div>
      </div>
    </header>
  )
}

function InfoCell({ label, value, valueClass = 'text-white' }: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="text-center min-w-[55px]">
      <p className="text-[11px] text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${valueClass}`}>{value}</p>
    </div>
  )
}
