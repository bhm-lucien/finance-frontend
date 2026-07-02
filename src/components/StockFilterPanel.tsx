/**
 * 條件式股票篩選器面板
 * 使用者可勾選多個技術指標條件，組合篩選出符合的股票
 */
import { useState, useEffect } from 'react'
import { fetchFilterConditions, filterStocks } from '../services/api'

type Condition = {
  id: string
  name: string
  category: string
  type: string
}

type FilterResult = {
  stock_id: string
  name: string
  price: number
  change_pct: number
  matched: string[]
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSelect: (stockId: string) => void
}

export default function StockFilterPanel({ isOpen, onClose, onSelect }: Props) {
  const [conditions, setConditions] = useState<Condition[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [results, setResults] = useState<FilterResult[]>([])
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(0)
  const [matched, setMatched] = useState(0)

  // 載入可用條件
  useEffect(() => {
    if (isOpen && conditions.length === 0) {
      fetchFilterConditions()
        .then(data => setConditions(data.conditions || []))
        .catch(() => {})
    }
  }, [isOpen])

  function toggleCondition(id: string) {
    const next = new Set(selected)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelected(next)
  }

  async function runFilter() {
    if (selected.size === 0) return
    setLoading(true)
    setResults([])
    try {
      const data = await filterStocks([...selected], 30)
      setResults(data.results || [])
      setScanned(data.total_scanned || 0)
      setMatched(data.total_matched || 0)
    } catch (e) {
      console.error('篩選失敗:', e)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // 按 category 分組
  const grouped: Record<string, Condition[]> = {}
  conditions.forEach(c => {
    if (!grouped[c.category]) grouped[c.category] = []
    grouped[c.category].push(c)
  })

  const categoryIcons: Record<string, string> = {
    '趨勢': '📈',
    '動能': '⚡',
    '量價': '📊',
    '突破': '🚀',
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* 面板 */}
      <div className="relative ml-auto w-[480px] h-full bg-dark-card border-l border-dark-border overflow-y-auto">
        {/* 標題 */}
        <div className="sticky top-0 bg-dark-card border-b border-dark-border p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">🔍 條件式篩選器</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* 條件選擇區 */}
          {Object.entries(grouped).map(([category, conds]) => (
            <div key={category}>
              <h3 className="text-sm font-bold text-gray-300 mb-2">
                {categoryIcons[category] || '📋'} {category}
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {conds.map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggleCondition(c.id)}
                    className={`px-2.5 py-1.5 text-xs rounded border transition text-left ${
                      selected.has(c.id)
                        ? c.type === 'buy'
                          ? 'bg-red-500/20 border-red-500/50 text-red-300'
                          : c.type === 'sell'
                          ? 'bg-green-500/20 border-green-500/50 text-green-300'
                          : 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-dark-surface border-dark-border text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <span className="mr-1">{selected.has(c.id) ? '✓' : '○'}</span>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* 篩選按鈕 */}
          <div className="flex items-center gap-3">
            <button
              onClick={runFilter}
              disabled={selected.size === 0 || loading}
              className="flex-1 py-2 rounded bg-neon-blue/80 hover:bg-neon-blue text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loading ? '篩選中...' : `🔍 開始篩選（${selected.size} 個條件）`}
            </button>
            {selected.size > 0 && (
              <button
                onClick={() => { setSelected(new Set()); setResults([]) }}
                className="px-3 py-2 text-xs text-gray-400 hover:text-white border border-dark-border rounded"
              >
                清除
              </button>
            )}
          </div>

          {/* 結果統計 */}
          {(results.length > 0 || matched > 0) && (
            <p className="text-xs text-gray-500">
              掃描 {scanned} 支，符合 {matched} 支
            </p>
          )}

          {/* 結果列表 */}
          {results.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-300">篩選結果</h3>
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(r.stock_id)}
                  className="w-full text-left px-3 py-2 rounded border border-dark-border hover:border-neon-blue/50 hover:bg-dark-surface/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm">{r.stock_id} {r.name}</span>
                    <span className={`text-sm font-bold ${r.change_pct >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {r.change_pct >= 0 ? '+' : ''}{r.change_pct}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-gray-500 text-xs">${r.price}</span>
                    <span className="text-gray-500 text-[10px]">
                      {r.matched.length} 條件符合
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 空結果 */}
          {!loading && results.length === 0 && matched === 0 && selected.size > 0 && scanned > 0 && (
            <p className="text-center text-gray-500 py-4">沒有找到符合所有條件的股票</p>
          )}
        </div>
      </div>
    </div>
  )
}
