/**
 * 全方位 AI 股票分析儀表板 — 主應用程式
 * 5 欄 × 3 排 = 15 格 Dashboard 佈局
 */
import { useEffect, useState, useRef } from 'react'
import Header from './components/Header'
import StockSelector from './components/StockSelector'
import WatchlistPanel from './components/WatchlistPanel'
import StockFilterPanel from './components/StockFilterPanel'
import BacktestPanel from './components/BacktestPanel'
import IndustryTabs from './components/IndustryTabs'
import MarketBar from './components/MarketBar'
import ModuleCard from './components/ModuleCard'
import KLineChart from './components/charts/KLineChart'
import RadarChart from './components/charts/RadarChart'
import VolumeProfileChart from './components/charts/VolumeProfileChart'
import PredictionChart from './components/charts/PredictionChart'
import IntradayChart from './components/charts/IntradayChart'
import TrendLineChart from './components/charts/TrendLineChart'
import SectorFlowChart from './components/charts/SectorFlowChart'
import HeatmapChart from './components/charts/HeatmapChart'
import PERiverChart from './components/charts/PERiverChart'
import BullBearModule from './components/modules/BullBearModule'
import HealthModule from './components/modules/HealthModule'
import SectorRankModule from './components/modules/SectorRankModule'
import ChipContinuityPage from './pages/ChipContinuityPage'
import CorrelationPage from './pages/CorrelationPage'
import PortfolioHealthPage from './pages/PortfolioHealthPage'
import {
  fetchStockAnalysis, fetchForecast, fetchDayTradeRisk,
  fetchRadar, fetchScenarios, fetchHealth, fetchSignal, fetchSentiment,
  fetchSummary, fetchRealtimePrice, fetchIntradayTicks, fetchMarketIndices,
  fetchStockList, fetchDayTrading, fetchNews, fetchMarketLimitStats,
  fetchTradingAdvice, fetchBrokerAccumulation, fetchKlinePattern, fetchTrendline,
  fetchSectorFlow, fetchHeatmap, fetchPERiver, fetchChipContinuity,
} from './services/api'
import { getStockName, updateStockNames } from './data/stockNames'
import { useWatchlist } from './hooks/useWatchlist'
import { useNotification } from './hooks/useNotification'
import { useRealtimeQuote } from './hooks/useRealtimeQuote'

// ── 主組件 ──

