/**
 * 即時行情熱力圖（Finviz Map 風格）
 * 按產業分群，方塊大小 = 成交金額，顏色 = 漲跌幅
 */
import { useMemo } from 'react'

interface HeatmapStock {
  stock_id: string
  name: string
  change_pct: number
  price: number
  volume: number
}

interface HeatmapSector {
  sector: string
  change_pct: number
  stocks: HeatmapStock[]
  flow_amount: number
}

interface Props {
  sectors: HeatmapSector[]
  onSelectStock?: (stockId: string) => void
}

export default function HeatmapChart({ sectors, onSelectStock }: Props) {
  const flatStocks = useMemo(() => {
    const all: (HeatmapStock & { sector: string })[] = []
    for (const s of sectors) {
      for (const stock of s.stocks) {
        all.push({ ...stock, sector: s.sector })
      }
    }
    // 按成交量排序（大的先）
    all.sort((a, b) => b.volume - a.volume)
    return all
  }, [sectors])

  if (!flatStocks.length) {
    return <div className="flex items-center justify-center h-full text-gray-500 text-sm">載入中...</div>
  }

  return (
    <div className="w-full h-full grid gap-0.5 p-1 overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(70px, 1fr))`,
        gridAutoRows: 'minmax(50px, 1fr)',
      }}
    >
      {flatStocks.slice(0, 40).map((stock) => {
        const color = getColor(stock.change_pct)
        const textColor = Math.abs(stock.change_pct) > 1 ? 'text-white' : 'text-gray-200'
        return (
          <div
            key={stock.stock_id}
            className={`rounded-sm flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity ${textColor}`}
            style={{ backgroundColor: color }}
            onClick={() => onSelectStock?.(stock.stock_id)}
            title={`${stock.stock_id} ${stock.name}\n漲跌：${stock.change_pct > 0 ? '+' : ''}${stock.change_pct.toFixed(2)}%\n價格：${stock.price}`}
          >
            <span className="text-[9px] font-medium truncate w-full text-center px-0.5">{stock.name}</span>
            <span className="text-[10px] font-bold">
              {stock.change_pct > 0 ? '+' : ''}{stock.change_pct.toFixed(1)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

function getColor(changePct: number): string {
  // 漲：紅色系，跌：綠色系
  if (changePct >= 9) return '#FF0000'
  if (changePct >= 5) return '#E53935'
  if (changePct >= 3) return '#EF5350'
  if (changePct >= 2) return '#F44336'
  if (changePct >= 1) return '#E57373'
  if (changePct >= 0.5) return '#EF9A9A'
  if (changePct > -0.5) return '#424242'  // 平盤灰
  if (changePct > -1) return '#A5D6A7'
  if (changePct > -2) return '#66BB6A'
  if (changePct > -3) return '#43A047'
  if (changePct > -5) return '#2E7D32'
  return '#1B5E20'
}
