/**
 * Lazy Load 模組包裝器
 * 只在模組進入可視範圍時才渲染內容（Intersection Observer）
 * 減少初始載入時的 render 數量
 */
import { useRef, useState, useEffect, ReactNode } from 'react'

type Props = {
  children: ReactNode
  placeholder?: ReactNode
  rootMargin?: string
}

export default function LazyModule({ children, placeholder, rootMargin = '100px' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()  // 一旦可見就不再觀察
        }
      },
      { rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref} className="h-full">
      {isVisible ? children : (placeholder || <div className="h-full flex items-center justify-center text-gray-600">...</div>)}
    </div>
  )
}