export default function App() {
  // 狀態管理
  const [stockId, setStockId] = useState('2330')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forecast, setForecast] = useState<any>(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [dayTradeRisk, setDayTradeRisk] = useState<any>(null)
  const [radar, setRadar] = useState<any>(null)
  const [scenarios, setScenarios] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  const [signal, setSignal] = useState<any>(null)
  const [sentiment, setSentiment] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [dayTrading, setDayTrading] = useState<any>(null)
  const [news, setNews] = useState<any[]>([])
  const [realtime, setRealtime] = useState<any>(null)
  const [intradayTicks, setIntradayTicks] = useState<any[]>([])
  const [chartTab, setChartTab] = useState<'kline' | 'intraday'>('kline')
  const [marketIndices, setMarketIndices] = useState<any[]>([])
  const [limitStats, setLimitStats] = useState<{limit_up:number;limit_down:number;up_count:number;down_count:number} | null>(null)
  const [tradingAdvice, setTradingAdvice] = useState<any>(null)
  const [brokerData, setBrokerData] = useState<any>(null)
  const [klinePattern, setKlinePattern] = useState<any>(null)
  const [trendlineData, setTrendlineData] = useState<any>(null)
  const [sectorFlow, setSectorFlow] = useState<any>(null)
  const [watchlistOpen, setWatchlistOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [backtestOpen, setBacktestOpen] = useState(false)
  const [notifyEnabled, setNotifyEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chip' | 'correlation' | 'portfolio'>('dashboard')
  const [heatmapData, setHeatmapData] = useState<any>(null)
  const [peRiverData, setPeRiverData] = useState<any>(null)
  const [chipData, setChipData] = useState<any>(null)

  const { watchlist, addStock, removeStock } = useWatchlist()

  // 即時報價 WebSocket 推播
  const { quote: wsQuote, isConnected: wsConnected } = useRealtimeQuote(stockId)
  const wsConnectedRef = useRef(wsConnected)
  wsConnectedRef.current = wsConnected

  // 當 WebSocket 收到新報價時更新 realtime 狀態
  useEffect(() => {
    if (wsQuote && wsQuote.price > 0) {
      setRealtime(wsQuote)
      // 加入分時走勢
      if (wsQuote.is_realtime && wsQuote.time && wsQuote.time !== '--:--:--') {
        setIntradayTicks(prev => {
          if (prev.length > 0 && prev[prev.length - 1].time === wsQuote.time) return prev
          return [...prev, { time: wsQuote.time, price: wsQuote.price }]
        })
      }
    }
  }, [wsQuote])

  // 通知功能
  useNotification({
    enabled: notifyEnabled,
    stockId,
    signalLight: signal?.light ?? null,
    riskLevel: summary?.risk_level ?? null,
    dayTradeRisk: dayTradeRisk?.total_risk ?? null,
  })

  // 啟動時載入完整股票清單
  useEffect(() => {
    fetchStockList().then(r => { if (r.stocks) updateStockNames(r.stocks) }).catch(() => {})
  }, [])

  // 切換股票或初次載入
  useEffect(() => {
    loadData()
    loadForecast()
    loadRealtime()
    loadRealtimeModules()
    loadIntradayHistory()
    loadMarketIndices()

    const realtimeInterval = setInterval(() => {
      // WebSocket 斷線時才用 HTTP 輪詢即時報價
      if (!wsConnectedRef.current) {
        loadRealtime()
      }
      loadRealtimeModules()
    }, 30 * 1000)
    const marketInterval = setInterval(loadMarketIndices, 60 * 1000)
    const dataInterval = setInterval(loadData, 5 * 60 * 1000)

    return () => {
      clearInterval(realtimeInterval)
      clearInterval(marketInterval)
      clearInterval(dataInterval)
    }
  }, [stockId])

  async function loadData() {
    try {
      setLoading(true)
      const [result, dtr, rd, sc, hl, sg, snt, sm, dt] = await Promise.all([
        fetchStockAnalysis(stockId),
        fetchDayTradeRisk(stockId).catch(() => null),
        fetchRadar(stockId).catch(() => null),
        fetchScenarios(stockId).catch(() => null),
        fetchHealth(stockId).catch(() => null),
        fetchSignal(stockId).catch(() => null),
        fetchSentiment(stockId).catch(() => null),
        fetchSummary(stockId).catch(() => null),
        fetchDayTrading(stockId).catch(() => null),
      ])
      setData(result)
      if (dtr) setDayTradeRisk(dtr)
      if (rd) setRadar(rd)
      if (sc) setScenarios(sc)
      if (hl) setHealth(hl)
      if (sg) setSignal(sg)
      if (snt) setSentiment(snt)
      if (sm) setSummary(sm)
      if (dt) setDayTrading(dt)
      fetchNews(stockId).then(r => { if (r.news) setNews(r.news) }).catch(() => {})
      fetchTradingAdvice(stockId).then(r => { if (!r.error) setTradingAdvice(r) }).catch(() => {})
      fetchBrokerAccumulation(stockId).then(r => { if (r.forces) setBrokerData(r) }).catch(() => {})
      fetchKlinePattern(stockId).then(r => { if (r.short_term) setKlinePattern(r) }).catch(() => {})
      fetchTrendline(stockId).then(r => { if (r.ohlcv) setTrendlineData(r) }).catch(() => {})
      setError(null)
    } catch (err) {
      setError('無法載入資料，請確認後端伺服器是否啟動')
      console.error(err)
    } finally {
      setLoading(false)
    }

    // 獨立載入（不依賴 analysis 成功）
    fetchPERiver(stockId).then(r => { if (r.data) setPeRiverData(r) }).catch(() => {})
    fetchChipContinuity(stockId).then(r => { if (r.stock_id) setChipData(r) }).catch(() => {})
  }

  async function loadForecast() {
    try {
      setForecastLoading(true)
      const result = await fetchForecast(stockId)
      setForecast(result)
    } catch (err) {
      console.error('預測載入失敗:', err)
    } finally {
      setForecastLoading(false)
    }
  }

  async function loadRealtime() {
    try {
      const result = await fetchRealtimePrice(stockId)
      if (result.price > 0) {
        setRealtime(result)
        if (result.is_realtime && result.time && result.time !== '--:--:--') {
          setIntradayTicks(prev => {
            if (prev.length > 0 && prev[prev.length - 1].time === result.time) return prev
            return [...prev, { time: result.time, price: result.price }]
          })
        }
      }
    } catch { /* 靜默 */ }
  }

  async function loadRealtimeModules() {
    // 每 30 秒更新跟盤中價格相關的模組
    try {
      const [dtr, dt, ta, br] = await Promise.all([
        fetchDayTradeRisk(stockId).catch(() => null),
        fetchDayTrading(stockId).catch(() => null),
        fetchTradingAdvice(stockId).catch(() => null),
        fetchBrokerAccumulation(stockId).catch(() => null),
      ])
      if (dtr) setDayTradeRisk(dtr)
      if (dt) setDayTrading(dt)
      if (ta && !ta.error) setTradingAdvice(ta)
      if (br?.forces) setBrokerData(br)
    } catch { /* 靜默 */ }
  }

  async function loadIntradayHistory() {
    try {
      const result = await fetchIntradayTicks(stockId)
      if (result.ticks?.length > 0) setIntradayTicks(result.ticks)
    } catch { /* 靜默 */ }
  }

  async function loadMarketIndices() {
    try {
      const [result, limits] = await Promise.all([
        fetchMarketIndices(),
        fetchMarketLimitStats().catch(() => null),
      ])
      if (result.indices) setMarketIndices(result.indices)
      if (limits) setLimitStats(limits)
      // 同時載入板塊資金流向 + 熱力圖
      fetchSectorFlow(5).then(r => { if (r.sectors) setSectorFlow(r) }).catch(() => {})
      fetchHeatmap().then(r => { if (r.sectors) setHeatmapData(r) }).catch(() => {})
    } catch { /* 靜默 */ }
  }

  function handleStockChange(id: string) {
    setStockId(id)
    setForecast(null)
    setForecastLoading(false)
    setIntradayTicks([])
    setRealtime(null)
  }

  function getKlineWithRealtime() {
    const ohlcv = data?.indicators.ohlcv ?? []
    if (!ohlcv.length || !realtime?.is_realtime || realtime.price === 0) return ohlcv
    const updated = [...ohlcv]
    const last = { ...updated[updated.length - 1] }
    last.close = realtime.price
    if (realtime.high > 0) last.high = Math.max(last.high ?? 0, realtime.high)
    if (realtime.low > 0) last.low = Math.min(last.low ?? last.close, realtime.low)
    if (realtime.open > 0) last.open = realtime.open
    updated[updated.length - 1] = last
    return updated
  }

  const healthData = health ?? (data ? { trend: 60, chips: 50, mainForce: 65, value: 70 } : null)
  const radarFallback = { trend: 50, energy: 50, chips: 50, volatility: 50, institutional: 50, mainForce: 50 }

  // ── 渲染 ──
  return (
    <div className="bg-dark-bg text-white min-h-screen lg:h-screen lg:overflow-hidden flex flex-col">
      {/* 頂部 Header */}
      <Header stockId={stockId} stockName={getStockName(stockId)} latest={data?.latest ?? null} realtime={realtime}>
        <StockSelector currentStock={stockId} onSelect={handleStockChange} loading={loading} />
        <button onClick={() => setWatchlistOpen(true)} className="px-2 py-1 text-xs border border-dark-border rounded hover:border-neon-blue/50 text-gray-400 hover:text-neon-blue transition" title="自選股清單">
          ★ 自選 ({watchlist.length})
        </button>
        <button onClick={() => setFilterOpen(true)} className="px-2 py-1 text-xs border border-dark-border rounded hover:border-neon-purple/50 text-gray-400 hover:text-neon-purple transition" title="條件篩選器">
          🔍 篩選
        </button>
        <button onClick={() => setBacktestOpen(true)} className="px-2 py-1 text-xs border border-dark-border rounded hover:border-neon-orange/50 text-gray-400 hover:text-neon-orange transition" title="策略回測">
          📊 回測
        </button>
        <button onClick={() => setNotifyEnabled(!notifyEnabled)} className={`px-2 py-1 text-xs border rounded transition ${notifyEnabled ? 'border-neon-green/30 text-neon-green bg-neon-green/10' : 'border-dark-border text-gray-500'}`} title={notifyEnabled ? '通知已開啟' : '通知已關閉'}>
          {notifyEnabled ? '🔔' : '🔕'}
        </button>
      </Header>

      {/* 自選股面板 */}
      <WatchlistPanel isOpen={watchlistOpen} onClose={() => setWatchlistOpen(false)} watchlist={watchlist} currentStock={stockId} onSelect={(id) => { handleStockChange(id); setWatchlistOpen(false) }} onAdd={addStock} onRemove={removeStock} />

      {/* 條件篩選器面板 */}
      <StockFilterPanel isOpen={filterOpen} onClose={() => setFilterOpen(false)} onSelect={(id) => { handleStockChange(id); setFilterOpen(false) }} />

      {/* 策略回測面板 */}
      <BacktestPanel isOpen={backtestOpen} onClose={() => setBacktestOpen(false)} stockId={stockId} />

      {/* 產業分類頁籤 */}
      <div className="hidden lg:block px-3 py-1.5 border-b border-dark-border/50 bg-dark-card/30">
        <IndustryTabs onSelect={handleStockChange} currentStock={stockId} />
      </div>

      {/* 大盤指標列 */}
      <MarketBar indices={marketIndices} limitStats={limitStats} />

      {/* Tab 切換列 */}
      <div className="px-3 py-1 border-b border-dark-border/50 bg-dark-card/30 flex items-center gap-1 flex-shrink-0 overflow-x-auto">
        {[
          { key: 'dashboard', label: '📊 Dashboard', },
          { key: 'chip', label: '🏦 籌碼連續性', },
          { key: 'correlation', label: '🔗 相關性分析', },
          { key: 'portfolio', label: '🏥 持倉健檢', },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1 text-xs rounded transition ${
              activeTab === tab.key
                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-surface/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="mx-4 mt-2 p-2 rounded bg-neon-red/10 border border-neon-red/30 text-neon-red text-sm">
          {error} <button onClick={loadData} className="ml-4 underline">重試</button>
        </div>
      )}

      {/* === Tab 內容 === */}
      {activeTab === 'chip' && (
        <div className="flex-1 overflow-hidden">
          <ChipContinuityPage onSelectStock={handleStockChange} />
        </div>
      )}
      {activeTab === 'correlation' && (
        <div className="flex-1 overflow-hidden">
          <CorrelationPage watchlist={watchlist} />
        </div>
      )}
      {activeTab === 'portfolio' && (
        <div className="flex-1 overflow-hidden">
          <PortfolioHealthPage />
        </div>
      )}

      {/* === 主區塊：左右分欄 7:3（只在 Dashboard tab 顯示）=== */}
      {activeTab === 'dashboard' && (
      <main className="flex-1 flex flex-col lg:flex-row gap-3 p-3 lg:overflow-hidden lg:min-h-0 pb-20">
        {/* 左半邊 grid — 模組 */}
        <div className="w-full lg:flex-[7] grid grid-cols-1 lg:grid-cols-3 gap-2 lg:overflow-y-auto" style={{ gridAutoRows: 'minmax(280px, auto)' }}>

        {/* ── 第一排 ── */}
        {/* 1. 產業資金流向 */}
        <ModuleCard number={1} title="產業資金流向">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-1.5 flex-shrink-0">
              {sectorFlow?.summary && (
                <>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">漲潮 {sectorFlow.summary.rising}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">輪動 {sectorFlow.summary.rotating}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-600/20 text-gray-400">觀望 {sectorFlow.summary.watching}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">退潮 {sectorFlow.summary.falling}</span>
                </>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <SectorFlowChart sectors={sectorFlow?.sectors ?? []} />
            </div>
          </div>
        </ModuleCard>

        {/* 2. 今日產業焦點 */}
        <ModuleCard number={2} title="今日產業焦點">
          <SectorRankModule sectors={sectorFlow?.sectors ?? []} onSelectStock={handleStockChange} />
        </ModuleCard>

        {/* 3. 主力意圖 */}
        <ModuleCard number={3} title="即時行情熱力圖">
          <div className="h-full">
            <HeatmapChart
              sectors={heatmapData?.sectors ?? []}
              onSelectStock={handleStockChange}
            />
          </div>
        </ModuleCard>

        {/* 2. K 線型態辨識 */}
        <ModuleCard number={4} title="K 線型態辨識">
          <div className="space-y-2 overflow-y-auto h-full">
            {!klinePattern ? (
              <p className="text-gray-500 text-center py-4">分析中...</p>
            ) : (
              <>
                <div className="p-2 rounded bg-dark-surface/50 border border-dark-border/30">
                  <p className="text-gray-300 text-sm">{klinePattern.summary}</p>
                </div>
                {klinePattern.short_term?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-gray-400 text-xs font-bold">▎短期型態（1~3 日）</p>
                    {klinePattern.short_term.map((p: any, i: number) => (
                      <div key={i} className={`p-2 rounded border ${
                        p.type === 'bullish' ? 'bg-neon-red/5 border-neon-red/20' :
                        p.type === 'bearish' ? 'bg-neon-green/5 border-neon-green/20' :
                        'bg-gray-800/30 border-gray-600/20'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-sm ${
                            p.type === 'bullish' ? 'text-neon-red' :
                            p.type === 'bearish' ? 'text-neon-green' :
                            'text-gray-300'
                          }`}>{p.name}</span>
                          <span className="text-gray-500 text-xs">{'★'.repeat(p.reliability)}{'☆'.repeat(5 - p.reliability)}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">{p.meaning}</p>
                        <p className="text-gray-300 text-xs mt-0.5">→ {p.prediction}</p>
                      </div>
                    ))}
                  </div>
                )}
                {klinePattern.long_term?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-gray-400 text-xs font-bold">▎中長期型態</p>
                    {klinePattern.long_term.map((p: any, i: number) => (
                      <div key={i} className={`p-2 rounded border ${
                        p.type === 'bullish' ? 'bg-neon-red/5 border-neon-red/20' :
                        p.type === 'bearish' ? 'bg-neon-green/5 border-neon-green/20' :
                        'bg-gray-800/30 border-gray-600/20'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-sm ${
                            p.type === 'bullish' ? 'text-neon-red' :
                            p.type === 'bearish' ? 'text-neon-green' :
                            'text-gray-300'
                          }`}>{p.name}</span>
                          <span className="text-gray-500 text-xs">{'★'.repeat(p.reliability)}{'☆'.repeat(5 - p.reliability)}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">{p.meaning}</p>
                        <p className="text-gray-300 text-xs mt-0.5">→ {p.prediction}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ModuleCard>

        {/* 3. K棒趨勢線 */}
        <ModuleCard number={5} title="K棒趨勢線">
          <div className="h-full">
            {!trendlineData ? (
              <p className="text-gray-500 text-center py-8">分析中...</p>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-gray-400 text-xs">趨勢方向：</span>
                  <span className={`text-sm font-bold ${
                    trendlineData.trend_direction === '上升' ? 'text-neon-red' :
                    trendlineData.trend_direction === '下降' ? 'text-neon-green' :
                    'text-neon-orange'
                  }`}>{trendlineData.trend_direction}</span>
                </div>
                <div className="flex-1 min-h-0">
                  <TrendLineChart
                    data={trendlineData.ohlcv}
                    supportLine={trendlineData.support_line}
                    resistanceLine={trendlineData.resistance_line}
                    supportAtCurrent={trendlineData.support_at_current}
                    resistanceAtCurrent={trendlineData.resistance_at_current}
                  />
                </div>
              </div>
            )}
          </div>
        </ModuleCard>

        {/* 本益比河流圖 */}
        <ModuleCard number={6} title="本益比河流圖">
          <div className="h-full">
            {!peRiverData ? (
              <p className="text-gray-500 text-center py-8">分析中...</p>
            ) : (
              <PERiverChart
                data={peRiverData.data}
                currentZone={peRiverData.current_zone}
                currentPercentile={peRiverData.current_percentile}
              />
            )}
          </div>
        </ModuleCard>

        {/* 籌碼連續性（個股） */}
        <ModuleCard number={7} title="法人連買/大戶持股">
          <div className="space-y-2">
            {!chipData ? (
              <p className="text-gray-500 text-center py-4">載入中...</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-neon-red/5 border border-neon-red/20 text-center">
                    <p className="text-gray-500 text-[10px]">外資連買</p>
                    <p className={`text-lg font-bold ${chipData.foreign_streak > 0 ? 'text-neon-red' : chipData.foreign_streak < 0 ? 'text-neon-green' : 'text-gray-400'}`}>
                      {chipData.foreign_streak > 0 ? `${chipData.foreign_streak}天` : chipData.foreign_streak < 0 ? `連賣${Math.abs(chipData.foreign_streak)}天` : '—'}
                    </p>
                    <p className="text-gray-500 text-[10px]">累計 {chipData.foreign_total > 0 ? '+' : ''}{chipData.foreign_total.toLocaleString()} 張</p>
                  </div>
                  <div className="p-2 rounded bg-neon-purple/5 border border-neon-purple/20 text-center">
                    <p className="text-gray-500 text-[10px]">投信連買</p>
                    <p className={`text-lg font-bold ${chipData.trust_streak > 0 ? 'text-neon-red' : chipData.trust_streak < 0 ? 'text-neon-green' : 'text-gray-400'}`}>
                      {chipData.trust_streak > 0 ? `${chipData.trust_streak}天` : chipData.trust_streak < 0 ? `連賣${Math.abs(chipData.trust_streak)}天` : '—'}
                    </p>
                    <p className="text-gray-500 text-[10px]">累計 {chipData.trust_total > 0 ? '+' : ''}{chipData.trust_total.toLocaleString()} 張</p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-1 border-t border-dark-border/30">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">融資趨勢</span>
                    <span className={`${chipData.margin_trend === '增加' ? 'text-neon-orange' : chipData.margin_trend === '減少' ? 'text-neon-blue' : 'text-gray-400'}`}>
                      {chipData.margin_trend}（{chipData.margin_change > 0 ? '+' : ''}{chipData.margin_change.toLocaleString()}張）
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">融券趨勢</span>
                    <span className={`${chipData.short_trend === '增加' ? 'text-neon-orange' : chipData.short_trend === '減少' ? 'text-neon-blue' : 'text-gray-400'}`}>
                      {chipData.short_trend}（{chipData.short_change > 0 ? '+' : ''}{chipData.short_change.toLocaleString()}張）
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">大戶持股變化</span>
                    <span className={`font-bold ${chipData.big_holder_change > 0 ? 'text-neon-red' : chipData.big_holder_change < 0 ? 'text-neon-green' : 'text-gray-400'}`}>
                      {chipData.big_holder_change > 0 ? '+' : ''}{chipData.big_holder_change}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </ModuleCard>

        {/* 4. 隔日沖風險 */}
        <ModuleCard number={8} title="隔日沖風險分析圖">
          <div className="space-y-2">
            <div className="text-center py-1">
              <p className="text-gray-500 mb-1">隔日沖風險：</p>
              <p className={`text-4xl font-bold number-highlight ${(dayTradeRisk?.total_risk ?? 0) >= 70 ? 'text-neon-red' : (dayTradeRisk?.total_risk ?? 0) >= 40 ? 'text-neon-orange' : 'text-neon-green'}`}>{dayTradeRisk?.total_risk ?? '--'}%</p>
              <div className="mt-2 mx-auto w-4/5 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-orange to-neon-red rounded-full transition-all duration-700" style={{ width: `${dayTradeRisk?.total_risk ?? 0}%` }} />
              </div>
              <div className="flex justify-between text-gray-600 mx-auto w-4/5 mt-0.5"><span>低 25%</span><span>50%</span><span>75%</span><span>100%</span></div>
            </div>
            <div className="space-y-1">
              {dayTradeRisk?.details && Object.values(dayTradeRisk.details).map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-gray-400">
                  <span>{item.label}</span>
                  <span className={`font-medium ${item.level === '高' ? 'text-neon-red' : item.level === '中' ? 'text-neon-orange' : 'text-neon-green'}`}>{item.level}</span>
                </div>
              ))}
            </div>
            <div className="pt-1 border-t border-dark-border/50 text-gray-500">
              <p>籌碼穩定度：<span className="text-neon-orange">{'★'.repeat(dayTradeRisk?.stability_stars ?? 3)}{'☆'.repeat(5 - (dayTradeRisk?.stability_stars ?? 3))}</span></p>
              <p>明日出貨風險：<span className={`font-bold ${dayTradeRisk?.tomorrow_risk === '高' ? 'text-neon-red' : dayTradeRisk?.tomorrow_risk === '中' ? 'text-neon-orange' : 'text-neon-green'}`}>{dayTradeRisk?.tomorrow_risk ?? '--'}</span></p>
            </div>
          </div>
        </ModuleCard>

        {/* 5. 當沖指標（做多/做空方向） */}
        <ModuleCard number={9} title="當沖指標">
          <div className="space-y-2">
            {/* 基本指標 */}
            <div className="grid grid-cols-4 gap-1.5 text-center pb-1.5 border-b border-dark-border/30">
              <div><p className="text-gray-500 text-xs">當沖比率</p><p className="text-white font-medium text-sm">{dayTrading?.day_trade_ratio ?? 0}%</p></div>
              <div><p className="text-gray-500 text-xs">當沖量比</p><p className="text-white font-medium text-sm">{dayTrading?.day_trade_volume_ratio ?? 0}x</p></div>
              <div><p className="text-gray-500 text-xs">成交比重</p><p className="text-white font-medium text-sm">{dayTrading?.trade_weight ?? 0}%</p></div>
              <div><p className="text-gray-500 text-xs">VWAP</p><p className="text-neon-blue font-medium text-sm">{dayTrading?.vwap ?? 0}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center pb-1.5 border-b border-dark-border/30">
              <div><p className="text-gray-500 text-xs">今日振幅</p><p className="text-white font-medium text-sm">{dayTrading?.spread_today ?? 0}%</p></div>
              <div><p className="text-gray-500 text-xs">ATR</p><p className="text-white font-medium text-sm">{dayTrading?.atr ?? 0} ({dayTrading?.atr_pct ?? 0}%)</p></div>
              <div><p className="text-gray-500 text-xs">缺口</p><p className={`font-medium text-sm ${(dayTrading?.gap_pct ?? 0) > 0 ? 'text-neon-red' : (dayTrading?.gap_pct ?? 0) < 0 ? 'text-neon-green' : 'text-gray-400'}`}>{dayTrading?.gap_pct ?? 0}%</p></div>
            </div>

            {/* 做多方向 */}
            <div className="p-2 rounded bg-neon-red/5 border border-neon-red/20">
              <div className="flex items-center justify-between mb-1">
                <p className="text-neon-red font-bold">▲ 做多方向</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">風報比 <span className={`font-bold ${(dayTrading?.long?.risk_reward ?? 0) >= 2 ? 'text-neon-green' : (dayTrading?.long?.risk_reward ?? 0) >= 1.5 ? 'text-neon-orange' : 'text-neon-red'}`}>{dayTrading?.long?.risk_reward ?? 0}</span></span>
                  <span className="text-gray-500 text-xs">評分 {dayTrading?.long?.score ?? 0}/8</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-1">判斷：<span className="text-neon-red font-medium">{dayTrading?.long?.direction ?? '--'}</span></p>
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div><span className="text-gray-500">進場</span><p className="text-white font-medium">{dayTrading?.long?.entry ?? 0}</p></div>
                <div><span className="text-gray-500">目標</span><p className="text-neon-green font-medium">{dayTrading?.long?.target ?? 0}</p></div>
                <div><span className="text-gray-500">停損</span><p className="text-neon-red font-medium">{dayTrading?.long?.stop_loss ?? 0}</p></div>
              </div>
              {dayTrading?.long?.reasons?.length > 0 && (
                <div className="mt-1 pt-1 border-t border-neon-red/10 space-y-0.5">
                  {dayTrading.long.reasons.map((r: string, i: number) => (<p key={i} className="text-gray-400 text-xs">• {r}</p>))}
                </div>
              )}
            </div>

            {/* 做空方向 */}
            <div className="p-2 rounded bg-neon-green/5 border border-neon-green/20">
              <div className="flex items-center justify-between mb-1">
                <p className="text-neon-green font-bold">▼ 做空方向</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">風報比 <span className={`font-bold ${(dayTrading?.short?.risk_reward ?? 0) >= 2 ? 'text-neon-green' : (dayTrading?.short?.risk_reward ?? 0) >= 1.5 ? 'text-neon-orange' : 'text-neon-red'}`}>{dayTrading?.short?.risk_reward ?? 0}</span></span>
                  <span className="text-gray-500 text-xs">評分 {dayTrading?.short?.score ?? 0}/8</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-1">判斷：<span className="text-neon-green font-medium">{dayTrading?.short?.direction ?? '--'}</span></p>
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div><span className="text-gray-500">進場</span><p className="text-white font-medium">{dayTrading?.short?.entry ?? 0}</p></div>
                <div><span className="text-gray-500">目標</span><p className="text-neon-green font-medium">{dayTrading?.short?.target ?? 0}</p></div>
                <div><span className="text-gray-500">停損</span><p className="text-neon-red font-medium">{dayTrading?.short?.stop_loss ?? 0}</p></div>
              </div>
              {dayTrading?.short?.reasons?.length > 0 && (
                <div className="mt-1 pt-1 border-t border-neon-green/10 space-y-0.5">
                  {dayTrading.short.reasons.map((r: string, i: number) => (<p key={i} className="text-gray-400 text-xs">• {r}</p>))}
                </div>
              )}
            </div>
          </div>
        </ModuleCard>

        {/* 6. 飆股雷達 */}
        <ModuleCard number={6} title="飆股雷達圖">
          <RadarChart data={radar?.scores ?? radarFallback} />
          <div className="text-center mt-1">
            <span className="text-gray-400">飆股等級：</span>
            <span className="text-neon-blue font-bold text-lg">{radar?.grade ?? '--'}</span>
            <span className="text-gray-500 ml-3">風險值：</span>
            <span className="text-neon-orange font-bold">{radar?.risk_value ?? '--'}/100</span>
          </div>
        </ModuleCard>

        {/* 7. 劇本推演 */}
        <ModuleCard number={7} title="明日劇本推演圖">
          <div className="space-y-2">
            {(scenarios?.scenarios ?? [{name:'突破上漲',probability:33,color:'red',condition:'--',target:0,stop:0},{name:'震盪整理',probability:34,color:'orange',condition:'--',target:0,stop:0},{name:'轉弱下跌',probability:33,color:'green',condition:'--',target:0,stop:0}]).map((s: any, i: number) => (
              <div key={i} className={`p-2 rounded border ${s.color === 'red' ? 'bg-neon-red/10 border-neon-red/30' : s.color === 'orange' ? 'bg-neon-orange/10 border-neon-orange/30' : 'bg-neon-green/10 border-neon-green/30'}`}>
                <p className={`font-bold ${s.color === 'red' ? 'text-neon-red' : s.color === 'orange' ? 'text-neon-orange' : 'text-neon-green'}`}>
                  劇本{i+1} {s.name} <span className="float-right">（機率 {s.probability}%）</span>
                </p>
                <p className="text-gray-400 mt-0.5">條件：{s.condition}</p>
                {s.target > 0 && <p className="text-gray-500 mt-0.5">目標價：{s.target} ｜ 停損：{s.stop}</p>}
              </div>
            ))}
          </div>
        </ModuleCard>

        {/* ── 第二排 ── */}
        {/* 8. 多空能量 */}
        <BullBearModule data={data?.indicators.bull_bear ?? null} />

        {/* 9. K線 / 分時走勢 */}
        <ModuleCard number={9} title="主力成本線分析圖">
          <div className="h-full flex flex-col">
            <div className="flex gap-1 mb-1">
              <button onClick={() => setChartTab('kline')} className={`px-2 py-0.5 rounded ${chartTab === 'kline' ? 'bg-neon-blue/20 text-neon-blue' : 'text-gray-500 hover:text-gray-300'}`}>日K線</button>
              <button onClick={() => setChartTab('intraday')} className={`px-2 py-0.5 rounded ${chartTab === 'intraday' ? 'bg-neon-blue/20 text-neon-blue' : 'text-gray-500 hover:text-gray-300'}`}>分時走勢</button>
              {realtime?.is_realtime && <span className="ml-auto text-neon-green animate-pulse">● LIVE</span>}
            </div>
            <div className="flex-1 min-h-0">
              {chartTab === 'kline' ? <KLineChart data={getKlineWithRealtime()} /> : <IntradayChart ticks={intradayTicks} yesterdayClose={realtime?.yesterday_close ?? data?.latest?.close ?? 0} />}
            </div>
          </div>
        </ModuleCard>

        {/* 10. 籌碼熱區 */}
        <ModuleCard number={10} title="AI 籌碼熱區圖">
          <VolumeProfileChart data={data?.indicators.volume_profile ?? []} currentPrice={data?.latest.close} />
        </ModuleCard>

        {/* 11. 健康度 */}
        <HealthModule data={healthData} />

        {/* 12. 預警燈號 */}
        <ModuleCard number={12} title="AI 飆股預警燈號系統">
          <div className="space-y-2">
            <div className={`p-2 rounded border ${signal?.light === 'red' ? 'bg-neon-red/10 border-neon-red/30' : signal?.light === 'orange' ? 'bg-neon-orange/10 border-neon-orange/30' : signal?.light === 'green' ? 'bg-neon-green/10 border-neon-green/30' : 'bg-gray-800/50 border-gray-600/30'}`}>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full animate-pulse ${signal?.light === 'red' ? 'bg-neon-red' : signal?.light === 'orange' ? 'bg-neon-orange' : signal?.light === 'green' ? 'bg-neon-green' : 'bg-gray-500'}`} />
                <span className="font-bold text-white">{signal?.label ?? '載入中'}（目前狀態）</span>
              </div>
              <p className="text-gray-400 mt-1">{signal?.reason ?? ''}</p>
            </div>
            <hr className="border-dark-border/30" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-neon-red" /><span className="text-gray-400">紅燈：主力出貨</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-neon-orange" /><span className="text-gray-400">黃橙：過熱整理</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-neon-green" /><span className="text-gray-400">綠燈：低檔轉強</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-gray-600" /><span className="text-gray-400">黑燈：跌破趨勢</span></div>
            </div>
          </div>
        </ModuleCard>

        {/* ── 第三排 ── */}
        {/* 13. LSTM 預測 */}
        <ModuleCard number={13} title="類神經 AI 預測路徑圖">
          <PredictionChart history={forecast?.history ?? []} predictions={forecast?.predictions ?? []} currentPrice={forecast?.current_price} loading={forecastLoading} />
        </ModuleCard>

        {/* 14. 情緒指數 */}
        <ModuleCard number={14} title="台股情緒指數圖">
          <div className="space-y-2">
            <div className="text-center">
              <p className="text-gray-400 mb-1">市場情緒</p>
              <p className={`text-2xl font-bold ${(sentiment?.total ?? 50) >= 55 ? 'text-neon-red' : (sentiment?.total ?? 50) >= 45 ? 'text-neon-orange' : 'text-neon-green'}`}>{sentiment?.label ?? '中性'}</p>
              <p className="text-neon-orange text-xl font-bold">{sentiment?.total ?? 50}<span className="text-gray-400">/100</span></p>
            </div>
            <div className="flex justify-between text-gray-500 px-2"><span className="text-neon-green">恐懼</span><span>中性</span><span className="text-neon-red">貪婪</span></div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1 border-t border-dark-border/30">
              {sentiment?.details && Object.values(sentiment.details).map((d: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-500">{d.label}</span>
                  <span className={`font-medium ${d.value >= 55 ? 'text-neon-red' : d.value <= 45 ? 'text-neon-green' : 'text-gray-300'}`}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ModuleCard>





        {/* 15. 即時新聞 */}
        <ModuleCard number={15} title="即時財經新聞">
          <div className="space-y-1.5 overflow-y-auto h-full">
            {news.length === 0 ? (
              <p className="text-gray-500 text-center py-4">載入中...</p>
            ) : news.map((n: any, i: number) => (
              <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" className="block px-2 py-1.5 rounded hover:bg-dark-surface/50 transition border-b border-dark-border/20 last:border-0">
                <div className="flex items-start gap-2">
                  <span className={`px-1 py-0.5 rounded flex-shrink-0 ${n.category === '國際' ? 'bg-neon-purple/20 text-neon-purple' : n.category === '台股' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-neon-orange/20 text-neon-orange'}`}>{n.category}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 leading-snug line-clamp-2">{n.title}</p>
                    <p className="text-gray-500 mt-0.5">{n.source} · {n.time}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </ModuleCard>

        </div>

        {/* 右半邊 — AI 操盤建議面板（精簡版） */}
        <aside className="w-full lg:flex-[3] lg:overflow-y-auto rounded-lg border border-dark-border bg-dark-card p-4 space-y-4 order-first lg:order-none max-h-[50vh] lg:max-h-none overflow-y-auto">
          <h2 className="text-lg font-bold text-neon-blue border-b border-dark-border/50 pb-2">AI 操盤建議</h2>

          {/* 1. 一段話總結 */}
          <div className="space-y-2">
            <p className={`font-bold text-sm leading-relaxed ${summary?.risk_level === '高' ? 'text-neon-red' : summary?.risk_level === '中高' ? 'text-neon-orange' : summary?.risk_level === '低' ? 'text-neon-green' : 'text-white'}`}>
              {summary?.conclusion ?? '載入中...'}
            </p>
            {tradingAdvice?.best_strategy && (
              <p className="text-gray-300 text-sm leading-relaxed">
                {tradingAdvice.best_strategy.logic}
                {tradingAdvice.best_strategy.best_win_rate > 0 && (
                  <span className="text-neon-blue">（歷史勝率 {tradingAdvice.best_strategy.best_win_rate}%）</span>
                )}
              </p>
            )}
            {summary?.points && summary.points.length > 0 && (
              <ul className="text-gray-400 space-y-0.5 list-disc list-inside text-xs">
                {summary.points.slice(0, 3).map((p: string, i: number) => (<li key={i}>{p}</li>))}
              </ul>
            )}
          </div>

          {/* 2. 關鍵數據 */}
          {tradingAdvice && (
            <div className="space-y-3 pt-2 border-t border-dark-border/30">
              {/* 風險 + 風報比 + 操作 */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-gray-500 text-xs">風險</p>
                  <p className={`font-bold ${summary?.risk_level === '高' ? 'text-neon-red' : summary?.risk_level === '中高' ? 'text-neon-orange' : 'text-neon-green'}`}>{summary?.risk_level ?? '--'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">風報比</p>
                  <p className={`font-bold ${tradingAdvice.risk_reward?.rating === '佳' ? 'text-neon-green' : tradingAdvice.risk_reward?.rating === '普通' ? 'text-neon-orange' : 'text-neon-red'}`}>{tradingAdvice.risk_reward?.buy_rr ?? '--'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">建議</p>
                  <p className="text-white font-bold">{summary?.suggestion ?? '--'}</p>
                </div>
              </div>

              {/* 波段區間（一行式） */}
              <div className="p-2 rounded bg-dark-surface/50 border border-dark-border/30 space-y-1">
                <p className="text-gray-400 text-xs font-bold">📈 波段操作</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">買進</span>
                  <span className="text-neon-green font-bold">{tradingAdvice.buy_zone?.ideal} ~ {tradingAdvice.buy_zone?.support_1}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">停利</span>
                  <span className="text-neon-red font-bold">{tradingAdvice.sell_zone?.resistance}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">停損</span>
                  <span className="text-neon-red">{tradingAdvice.stop_loss}</span>
                </div>
              </div>

              {/* 當沖區間（一行式） */}
              {tradingAdvice.day_trade_zone && (
                <div className="p-2 rounded bg-dark-surface/50 border border-dark-border/30 space-y-1">
                  <p className="text-gray-400 text-xs font-bold">⚡ 當沖操作</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-neon-red text-xs">做多</span>
                      <p className="text-gray-300">{tradingAdvice.day_trade_zone.buy_entry} → <span className="text-neon-green font-bold">{tradingAdvice.day_trade_zone.buy_target}</span></p>
                      <p className="text-gray-500 text-xs">停損 {tradingAdvice.day_trade_zone.buy_stop}</p>
                    </div>
                    <div>
                      <span className="text-neon-green text-xs">做空</span>
                      <p className="text-gray-300">{tradingAdvice.day_trade_zone.sell_entry} → <span className="text-neon-green font-bold">{tradingAdvice.day_trade_zone.sell_target}</span></p>
                      <p className="text-gray-500 text-xs">停損 {tradingAdvice.day_trade_zone.sell_stop}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. 三時段預測（精簡一行式） */}
          {tradingAdvice?.predictions && (
            <div className="pt-2 border-t border-dark-border/30">
              <p className="text-gray-400 text-xs font-bold mb-1.5">🔮 預測</p>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-1.5 rounded bg-dark-surface/30">
                  <p className="text-gray-500 text-xs">盤前</p>
                  <p className={`text-sm font-bold ${tradingAdvice.predictions.pre_market.est_change_pct >= 0 ? 'text-neon-red' : 'text-neon-green'}`}>{tradingAdvice.predictions.pre_market.direction}</p>
                </div>
                <div className="p-1.5 rounded bg-dark-surface/30">
                  <p className="text-gray-500 text-xs">收盤</p>
                  <p className="text-white text-sm font-bold">{tradingAdvice.predictions.intraday.est_close}</p>
                </div>
                <div className="p-1.5 rounded bg-dark-surface/30">
                  <p className="text-gray-500 text-xs">明日</p>
                  <p className={`text-sm font-bold ${tradingAdvice.predictions.after_market.tomorrow_direction === '偏多' || tradingAdvice.predictions.after_market.tomorrow_direction === '超賣反彈' ? 'text-neon-red' : tradingAdvice.predictions.after_market.tomorrow_direction === '偏空' || tradingAdvice.predictions.after_market.tomorrow_direction === '過熱拉回' ? 'text-neon-green' : 'text-gray-300'}`}>{tradingAdvice.predictions.after_market.tomorrow_direction}</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. 誰在拉抬 */}
          <div className="pt-2 border-t border-dark-border/30 space-y-2">
            <p className="text-gray-400 text-xs font-bold">🏦 誰在拉抬？</p>
            {!brokerData?.forces ? (
              <p className="text-gray-500 text-center text-sm py-2">載入中...</p>
            ) : (
              <>
                <p className="text-neon-blue text-sm font-bold">{brokerData.conclusion}</p>
                <div className="space-y-1">
                  {Object.values(brokerData.forces).map((f: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${f.net_buy > 0 ? 'bg-neon-red' : f.net_buy < 0 ? 'bg-neon-green' : 'bg-gray-500'}`} />
                        <span className="text-gray-300 text-sm">{f.name}</span>
                      </div>
                      <span className={`text-sm font-bold ${f.net_buy > 0 ? 'text-neon-red' : f.net_buy < 0 ? 'text-neon-green' : 'text-gray-400'}`}>
                        {f.net_buy > 0 ? '+' : ''}{f.net_buy}
                      </span>
                    </div>
                  ))}
                </div>
                {(brokerData.top_buyers?.length > 0 || brokerData.top_sellers?.length > 0) && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    {brokerData.top_buyers?.length > 0 && (
                      <div>
                        <p className="text-gray-500 mb-0.5">買超前三</p>
                        {brokerData.top_buyers.map((b: any, i: number) => (
                          <p key={i} className="text-gray-400 truncate">{b.broker} <span className="text-neon-red">+{b.net_buy}</span></p>
                        ))}
                      </div>
                    )}
                    {brokerData.top_sellers?.length > 0 && (
                      <div>
                        <p className="text-gray-500 mb-0.5">賣超前三</p>
                        {brokerData.top_sellers.map((b: any, i: number) => (
                          <p key={i} className="text-gray-400 truncate">{b.broker} <span className="text-neon-green">-{b.net_sell}</span></p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </main>
      )}

      {/* 底部聲明 */}
      <footer className="text-center text-gray-600 py-1 border-t border-dark-border/50 bg-dark-card/50">
        ※ 本圖為 AI 技術分析整理，僅供參考，不構成投資建議。投資有風險，請審慎評估並自負風險。
        <span className="ml-4 text-neon-blue/40"></span>
      </footer>
    </div>
  )
}
