/**
 * 產業分類頁籤元件
 * 顯示 TWSE 官方產業分類，點擊展開成分股清單，支援快速切換
 */
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { fetchIndustryClassification } from '../services/api'

interface Stock {
  id: string
  name: string
}

interface Category {
  name: string
  count: number
  stocks: Stock[]
}

interface Props {
  onSelect: (stockId: string) => void
  currentStock: string
}

export default function IndustryTabs({ onSelect, currentStock }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    loadCategories()
  }, [])

  // 點擊外部關閉下拉
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // 也檢查 portal 中的下拉選單
        const dropdown = document.getElementById('industry-dropdown')
        if (dropdown && dropdown.contains(e.target as Node)) return
        setActiveTab(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadCategories() {
    try {
      setLoading(true)
      const data = await fetchIndustryClassification()
      if (data.categories) {
        setCategories(data.categories)
      }
    } catch {
      // 靜默
    } finally {
      setLoading(false)
    }
  }

  function handleTabClick(name: string, btn: HTMLButtonElement) {
    if (activeTab === name) {
      setActiveTab(null)
      return
    }
    // 計算按鈕位置，用來定位下拉選單
    const rect = btn.getBoundingClientRect()
    setDropdownPos({ top: rect.bottom + 4, left: rect.left })
    setActiveTab(name)
  }

  function handleStockClick(stockId: string) {
    onSelect(stockId)
    setActiveTab(null)
  }

  if (loading) {
    return <div className="text-gray-500 text-xs px-2">載入產業分類...</div>
  }

  if (categories.length === 0) return null

  const activeCategory = categories.find(c => c.name === activeTab)

  return (
    <>
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide" ref={containerRef}>
        {categories.map(cat => (
          <button
            key={cat.name}
            ref={el => { if (el) buttonRefs.current.set(cat.name, el) }}
            onClick={(e) => handleTabClick(cat.name, e.currentTarget)}
            className={`px-2 py-1 text-xs rounded whitespace-nowrap transition flex-shrink-0 ${
              activeTab === cat.name
                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-surface/50 border border-transparent'
            }`}
          >
            {cat.name.replace('業', '')}
          </button>
        ))}
      </div>

      {/* 下拉選單用 Portal 渲染到 body，避免被 overflow 裁切 */}
      {activeTab && activeCategory && createPortal(
        <div
          id="industry-dropdown"
          className="fixed z-[9999] bg-dark-card border border-dark-border rounded-lg shadow-2xl p-2 min-w-[240px] max-h-[350px] overflow-y-auto"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <p className="text-gray-500 text-xs mb-1.5 px-1">{activeCategory.name}（{activeCategory.count} 檔）</p>
          <div className="grid grid-cols-2 gap-0.5">
            {activeCategory.stocks.map(stock => (
              <button
                key={stock.id}
                onClick={() => handleStockClick(stock.id)}
                className={`px-2 py-1 text-xs rounded text-left transition truncate ${
                  stock.id === currentStock
                    ? 'bg-neon-blue/20 text-neon-blue'
                    : 'text-gray-300 hover:bg-dark-surface hover:text-white'
                }`}
                title={`${stock.id} ${stock.name}`}
              >
                {stock.id} {stock.name}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
