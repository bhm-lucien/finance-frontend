/**
 * 類神經 AI 預測路徑圖 — 顯示歷史K線 + 預測路徑
 */
import ReactECharts from 'echarts-for-react'

interface PricePoint {
  date: string
  close: number
}

interface PredictionChartProps {
  history: PricePoint[]
  predictions: PricePoint[]
  currentPrice?: number
  loading?: boolean
}

export default function PredictionChart({ history, predictions, currentPrice, loading }: PredictionChartProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-xs text-gray-400">
        <div className="w-5 h-5 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin mb-2" />
        模型訓練中，請稍候...
      </div>
    )
  }

  if (!history.length && !predictions.length) {
    return (
      <div className="text-gray-500 text-center py-8 text-xs">
        AI Neural Prediction<br/>(點擊載入預測)
      </div>
    )
  }

  // 合併日期軸
  const allDates = [
    ...history.map(h => h.date.slice(5)),
    ...predictions.map(p => p.date.slice(5)),
  ]

  // 歷史資料（K線部分）
  const historyData = history.map(h => h.close)
  // 預測資料（延續歷史最後一點）
  const predData = new Array(history.length - 1).fill(null)
  predData.push(history[history.length - 1]?.close ?? null) // 連接點
  predictions.forEach(p => predData.push(p.close))

  // 3 日預測線
  const pred3 = new Array(history.length - 1).fill(null)
  pred3.push(history[history.length - 1]?.close ?? null)
  predictions.slice(0, 3).forEach(p => pred3.push(p.close))

  // 5 日預測線
  const pred5 = new Array(history.length - 1).fill(null)
  pred5.push(history[history.length - 1]?.close ?? null)
  predictions.slice(0, 5).forEach(p => pred5.push(p.close))

  const option = {
    backgroundColor: 'transparent',
    grid: { left: '12%', right: '5%', top: '10%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: allDates,
      axisLabel: { color: '#6b7280', fontSize: 9, interval: 3 },
      axisLine: { lineStyle: { color: '#1a3a5c' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280', fontSize: 9 },
      splitLine: { lineStyle: { color: '#1a3a5c33' } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#111827',
      borderColor: '#1a3a5c',
      textStyle: { color: '#e2e8f0', fontSize: 11 },
    },
    legend: {
      data: ['實際K線', '3日預測', '5日預測', '10日預測'],
      textStyle: { color: '#9ca3af', fontSize: 9 },
      top: 0,
      right: 0,
    },
    series: [
      {
        name: '實際K線',
        type: 'line',
        data: historyData,
        smooth: false,
        lineStyle: { color: '#ffffff', width: 1.5 },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255,255,255,0.08)' },
              { offset: 1, color: 'rgba(255,255,255,0)' },
            ],
          },
        },
      },
      {
        name: '3日預測',
        type: 'line',
        data: pred3,
        smooth: true,
        lineStyle: { color: '#00ff88', width: 2, type: 'dashed' },
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: { color: '#00ff88' },
      },
      {
        name: '5日預測',
        type: 'line',
        data: pred5,
        smooth: true,
        lineStyle: { color: '#ffa502', width: 2, type: 'dashed' },
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: { color: '#ffa502' },
      },
      {
        name: '10日預測',
        type: 'line',
        data: predData,
        smooth: true,
        lineStyle: { color: '#ff4757', width: 2, type: 'dashed' },
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: { color: '#ff4757' },
      },
    ],
    // 標記分界線
    ...(history.length > 0 ? {
      visualMap: { show: false },
    } : {}),
  }

  return (
    <div className="h-full flex flex-col">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
      {currentPrice && predictions.length > 0 && (
        <div className="flex items-center justify-between text-[9px] text-gray-500 mt-1 px-1">
          <span>目前：{currentPrice.toFixed(1)}</span>
          <span>3日預測：<span className="text-neon-green">{predictions[2]?.close.toFixed(1)}</span></span>
          <span>5日預測：<span className="text-neon-orange">{predictions[4]?.close.toFixed(1)}</span></span>
          <span>10日預測：<span className="text-neon-red">{predictions[9]?.close.toFixed(1)}</span></span>
        </div>
      )}
    </div>
  )
}
