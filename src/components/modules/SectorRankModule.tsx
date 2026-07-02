/**
 * 今日產業焦點漲幅排行
 * 顯示漲幅前 5 和跌幅前 5 的產業板塊
 */

type SectorData = {
  name: string
  change_pct: number
  status: string
  stock_count: number
  top_stocks: { id: string; name: string; change_pct: number }[]
}

type Props = {
  sectors: SectorData[]
  onSelectStock?: (stockId: string) => void
}

export default function SectorRankModule({ sectors, onSelectStock }: Props) {
  if (!sectors || sectors.length === 0) {
    return <div className="text-gray-500 text-center py-4">載入中...</div>
  }

  const sorted = [...sectors].sort((a, b) => b.change_pct - a.change_pct)
  const top5 = sorted.slice(0, 5)
  const bottom5 = sorted.slice(-5).reverse()

  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto">
      {/* 漲幅前 5 */}
      <div>
        <h4 className="text-xs font-bold text-red-400 mb-1">🔥 漲幅前 5</h4>
        <div className="space-y-0.5">
          {top5.map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-white/5 transition">
              <span className="text-[10px] text-gray-500 w-3">{i + 1}</span>
              <span className="text-xs text-gray-200 flex-1 truncate">{s.name}</span>
              <span className={`text-xs font-bold ${s.change_pct > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {s.change_pct > 0 ? '+' : ''}{s.change_pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 分隔線 */}
      <div className="border-t border-dark-border/30" />

      {/* 跌幅前 5 */}
      <div>
        <h4 className="text-xs font-bold text-green-400 mb-1">📉 跌幅前 5</h4>
        <div className="space-y-0.5">
          {bottom5.map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-white/5 transition">
              <span className="text-[10px] text-gray-500 w-3">{i + 1}</span>
              <span className="text-xs text-gray-200 flex-1 truncate">{s.name}</span>
              <span className={`text-xs font-bold ${s.change_pct > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {s.change_pct > 0 ? '+' : ''}{s.change_pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 板塊熱門個股（漲幅第一板塊的前三股） */}
      {top5[0]?.top_stocks?.length > 0 && (
        <>
          <div className="border-t border-dark-border/30" />
          <div>
            <h4 className="text-xs font-bold text-orange-400 mb-1">
              ⭐ {top5[0].name}熱門股
            </h4>
            <div className="space-y-0.5">
              {top5[0].top_stocks.map((st, i) => (
                <button
                  key={i}
                  onClick={() => onSelectStock?.(st.id)}
                  className="w-full flex items-center gap-2 px-1.5 py-1 rounded hover:bg-white/5 transition text-left"
                >
                  <span className="text-xs text-gray-300">{st.id}</span>
                  <span className="text-xs text-gray-200 flex-1 truncate">{st.name}</span>
                  <span className={`text-xs font-bold ${st.change_pct > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {st.change_pct > 0 ? '+' : ''}{st.change_pct}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
