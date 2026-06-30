/**
 * 模組 9 — 個股健康度儀表板
 */
import ModuleCard from '../ModuleCard'
import GaugeChart from '../charts/GaugeChart'

interface HealthData {
  trend: number
  chips: number
  mainForce: number
  value: number
}

interface HealthModuleProps {
  data: HealthData | null
}

export default function HealthModule({ data }: HealthModuleProps) {
  if (!data) {
    return (
      <ModuleCard number={9} title="個股健康度儀表板" badge="ECF">
        <div className="text-gray-500 text-center py-4">載入中...</div>
      </ModuleCard>
    )
  }

  const avg = Math.round((data.trend + data.chips + data.mainForce + data.value) / 4)
  const status = avg > 80 ? '過熱' : avg > 60 ? '健康' : avg > 40 ? '中性' : '低迷'
  const statusColor = avg > 80 ? 'text-neon-red' : avg > 60 ? 'text-neon-green' : avg > 40 ? 'text-neon-orange' : 'text-gray-400'

  return (
    <ModuleCard number={9} title="個股健康度儀表板" badge="ECF">
      <div className="grid grid-cols-2 gap-1 flex-1 min-h-0">
        <div className="flex flex-col items-center">
          <GaugeChart value={data.trend} label="趨勢健康" color="#ff4757" />
        </div>
        <div className="flex flex-col items-center">
          <GaugeChart value={data.chips} label="籌碼健康" color="#00d4ff" />
        </div>
        <div className="flex flex-col items-center">
          <GaugeChart value={data.mainForce} label="主力控盤" color="#ffa502" />
        </div>
        <div className="flex flex-col items-center">
          <GaugeChart value={data.value} label="價值健康" color="#a855f7" />
        </div>
      </div>
      <div className="text-center mt-2">
        <span className="text-gray-400">總評</span>
        <p className={`text-lg font-bold ${statusColor}`}>{status}</p>
      </div>
    </ModuleCard>
  )
}
