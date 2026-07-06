/**
 * 模組 6 — AI 多空能量條
 */
import ModuleCard from '../ModuleCard'

interface BullBearData {
  rsi_value: number
  rsi_status: string
  macd_status: string
  kd_status: string
  k_value: number
  d_value: number
  bull_percentage: number
  bear_percentage: number
}

interface BullBearModuleProps {
  data: BullBearData | null
}

export default function BullBearModule({ data }: BullBearModuleProps) {
  if (!data) {
    return (
      <ModuleCard number={6} title="AI 多空能量條">
        <div className="text-gray-500 text-center py-4">載入中...</div>
      </ModuleCard>
    )
  }

  return (
    <ModuleCard number={6} title="AI 多空能量條">
      <div className="space-y-3">
        {/* 多方能量 */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neon-red">多方能量</span>
            <span className="text-neon-red font-bold">{data.bull_percentage}%</span>
          </div>
          <div className="h-3 bg-dark-bg rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neon-red/60 to-neon-red rounded-full transition-all" style={{ width: `${data.bull_percentage}%` }} />
          </div>
        </div>

        {/* 空方能量 */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neon-green">空方能量</span>
            <span className="text-neon-green font-bold">{data.bear_percentage}%</span>
          </div>
          <div className="h-3 bg-dark-bg rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neon-green/60 to-neon-green rounded-full transition-all" style={{ width: `${data.bear_percentage}%` }} />
          </div>
        </div>

        {/* 指標細節 */}
        <div className="pt-2 border-t border-dark-border">
          <p className="text-gray-400 mb-1">能量來源：</p>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <span className="text-gray-400">RSI</span>
              <p className="text-neon-blue font-bold">{data.rsi_value}↑</p>
            </div>
            <div className="text-center">
              <span className="text-gray-400">MACD</span>
              <p className={`font-bold ${data.macd_status === '多頭' ? 'text-neon-red' : 'text-neon-green'}`}>{data.macd_status}</p>
            </div>
            <div className="text-center">
              <span className="text-gray-400">KD</span>
              <p className="text-neon-orange font-bold">{data.kd_status}</p>
            </div>
            <div className="text-center">
              <span className="text-gray-400">量價</span>
              <p className="text-white font-bold">量增</p>
            </div>
          </div>
        </div>

        {/* 指標解析 */}
        <div className="pt-2 border-t border-dark-border space-y-1">
          <p className="text-gray-400 mb-1">指標解析：</p>
          <p className={`${data.rsi_value > 70 ? 'text-neon-red' : data.rsi_value < 30 ? 'text-neon-green' : 'text-gray-300'}`}>
            • RSI {data.rsi_value}：
            {data.rsi_value > 80 ? '嚴重超買，隨時可能回檔' :
             data.rsi_value > 70 ? '超買區，注意獲利了結壓力' :
             data.rsi_value > 50 ? '偏強勢，多方仍有力道' :
             data.rsi_value > 30 ? '偏弱勢，空方佔優' :
             data.rsi_value > 20 ? '超賣區，可能出現反彈' :
             '嚴重超賣，反彈機率大'}
          </p>
          <p className={`${data.macd_status === '多頭' ? 'text-neon-red' : 'text-neon-green'}`}>
            • MACD {data.macd_status}：
            {data.macd_status === '多頭' ? '柱狀體為正，趨勢向上，可順勢做多' : '柱狀體為負，趨勢向下，避免追高'}
          </p>
          <p className={`${data.k_value > 80 ? 'text-neon-red' : data.k_value < 20 ? 'text-neon-green' : 'text-neon-orange'}`}>
            • KD {data.kd_status}（K:{data.k_value} D:{data.d_value}）：
            {data.k_value > 80 ? '高檔鈍化，短線有過熱風險' :
             data.k_value > 50 ? 'K值在50以上，短線偏多' :
             data.k_value > 20 ? 'K值在50以下，短線偏空' :
             '低檔區，可留意止穩反彈訊號'}
          </p>
        </div>
      </div>
    </ModuleCard>
  )
}
