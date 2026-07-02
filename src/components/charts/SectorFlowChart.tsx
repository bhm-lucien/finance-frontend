/**
 * 產業板塊資金流向 — 水平長條圖
 *
 * 按成交金額排序，顏色代表漲跌，右側標註狀態
 */

type SectorData = {
  name: string
  flow_amount: number
  flow_speed: number
  change_pct: number
  status: string
  stock_count: number
  top_stocks: { id: string; name: string; change_pct: number }[]
}

type Props = {
  sectors: SectorData[]
}

const STATUS_COLORS: Record<string, string> = {
  '漲潮': 'text-red-400',
  '輪動': 'text-orange-400',
  '觀望': 'text-gray-400',
  '退潮': 'text-green-400',
}

const BAR_COLORS: Record<string, string> = {
  '漲潮': 'bg-red-500/80',
  '輪動': 'bg-orange-500/60',
  '觀望': 'bg-gray-500/40',
  '退潮': 'bg-green-500/60',
}

export default function SectorFlowChart({ sectors }: Props) {
  if (!sectors || sectors.length === 0) {
    return <div className="text-gray-500 text-center py-8">載入中...</div>
  }

  // 按成交金額排序（大到小）
  const sorted = [...sectors].sort((a, b) => b.flow_amount - a.flow_amount)
  const maxAmount = Math.max(...sorted.map(s => s.flow_amount), 1)

  return (
    <div className="h-full overflow-y-auto space-y-0.5 pr-1">
      {sorted.map((s, i) => {
        const barWidth = Math.max((s.flow_amount / maxAmount) * 100, 3)
        const isUp = s.change_pct > 0

        return (
          <div key={i} className="flex items-center gap-1.5 group hover:bg-white/5 rounded px-1 py-0.5 transition">
            {/* 板塊名稱 */}
            <span className="w-16 text-xs text-gray-300 truncate flex-shrink-0" title={s.name}>
              {s.name.replace('工業', '').replace('業', '')}
            </span>

            {/* 長條 */}
            <div className="flex-1 h-4 bg-dark-surface/50 rounded overflow-hidden relative">
              <div
                className={`h-full rounded transition-all duration-500 ${BAR_COLORS[s.status]}`}
                style={{ width: `${barWidth}%` }}
              />
              {/* 成交金額標註 */}
              <span className="absolute right-1 top-0 h-full flex items-center text-[10px] text-gray-400">
                {s.flow_amount > 100 ? `${(s.flow_amount / 1000).toFixed(0)}千億` : `${s.flow_amount.toFixed(0)}億`}
              </span>
            </div>

            {/* 漲跌幅 */}
            <span className={`w-12 text-xs text-right font-medium flex-shrink-0 ${isUp ? 'text-red-400' : 'text-green-400'}`}>
              {isUp ? '+' : ''}{s.change_pct}%
            </span>

            {/* 狀態 */}
            <span className={`w-8 text-[10px] text-right flex-shrink-0 ${STATUS_COLORS[s.status]}`}>
              {s.status}
            </span>
          </div>
        )
      })}
    </div>
  )
}
