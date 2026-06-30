/**
 * 雷達圖組件 — 飆股雷達分析 (模組 3)
 */
import ReactECharts from 'echarts-for-react'

interface RadarChartProps {
  data: {
    trend: number
    energy: number
    chips: number
    volatility: number
    institutional: number
    mainForce: number
  }
}

export default function RadarChart({ data }: RadarChartProps) {
  const option = {
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: '趨勢強度', max: 100 },
        { name: '能態', max: 100 },
        { name: '集碼', max: 100 },
        { name: '波動', max: 100 },
        { name: '法人', max: 100 },
        { name: '主力', max: 100 },
      ],
      shape: 'polygon',
      axisLine: { lineStyle: { color: '#1e3a5f' } },
      splitLine: { lineStyle: { color: '#1e3a5f44' } },
      splitArea: { show: false },
      axisName: { color: '#9ca3af', fontSize: 14 },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [
              data.trend,
              data.energy,
              data.chips,
              data.volatility,
              data.institutional,
              data.mainForce,
            ],
            areaStyle: { color: 'rgba(255, 71, 87, 0.2)' },
            lineStyle: { color: '#ff4757', width: 2 },
            itemStyle: { color: '#ff4757' },
          },
        ],
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
    />
  )
}
