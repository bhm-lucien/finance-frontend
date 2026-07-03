/**
 * 本益比河流圖
 * 顯示股價在歷史估值區間的相對位置
 */
import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'

interface PERiverData {
  date: string
  close: number
  cheap: number
  fair_low: number
  fair_high: number
  expensive: number
}

interface Props {
  data: PERiverData[]
  currentZone: string
  currentPercentile: number
}

export default function PERiverChart({ data, currentZone, currentPercentile }: Props) {
  const option = useMemo(() => {
    if (!data || data.length === 0) return {}

    const dates = data.map(d => d.date)
    const closes = data.map(d => d.close)
    const cheap = data.map(d => d.cheap)
    const fairLow = data.map(d => d.fair_low)
    const fairHigh = data.map(d => d.fair_high)
    const expensive = data.map(d => d.expensive)

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a1a2e',
        borderColor: '#333',
        textStyle: { color: '#fff', fontSize: 11 },
        formatter: (params: any) => {
          const date = params[0]?.axisValue || ''
          let html = `<div style="font-weight:bold;margin-bottom:4px">${date}</div>`
          for (const p of params) {
            html += `<div>${p.marker} ${p.seriesName}: ${p.value.toFixed(1)}</div>`
          }
          return html
        },
      },
      legend: {
        data: ['收盤價', '偏低', '合理低', '合理高', '偏高'],
        textStyle: { color: '#888', fontSize: 10 },
        top: 0,
        itemWidth: 12,
        itemHeight: 8,
      },
      grid: { left: 45, right: 10, top: 30, bottom: 25 },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#666', fontSize: 9, rotate: 0, interval: Math.floor(dates.length / 5) },
        axisLine: { lineStyle: { color: '#333' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#666', fontSize: 9 },
        splitLine: { lineStyle: { color: '#222' } },
      },
      series: [
        {
          name: '偏低',
          type: 'line',
          data: cheap,
          lineStyle: { width: 0 },
          areaStyle: { color: 'rgba(76,175,80,0.15)' },
          symbol: 'none',
          stack: 'river',
        },
        {
          name: '合理低',
          type: 'line',
          data: fairLow.map((v, i) => v - cheap[i]),
          lineStyle: { width: 0 },
          areaStyle: { color: 'rgba(255,193,7,0.15)' },
          symbol: 'none',
          stack: 'river',
        },
        {
          name: '合理高',
          type: 'line',
          data: fairHigh.map((v, i) => v - fairLow[i]),
          lineStyle: { width: 0 },
          areaStyle: { color: 'rgba(255,152,0,0.15)' },
          symbol: 'none',
          stack: 'river',
        },
        {
          name: '偏高',
          type: 'line',
          data: expensive.map((v, i) => v - fairHigh[i]),
          lineStyle: { width: 0 },
          areaStyle: { color: 'rgba(244,67,54,0.15)' },
          symbol: 'none',
          stack: 'river',
        },
        {
          name: '收盤價',
          type: 'line',
          data: closes,
          lineStyle: { width: 2, color: '#00D4FF' },
          symbol: 'none',
          z: 10,
        },
      ],
    }
  }, [data])

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500 text-sm">載入中...</div>
  }

  const zoneColor = currentZone === '偏低' ? 'text-neon-green' :
    currentZone === '合理' ? 'text-neon-blue' :
    currentZone === '偏高' ? 'text-neon-orange' : 'text-neon-red'

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-1 flex-shrink-0">
        <span className="text-gray-400 text-xs">目前位置：</span>
        <span className={`font-bold text-sm ${zoneColor}`}>{currentZone}</span>
        <span className="text-gray-500 text-xs">（百分位 {currentPercentile}%）</span>
      </div>
      <div className="flex-1 min-h-0">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  )
}
