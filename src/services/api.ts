/**
 * API 服務層 — 與後端通訊
 */
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,  // 60 秒（冷啟動時後端需要較長時間）
})

/** 取得個股完整分析資料 */
export async function fetchStockAnalysis(stockId: string, days = 120) {
  const res = await api.get(`/stock/analysis/${stockId}`, { params: { days } })
  return res.data
}

/** 取得即時股價 */
export async function fetchRealtimePrice(stockId: string) {
  const res = await api.get(`/stock/realtime/${stockId}`)
  return res.data
}

/** 取得今日盤中分時走勢 */
export async function fetchIntradayTicks(stockId: string) {
  const res = await api.get(`/stock/intraday/${stockId}`)
  return res.data
}

/** 取得大盤指標 */
export async function fetchMarketIndices() {
  const res = await api.get('/stock/market-indices')
  return res.data
}

/** 取得全部股票清單 */
export async function fetchStockList() {
  const res = await api.get('/stock/stock-list')
  return res.data
}

/** 取得當沖指標 */
export async function fetchDayTrading(stockId: string) {
  const res = await api.get(`/stock/day-trading/${stockId}`)
  return res.data
}

/** 取得財經新聞 */
export async function fetchNews(stockId: string = '') {
  const res = await api.get('/stock/news', { params: { stock_id: stockId } })
  return res.data
}

/** 取得全市場漲跌停統計 */
export async function fetchMarketLimitStats() {
  const res = await api.get('/stock/market-limit-stats')
  return res.data
}

/** 取得 AI 操盤建議 */
export async function fetchTradingAdvice(stockId: string) {
  const res = await api.get(`/stock/trading-advice/${stockId}`)
  return res.data
}

/** 取得券商持續吃貨分析 */
export async function fetchBrokerAccumulation(stockId: string) {
  const res = await api.get(`/stock/broker-accumulation/${stockId}`)
  return res.data
}

/** 取得產業分類及成分股 */
export async function fetchIndustryClassification() {
  const res = await api.get('/stock/industry-classification')
  return res.data
}

/** 取得 K 線型態辨識分析 */
export async function fetchKlinePattern(stockId: string) {
  const res = await api.get(`/stock/kline-pattern/${stockId}`)
  return res.data
}

/** 取得 K 棒趨勢線分析 */
export async function fetchTrendline(stockId: string) {
  const res = await api.get(`/stock/trendline/${stockId}`)
  return res.data
}

/** 取得三大法人買賣超 */
export async function fetchInstitutional(stockId: string, days = 30) {
  const res = await api.get(`/stock/institutional/${stockId}`, { params: { days } })
  return res.data
}

/** 取得融資融券資料 */
export async function fetchMargin(stockId: string, days = 30) {
  const res = await api.get(`/stock/margin/${stockId}`, { params: { days } })
  return res.data
}

/** 取得主力意圖分析 */
export async function fetchMainForce(stockId: string) {
  const res = await api.get(`/stock/main-force/${stockId}`)
  return res.data
}

/** 取得隔日沖風險分析 */
export async function fetchDayTradeRisk(stockId: string) {
  const res = await api.get(`/stock/day-trade-risk/${stockId}`)
  return res.data
}

/** 取得飆股雷達評分 */
export async function fetchRadar(stockId: string) {
  const res = await api.get(`/stock/radar/${stockId}`)
  return res.data
}

/** 取得明日劇本推演 */
export async function fetchScenarios(stockId: string) {
  const res = await api.get(`/stock/scenarios/${stockId}`)
  return res.data
}

/** 取得個股健康度 */
export async function fetchHealth(stockId: string) {
  const res = await api.get(`/stock/health/${stockId}`)
  return res.data
}

/** 取得預警燈號 */
export async function fetchSignal(stockId: string) {
  const res = await api.get(`/stock/signal/${stockId}`)
  return res.data
}

/** 取得情緒指數 */
export async function fetchSentiment(stockId: string) {
  const res = await api.get(`/stock/sentiment/${stockId}`)
  return res.data
}

/** 取得 AI 總結建議 */
export async function fetchSummary(stockId: string) {
  const res = await api.get(`/stock/summary/${stockId}`)
  return res.data
}

/** 取得 LSTM 預測結果 */
export async function fetchForecast(stockId: string) {
  const res = await api.get(`/predict/forecast/${stockId}`)
  return res.data
}

/** 手動觸發模型訓練 */
export async function trainModel(stockId: string, epochs = 80) {
  const res = await api.post(`/predict/train/${stockId}`, null, { params: { epochs } })
  return res.data
}

/** 回測：燈號準確度 */
export async function fetchBacktestAccuracy(stockId: string, days = 180) {
  const res = await api.get(`/backtest/signal-accuracy/${stockId}`, { params: { days } })
  return res.data
}

/** 回測：策略損益 */
export async function fetchBacktestPnl(stockId: string, days = 180) {
  const res = await api.get(`/backtest/strategy-pnl/${stockId}`, { params: { days } })
  return res.data
}

/** 取得產業板塊資金流向 */
export async function fetchSectorFlow(days = 5) {
  const res = await api.get('/stock/sector-flow', { params: { days } })
  return res.data
}

/** 取得篩選器可用條件 */
export async function fetchFilterConditions() {
  const res = await api.get('/stock/filter/conditions')
  return res.data
}

/** 條件式篩選股票 */
export async function filterStocks(conditions: string[], maxResults = 30) {
  const res = await api.post('/stock/filter', { conditions, max_results: maxResults })
  return res.data
}

/** 取得回測策略列表 */
export async function fetchBacktestStrategies() {
  const res = await api.get('/backtest/strategies')
  return res.data
}

/** 對個股執行單一策略回測 */
export async function runStrategyBacktest(stockId: string, strategyId: string, days = 365) {
  const res = await api.get(`/backtest/strategy/${stockId}/${strategyId}`, { params: { days } })
  return res.data
}

/** 對個股跑所有策略回測摘要 */
export async function runAllStrategiesBacktest(stockId: string, days = 365) {
  const res = await api.get(`/backtest/strategy-all/${stockId}`, { params: { days } })
  return res.data
}

/** 取得單一個股籌碼連續性分析 */
export async function fetchChipContinuity(stockId: string, days = 30) {
  const res = await api.get(`/stock/chip-continuity/${stockId}`, { params: { days } })
  return res.data
}

/** 取得外資/投信連買排行榜 */
export async function fetchChipContinuityRanking(topN = 20, days = 30) {
  const res = await api.get('/stock/chip-continuity-ranking', { params: { top_n: topN, days } })
  return res.data
}

/** 計算自選股漲跌相關性矩陣 */
export async function fetchCorrelationMatrix(stockIds: string[], days = 60) {
  const res = await api.post('/stock/correlation', { stock_ids: stockIds, days })
  return res.data
}

/** AI 持倉健檢 */
export async function fetchPortfolioHealth(holdings: { stock_id: string; shares: number; cost: number }[]) {
  const res = await api.post('/stock/portfolio-health', { holdings })
  return res.data
}

/** 取得即時行情熱力圖資料 */
export async function fetchHeatmap() {
  const res = await api.get('/stock/heatmap')
  return res.data
}

/** 批量取得即時報價 */
export async function fetchBatchRealtime(stockIds: string[]) {
  const res = await api.post('/stock/batch-realtime', { stock_ids: stockIds })
  return res.data
}

/** 取得本益比河流圖資料 */
export async function fetchPERiver(stockId: string, years = 5) {
  const res = await api.get(`/stock/pe-river/${stockId}`, { params: { years } })
  return res.data
}

export default api
