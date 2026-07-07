/**
 * 財經 Podcast Tab 頁面
 * 顯示游庭皓、股癌的最新集數 + Apple Podcast 嵌入播放器
 */
import { useEffect, useState } from 'react'
import { fetchPodcasts } from '../services/api'

interface Episode {
  title: string
  date: string
  duration: string
  link: string
  description: string
}

interface PodcastData {
  id: string
  name: string
  apple_id: string
  notes_base_url: string | null
  podsight_base_url: string | null
  episodes: Episode[]
}

export default function PodcastPage() {
  const [podcasts, setPodcasts] = useState<PodcastData[]>([])
  const [loading, setLoading] = useState(true)
  const [activePlayer, setActivePlayer] = useState<string | null>(null)

  useEffect(() => {
    loadPodcasts()
  }, [])

  async function loadPodcasts() {
    setLoading(true)
    try {
      const result = await fetchPodcasts('all', 15)
      setPodcasts(result.podcasts || [])
    } catch (e) {
      console.error('Podcast 載入失敗:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto p-3 lg:p-4">
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <h2 className="text-sm lg:text-base font-bold text-neon-blue">🎙️ 財經 Podcast</h2>
        <span className="text-gray-500 text-xs">投資觀點 · 市場解析</span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-sm animate-pulse">載入中...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {podcasts.map(podcast => (
            <div key={podcast.id} className="bg-dark-card rounded-lg border border-dark-border/50 overflow-hidden">
              {/* Podcast 標題 */}
              <div className="px-4 py-3 border-b border-dark-border/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{podcast.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">最新 {podcast.episodes.length} 集</p>
                </div>
                <button
                  onClick={() => setActivePlayer(activePlayer === podcast.id ? null : podcast.id)}
                  className="px-3 py-1 text-xs bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30"
                >
                  {activePlayer === podcast.id ? '收起播放器' : '▶ 播放器'}
                </button>
              </div>

              {/* Apple Podcast 嵌入播放器 */}
              {activePlayer === podcast.id && (
                <div className="p-3 border-b border-dark-border/30 bg-dark-bg/50">
                  <iframe
                    allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                    frameBorder="0"
                    height="175"
                    style={{ width: '100%', overflow: 'hidden', borderRadius: '10px' }}
                    sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                    src={`https://embed.podcasts.apple.com/tw/podcast/id${podcast.apple_id}?theme=dark`}
                  />
                </div>
              )}

              {/* 集數列表 */}
              <div className="divide-y divide-dark-border/20">
                {podcast.episodes.map((ep, i) => (
                  <div key={i} className="px-4 py-2.5 hover:bg-dark-surface/30 transition flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{ep.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500">{ep.date}</span>
                        {ep.duration && <span className="text-[10px] text-gray-600">{ep.duration}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {podcast.podsight_base_url && ep.date && (
                        <a
                          href={`${podcast.podsight_base_url}/${ep.date}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 text-[10px] bg-neon-purple/10 text-neon-purple border border-neon-purple/30 rounded hover:bg-neon-purple/20"
                        >
                          📝 AI摘要
                        </a>
                      )}
                      {podcast.notes_base_url && (
                        <a
                          href={podcast.notes_base_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 text-[10px] bg-neon-orange/10 text-neon-orange border border-neon-orange/30 rounded hover:bg-neon-orange/20"
                        >
                          📝 筆記
                        </a>
                      )}
                      {ep.link && (
                        <a
                          href={ep.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 text-[10px] bg-dark-surface text-gray-400 border border-dark-border/50 rounded hover:text-white"
                        >
                          🔗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
