/**
 * 籌碼熱區圖 (Volume Profile) — 橫向長條圖顯示各價位成交量分布
 * 加入套牢區 / 獲利區標示
 */
import ReactECharts from 'echarts-for-react'

interface VolumeProfileData {
  price_low: number
  price_high: number
  volume: number
  zone_type?: string
  volume_pct?: number
  is_poc?: boolean
  _summary?: {
    trapped_pct: number
    profit_pct: number
    poc_price: number
    current_price: number
  }
}

interface VolumeProfileChartProps {
  data: VolumeProfileData[]
  currentPrice?: number
}

export default function VolumeProfileChart({ data, currentPrice }: VolumeProfileChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8 text-xs">載入中...</div>
  }

  // 取出摘要
  const summary = data[0]?._summary

  const maxVolume = Math.max(...data.map(d => d.volume))

  // Y 軸：價格區間標籤
  const priceLabels = data.map(d => `${d.price_low.toFixed(0)}`)

  // X 軸：成交量
  const volumes = data.map(d => d.volume)

  // 顏色：根據 zone_type 或用現價判斷
  const colors = data.map(d => {
    if (d.zone_type === 'trapped') return '#ff475799'  // 套牢區 — 紅
    if (d.zone_type === 'profit') return '#00ff8899'   // 獲利區 — 綠
    if (d.zone_type === 'current') return '#ffa502'    // 目前價位 — 橙
    // 備援：用 currentPrice 判斷
    if (!currentPrice) return '#00d4ff'
    const midPrice = (d.price_low + d.price_high) / 2
    if (midPrice > currentPrice) return '#ff475799'
    if (midPrice < currentPrice) return '#00ff8899'
    return '#ffa502'
  })

  // 找出最大成交量的價格區間（POC）
  const maxVolumeIndex = volumes.indexOf(maxVolume)

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '15%',
      right: '8%',
      top: '8%',
      bottom: '12%',
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280',
        fontSize: 10,
        formatter: (val: number) => {
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
          if (val >= 1000) return `${(val / 1000).toFixed(0)}K`
          return val.toString()
        },
      },
      axisLine: { lineStyle: { color: '#1a3a5c' } },
      splitLine: { lineStyle: { color: '#1a3a5c33' } },
    },
    yAxis: {
      type: 'category',
      data: priceLabels,
      axisLabel: { color: '#9ca3af', fontSize: 9 },
      axisLine: { lineStyle: { color: '#1a3a5c' } },
      axisTick: { show: false },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#111827',
      borderColor: '#1a3a5c',
      textStyle: { color: '#e2e8f0', fontSize: 10 },
      formatter: (params: Array<{ dataIndex: number; value: number }>) => {
        const idx = params[0].dataIndex
        const d = data[idx]
        const zone = d.zone_type === 'trapped' ? '套牢區' : d.zone_type === 'profit' ? '獲利區' : '目前區'
        return `<b>${d.price_low.toFixed(1)} ~ ${d.price_high.toFixed(1)}</b><br/>成交量：${params[0].value.toLocaleString()}<br/>佔比：${d.volume_pct ?? 0}%<br/>區域：${zone}`
      },
    },
    series: [
      {
        type: 'bar',
        data: volumes.map((v, i) => ({
          value: v,
          itemStyle: {
            color: colors[i],
            borderRadius: [0, 2, 2, 0],
          },
        })),
        barWidth: '65%',
        markLine: maxVolumeIndex >= 0 ? {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#ffa502', type: 'dashed', width: 1 },
          data: [{ yAxis: maxVolumeIndex }],
          label: {
            show: true,
            formatter: 'POC',
            color: '#ffa502',
            fontSize: 9,
          },
        } : undefined,
      },
    ],
  }

  return (
    <div className="h-full flex flex-col">
      {/* 套牢/獲利摘要 */}
      {summary && (
        <div className="flex items-center justify-between text-xs px-1 pb-1 border-b border-dark-border/20">
          <span className="text-neon-red">套牢 {summary.trapped_pct}%</span>
          <span className="text-gray-400">POC {summary.poc_price}</span>
          <span className="text-neon-green">獲利 {summary.profit_pct}%</span>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
      {/* 圖例 */}
      <div className="flex items-center justify-center gap-3 text-[9px] text-gray-500">
        <span><span className="inline-block w-2 h-2 rounded-sm bg-neon-red/60 mr-0.5" />套牢區</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-neon-orange mr-0.5" />目前價位</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-neon-green/60 mr-0.5" />獲利區</span>
      </div>
    </div>
  )
}
