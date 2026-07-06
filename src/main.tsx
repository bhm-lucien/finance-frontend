import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import BacktestPage from './pages/BacktestPage'
import './index.css'

// Error Boundary 防止手機版 crash 白屏
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] 渲染錯誤:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: '#ff4757', background: '#0a0e1a', minHeight: '100vh' }}>
          <h2>⚠️ 頁面載入失敗</h2>
          <p style={{ color: '#aaa', fontSize: 14 }}>{this.state.error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 10, padding: '8px 16px', background: '#00d4ff', color: '#000', border: 'none', borderRadius: 4 }}
          >
            重新載入
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/backtest" element={<BacktestPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
