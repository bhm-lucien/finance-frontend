/**
 * 自選股清單面板 — 右側可展開的浮動面板
 */
import { getStockName } from '../data/stockNames'

interface WatchlistPanelProps {
  isOpen: boolean
  onClose: () => void
  watchlist: string[]
  currentStock: string
  onSelect: (stockId: string) => void
  onAdd: (stockId: string) => void
  onRemove: (stockId: string) => void
}

export default function WatchlistPanel({
  isOpen, onClose, watchlist, currentStock, onSelect, onAdd, onRemove
}: WatchlistPanelProps) {
  if (!isOpen) return null

  return (
    <>
      {/* 遮罩 */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* 面板 */}
      <div className="fixed top-0 right-0 h-full w-72 z-50 bg-dark-card border-l border-dark-border shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h2 className="text-sm font-bold text-neon-blue">自選股清單</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">✕</button>
        </div>

        {/* 新增輸入 */}
        <div className="p-3 border-b border-dark-border">
          <form onSubmit={(e) => {
            e.preventDefault()
            const input = (e.target as HTMLFormElement).elements.namedItem('stockInput') as HTMLInputElement
            const val = input.value.trim()
            if (val && /^\d{4,6}$/.test(val)) {
              onAdd(val)
              input.value = ''
            }
          }}>
            <div className="flex gap-2">
              <input
                name="stockInput"
                type="text"
                placeholder="輸入代碼加入自選"
                className="flex-1 px-2.5 py-1.5 text-xs bg-dark-bg border border-dark-border rounded text-white placeholder-gray-500 focus:border-neon-blue/50 focus:outline-none"
                maxLength={6}
              />
              <button type="submit" className="px-3 py-1.5 text-xs bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30">
                加入
              </button>
            </div>
          </form>
        </div>

        {/* 股票清單 */}
        <div className="flex-1 overflow-y-auto p-2">
          {watchlist.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-8">尚無自選股</p>
          ) : (
            <div className="space-y-1">
              {watchlist.map(id => (
                <div
                  key={id}
                  className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition ${
                    id === currentStock
                      ? 'bg-neon-blue/15 border border-neon-blue/30'
                      : 'hover:bg-dark-surface border border-transparent'
                  }`}
                  onClick={() => onSelect(id)}
                >
                  <div>
                    <span className="text-sm font-medium text-white">{id}</span>
                    <span className="text-xs text-gray-400 ml-2">{getStockName(id)}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(id) }}
                    className="text-gray-600 hover:text-neon-red text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-dark-border text-[9px] text-gray-600 text-center">
          自選股存儲在本機瀏覽器
        </div>
      </div>
    </>
  )
}
