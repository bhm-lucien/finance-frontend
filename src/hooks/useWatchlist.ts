/**
 * 自選股清單 Hook — 存在 localStorage
 */
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'ai_stock_watchlist'

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : ['2330', '2317', '2454']
    } catch {
      return ['2330', '2317', '2454']
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  function addStock(stockId: string) {
    if (!watchlist.includes(stockId)) {
      setWatchlist([...watchlist, stockId])
    }
  }

  function removeStock(stockId: string) {
    setWatchlist(watchlist.filter(id => id !== stockId))
  }

  function isInWatchlist(stockId: string) {
    return watchlist.includes(stockId)
  }

  return { watchlist, addStock, removeStock, isInWatchlist }
}
