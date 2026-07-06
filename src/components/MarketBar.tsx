/**
 * 大盤指標列 — 台指期 + 美股三大指數 + 漲跌停統計
 */
interface MarketIndex {
  key: string
  name: string
  price: number
  change: number
  change_pct: number
}

interface LimitStats {
  limit_up: number
  limit_down: number
  up_count: number
  down_count: number
}

interface MarketBarProps {
  indices: MarketIndex[]
  limitStats?: LimitStats | null
}

export default function MarketBar({ indices, limitStats }: MarketBarProps) {
  if (!indices.length && !limitStats) return null

  return (
    <div className="px-3 lg:px-4 py-1.5 border-b border-dark-border/50 bg-dark-bg/80 text-xs">
      {/* 手機版：grid 換行 / 桌面版：一行 flex */}
      <div className="grid grid-cols-2 gap-1 lg:flex lg:items-center lg:gap-5">
        {indices.map(idx => {
          const isUp = idx.change >= 0
          const color = idx.price === 0 ? 'text-gray-500' : isUp ? 'text-neon-red' : 'text-neon-green'
          const arrow = isUp ? '▲' : '▼'

          return (
            <div key={idx.key} className="flex items-center gap-1">
              <span className="text-gray-400 font-medium">{idx.name}</span>
              <span className="text-white font-bold text-[11px] lg:text-xs">
                {idx.price > 0 ? idx.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '--'}
              </span>
              {idx.price > 0 && (
                <span className={`${color} font-medium text-[10px] lg:text-xs`}>
                  {arrow}{Math.abs(idx.change_pct).toFixed(2)}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* 漲跌停統計 */}
      {limitStats && (limitStats.limit_up > 0 || limitStats.limit_down > 0 || limitStats.up_count > 0) && (
        <div className="flex items-center gap-3 lg:gap-4 mt-1 lg:mt-0 text-[10px] lg:text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">漲停</span>
            <span className="text-neon-red font-bold">{limitStats.limit_up}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">上漲</span>
            <span className="text-neon-red">{limitStats.up_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">下跌</span>
            <span className="text-neon-green">{limitStats.down_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">跌停</span>
            <span className="text-neon-green font-bold">{limitStats.limit_down}</span>
          </div>
        </div>
      )}
    </div>
  )
}
