/**
 * 盤中分時走勢圖 — 顯示今日即時價格曲線
 * 每 30 秒加入一個新資料點，呈現整日走勢
 */
import ReactECharts from 'echarts-for-react'

interface TickData {
  time: string
  price: number
}

interface IntradayChartProps {
  ticks: TickData[]
  yesterdayClose: number
}

export default function IntradayChart({ ticks, yesterdayClose }: IntradayChartProps) {
  if (!ticks.length) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-500">
        盤中即時走勢（開盤後顯示）
      </div>
    )
  }

  const times = ticks.map(t => t.time)
  const prices = ticks.map(t => t.price)

  const minPrice = Math.min(...prices, yesterdayClose) * 0.998
  const maxPrice = Math.max(...prices, yesterdayClose) * 1.002

  // 判斷最新價相對昨收的漲跌
  const latestPrice = prices[prices.length - 1]
  const isUp = latestPrice >= yesterdayClose
  const lineColor = isUp ? '#ff4757' : '#00ff88'
  const areaColor = isUp
    ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,71,87,0.2)' }, { offset: 1, color: 'rgba(255,71,87,0)' }] }
    : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,255,136,0.2)' }, { offset: 1, color: 'rgba(0,255,136,0)' }] }

  const option = {
    backgroundColor: 'transparent',
    grid: { left: '10%', right: '5%', top: '8%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: { color: '#6b7280', fontSize: 12, interval: Math.max(1, Math.floor(times.length / 6)) },
      axisLine: { lineStyle: { color: '#1a3a5c' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: minPrice,
      max: maxPrice,
      axisLabel: { color: '#6b7280', fontSize: 12 },
      splitLine: { lineStyle: { color: '#1a3a5c33' } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#111827',
      borderColor: '#1a3a5c',
      textStyle: { color: '#e2e8f0', fontSize: 11 },
      formatter: (params: Array<{ value: number; axisValue: string }>) => {
        const p = params[0]
        const diff = p.value - yesterdayClose
        const pct = (diff / yesterdayClose * 100).toFixed(2)
        return `${p.axisValue}<br/>成交：<b>${p.value}</b><br/>漲跌：<span style="color:${diff >= 0 ? '#ff4757' : '#00ff88'}">${diff >= 0 ? '+' : ''}${diff.toFixed(2)} (${pct}%)</span>`
      },
    },
    series: [
      {
        type: 'line',
        data: prices,
        smooth: true,
        lineStyle: { color: lineColor, width: 1.5 },
        areaStyle: { color: areaColor },
        symbol: 'none',
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#ffa502', type: 'dashed', width: 1 },
          data: [{ yAxis: yesterdayClose }],
          label: { show: true, formatter: `昨收 ${yesterdayClose}`, color: '#ffa502', fontSize: 9, position: 'insideEndTop' },
        },
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  )
}
