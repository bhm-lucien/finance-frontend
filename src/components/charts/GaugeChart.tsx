/**
 * 儀表盤組件 — 用於健康度評分
 */
import ReactECharts from 'echarts-for-react'

interface GaugeChartProps {
  value: number
  label: string
  color?: string
}

export default function GaugeChart({ value, label, color = '#00d4ff' }: GaugeChartProps) {
  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        radius: '90%',
        progress: {
          show: true,
          width: 8,
          itemStyle: { color },
        },
        axisLine: {
          lineStyle: { width: 8, color: [[1, '#1e3a5f']] },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        title: {
          show: true,
          offsetCenter: [0, '70%'],
          fontSize: 11,
          color: '#9ca3af',
        },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '20%'],
          fontSize: 22,
          fontWeight: 'bold',
          color,
        },
        data: [{ value, name: label }],
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
