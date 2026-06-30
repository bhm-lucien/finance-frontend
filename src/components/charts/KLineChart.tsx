/**
 * K 線圖組件 — 使用 ECharts 繪製蠟燭圖 + 均線 + 成交量
 */
import ReactECharts from 'echarts-for-react'

interface OHLCVData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  ma5?: number
  ma10?: number
  ma20?: number
  ma60?: number
}

interface KLineChartProps {
  data: OHLCVData[]
}

export default function KLineChart({ data }: KLineChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8">載入中...</div>
  }

  const dates = data.map(d => d.date.slice(5)) // 只顯示 MM-DD
  const ohlc = data.map(d => [d.open, d.close, d.low, d.high])
  const volumes = data.map(d => d.volume)
  const ma5 = data.map(d => d.ma5 ?? null)
  const ma10 = data.map(d => d.ma10 ?? null)
  const ma20 = data.map(d => d.ma20 ?? null)

  const option = {
    backgroundColor: 'transparent',
    animation: false,
    grid: [
      { left: '8%', right: '4%', top: '8%', height: '48%' },
      { left: '8%', right: '4%', top: '64%', height: '16%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        gridIndex: 0,
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: { color: '#6b7280', fontSize: 12 },
        splitLine: { show: false },
      },
      {
        type: 'category',
        data: dates,
        gridIndex: 1,
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
    ],
    yAxis: [
      {
        type: 'value',
        gridIndex: 0,
        splitLine: { lineStyle: { color: '#1e3a5f33' } },
        axisLabel: { color: '#6b7280', fontSize: 12 },
        scale: true,
      },
      {
        type: 'value',
        gridIndex: 1,
        splitLine: { show: false },
        axisLabel: { show: false },
      },
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#111827',
      borderColor: '#1e3a5f',
      textStyle: { color: '#e2e8f0', fontSize: 11 },
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 60,
        end: 100,
      },
      {
        type: 'slider',
        xAxisIndex: [0, 1],
        start: 60,
        end: 100,
        height: 15,
        bottom: 2,
        borderColor: '#1e3a5f',
        backgroundColor: '#0a0e1a',
        fillerColor: 'rgba(0,212,255,0.1)',
        handleStyle: { color: '#00d4ff' },
        textStyle: { color: '#6b7280', fontSize: 9 },
      },
    ],
    series: [
      {
        name: 'K線',
        type: 'candlestick',
        data: ohlc,
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: {
          color: '#ff4757',    // 漲 — 紅
          color0: '#00ff88',   // 跌 — 綠
          borderColor: '#ff4757',
          borderColor0: '#00ff88',
        },
      },
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        smooth: true,
        lineStyle: { width: 1, color: '#ffa502' },
        symbol: 'none',
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      {
        name: 'MA10',
        type: 'line',
        data: ma10,
        smooth: true,
        lineStyle: { width: 1, color: '#00d4ff' },
        symbol: 'none',
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        smooth: true,
        lineStyle: { width: 1, color: '#a855f7' },
        symbol: 'none',
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      {
        name: '成交量',
        type: 'bar',
        data: volumes,
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: {
          color: (params: { dataIndex: number }) => {
            const idx = params.dataIndex
            return data[idx].close >= data[idx].open ? '#ff475766' : '#00ff8866'
          },
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
