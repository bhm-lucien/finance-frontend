/**
 * K 棒趨勢線圖表元件
 * 在 K 線圖上疊加自動辨識的支撐線和壓力線
 */
import ReactECharts from 'echarts-for-react'

interface OHLCVData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface TrendLine {
  start: { idx: number; price: number }
  end: { idx: number; price: number }
}

interface Props {
  data: OHLCVData[]
  supportLine: TrendLine | null
  resistanceLine: TrendLine | null
  supportAtCurrent: number | null
  resistanceAtCurrent: number | null
}

export default function TrendLineChart({ data, supportLine, resistanceLine, supportAtCurrent, resistanceAtCurrent }: Props) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8">載入中...</div>
  }

  const dates = data.map(d => d.date.slice(5))
  const ohlc = data.map(d => [d.open, d.close, d.low, d.high])
  const n = data.length

  // 構建趨勢線資料
  const supportLineData: (number | null)[] = new Array(n).fill(null)
  const resistanceLineData: (number | null)[] = new Array(n).fill(null)

  if (supportLine) {
    const { start, end } = supportLine
    const slope = (end.price - start.price) / Math.max(1, end.idx - start.idx)
    // 從 start 延伸到最後一根
    for (let i = start.idx; i < n; i++) {
      supportLineData[i] = Math.round((start.price + slope * (i - start.idx)) * 100) / 100
    }
  }

  if (resistanceLine) {
    const { start, end } = resistanceLine
    const slope = (end.price - start.price) / Math.max(1, end.idx - start.idx)
    for (let i = start.idx; i < n; i++) {
      resistanceLineData[i] = Math.round((start.price + slope * (i - start.idx)) * 100) / 100
    }
  }

  const option = {
    backgroundColor: 'transparent',
    animation: false,
    grid: {
      left: '10%',
      right: '4%',
      top: '8%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#1e3a5f' } },
      axisLabel: { color: '#6b7280', fontSize: 10 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1e3a5f33' } },
      axisLabel: { color: '#6b7280', fontSize: 10 },
      scale: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#111827',
      borderColor: '#1e3a5f',
      textStyle: { color: '#e2e8f0', fontSize: 10 },
    },
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100,
      },
    ],
    series: [
      {
        name: 'K線',
        type: 'candlestick',
        data: ohlc,
        itemStyle: {
          color: '#ff4757',
          color0: '#00ff88',
          borderColor: '#ff4757',
          borderColor0: '#00ff88',
        },
      },
      {
        name: '支撐趨勢線',
        type: 'line',
        data: supportLineData,
        lineStyle: { width: 2, color: '#00ff88', type: 'dashed' },
        symbol: 'none',
        connectNulls: false,
      },
      {
        name: '壓力趨勢線',
        type: 'line',
        data: resistanceLineData,
        lineStyle: { width: 2, color: '#ff4757', type: 'dashed' },
        symbol: 'none',
        connectNulls: false,
      },
    ],
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
      {/* 趨勢線價位標示 */}
      <div className="flex justify-between text-xs px-1 pt-1 border-t border-dark-border/30">
        {supportAtCurrent && (
          <span className="text-neon-green">支撐線：{supportAtCurrent}</span>
        )}
        {resistanceAtCurrent && (
          <span className="text-neon-red">壓力線：{resistanceAtCurrent}</span>
        )}
      </div>
    </div>
  )
}
