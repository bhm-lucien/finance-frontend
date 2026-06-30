/**
 * 台股股票代碼對應名稱
 * 預設有常用的，啟動時會從後端載入完整清單
 */

// 預設常用股票（後端還沒回應前先用這些）
let STOCK_NAMES: Record<string, string> = {
  '2330': '台積電', '2317': '鴻海', '2454': '聯發科', '2308': '台達電',
  '2382': '廣達', '2412': '中華電', '3711': '日月光投控', '2303': '聯電',
  '2886': '兆豐金', '2891': '中信金', '2881': '富邦金', '2882': '國泰金',
  '2884': '玉山金', '2885': '元大金', '2887': '台新金', '2890': '永豐金',
  '2892': '第一金', '5880': '合庫金', '2357': '華碩', '2395': '研華',
  '3034': '聯詠', '2379': '瑞昱', '3008': '大立光', '2474': '可成',
  '2603': '長榮', '2609': '陽明', '2615': '萬海', '2002': '中鋼',
  '1301': '台塑', '1303': '南亞', '1326': '台化', '2912': '統一超',
  '1216': '統一', '1101': '台泥', '1102': '亞泥', '5871': '中租-KY',
  '3231': '緯創', '2356': '英業達', '2353': '宏碁', '3037': '欣興',
  '2345': '智邦', '6669': '緯穎', '3661': '世芯-KY', '3443': '創意',
  '6488': '環球晶', '3035': '智原', '6770': '力積電',
  '0050': '元大台灣50', '0056': '元大高股息', '00878': '國泰永續高股息',
  '00919': '群益台灣精選高息', '00929': '復華台灣科技優息',
}

/**
 * 用後端完整清單更新本地資料
 */
export function updateStockNames(fullList: Record<string, string>) {
  STOCK_NAMES = { ...STOCK_NAMES, ...fullList }
}

/**
 * 取得股票名稱
 */
export function getStockName(stockId: string): string {
  return STOCK_NAMES[stockId] ?? ''
}

/**
 * 搜尋股票（代碼或名稱）
 */
export function searchStocks(query: string, limit = 10): Array<{ id: string; name: string }> {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return Object.entries(STOCK_NAMES)
    .filter(([id, name]) => id.includes(q) || name.toLowerCase().includes(q))
    .slice(0, limit)
    .map(([id, name]) => ({ id, name }))
}

export { STOCK_NAMES }
