/**
 * 股票選擇器 — 支援代碼 + 中文名稱搜尋 + 熱門股快捷鍵
 */
import { useState, useMemo, useEffect } from 'react'
import { getStockName, searchStocks } from '../data/stockNames'

const HOT_STOCKS = [
  { id: '2330', name: '台積電' },
  { id: '2317', name: '鴻海' },
  { id: '2454', name: '聯發科' },
  { id: '2603', name: '長榮' },
  { id: '2881', name: '富邦金' },
  { id: '0050', name: '元大50' },
  { id: '2382', name: '廣達' },
  { id: '3661', name: '世芯-KY' },
]

const RECENT_KEY = 'ai_stock_recent_searches'
const MAX_RECENT = 6

interface StockSelectorProps {
  currentStock: string
  onSelect: (stockId: string) => void
  loading?: boolean
}

export default function StockSelector({ currentStock, onSelect, loading }: StockSelectorProps) {
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    } catch { return [] }
  })

  // 儲存最近搜尋到 localStorage
  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentSearches))
  }, [recentSearches])

  function addToRecent(stockId: string) {
    setRecentSearches(prev => {
      const filtered = prev.filter(id => id !== stockId)
      return [stockId, ...filtered].slice(0, MAX_RECENT)
    })
  }

  // 搜尋結果：根據輸入的代碼或中文名稱篩選
  const searchResults = useMemo(() => {
    return searchStocks(input, 8)
  }, [input])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const val = input.trim()
    if (!val) return

    // 如果是純數字代碼，直接使用
    if (/^\d{4,6}$/.test(val)) {
      onSelect(val)
      addToRecent(val)
      setInput('')
      setIsOpen(false)
      return
    }

    // 如果有搜尋結果，選第一筆
    if (searchResults.length > 0) {
      onSelect(searchResults[0].id)
      addToRecent(searchResults[0].id)
      setInput('')
      setIsOpen(false)
    }
  }

  function handleSelectResult(stockId: string) {
    onSelect(stockId)
    addToRecent(stockId)
    setInput('')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-dark-border hover:border-neon-blue/50 transition text-sm"
        disabled={loading}
      >
        <span className="text-neon-blue font-bold">{currentStock}</span>
        <span className="text-gray-400 text-xs">
          {getStockName(currentStock)}
        </span>
        <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-dark-card border border-dark-border rounded-lg shadow-lg z-50 p-2">
          {/* 搜尋框 */}
          <form onSubmit={handleSubmit} className="mb-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="搜尋代碼或名稱（如 2330、台積電）"
              className="w-full px-2.5 py-1.5 text-xs bg-dark-bg border border-dark-border rounded text-white placeholder-gray-500 focus:border-neon-blue/50 focus:outline-none"
              autoFocus
            />
          </form>

          {/* 搜尋結果 */}
          {searchResults.length > 0 && (
            <div className="mb-2 border-b border-dark-border pb-2">
              <p className="text-[11px] text-gray-500 px-1 mb-1">搜尋結果</p>
              <div className="space-y-0.5 max-h-32 overflow-y-auto">
                {searchResults.map(stock => (
                  <button
                    key={stock.id}
                    onClick={() => handleSelectResult(stock.id)}
                    className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-dark-surface text-gray-300 border border-transparent transition"
                  >
                    <span className="font-medium text-neon-blue">{stock.id}</span>
                    <span className="text-gray-400 ml-2">{stock.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 最近搜尋 */}
          {recentSearches.length > 0 && !input && (
            <div className="mb-2 border-b border-dark-border pb-2">
              <p className="text-[11px] text-gray-500 px-1 mb-1">最近搜尋</p>
              <div className="grid grid-cols-2 gap-1">
                {recentSearches.map(id => (
                  <button
                    key={id}
                    onClick={() => handleSelectResult(id)}
                    className="text-left px-2 py-1.5 rounded text-xs hover:bg-dark-surface text-gray-300 border border-transparent transition"
                  >
                    <span className="font-medium text-neon-cyan">{id}</span>
                    <span className="text-gray-500 ml-1">{getStockName(id)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 熱門股票 */}
          <p className="text-[11px] text-gray-500 px-1 mb-1">熱門股票</p>
          <div className="grid grid-cols-2 gap-1">
            {HOT_STOCKS.map(stock => (
              <button
                key={stock.id}
                onClick={() => handleSelectResult(stock.id)}
                className={`text-left px-2 py-1.5 rounded text-xs transition ${
                  stock.id === currentStock
                    ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                    : 'hover:bg-dark-surface text-gray-300 border border-transparent'
                }`}
              >
                <span className="font-medium">{stock.id}</span>
                <span className="text-gray-500 ml-1">{stock.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 點外面關閉 */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}
