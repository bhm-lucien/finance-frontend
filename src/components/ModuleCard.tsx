/**
 * 通用模組卡片 — 每個分析模組的外殼（優化版）
 */
import { ReactNode } from 'react'

interface ModuleCardProps {
  number: number
  title: string
  badge?: string
  children: ReactNode
}

export default function ModuleCard({ number, title, badge, children }: ModuleCardProps) {
  return (
    <div className="card-glow rounded-lg p-3 flex flex-col h-full">
      {/* 卡片標題 */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-dark-border/50">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neon-blue/20 text-neon-blue text-[11px] font-bold ring-1 ring-neon-blue/30">
            {number}
          </span>
          <h3 className="text-sm font-semibold text-gray-200 tracking-wide">{title}</h3>
        </div>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-blue/5 text-neon-blue/60 border border-neon-blue/20">
            {badge}
          </span>
        )}
      </div>
      {/* 卡片內容 */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
