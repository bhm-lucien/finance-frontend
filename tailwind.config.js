/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        'xs': ['14px', '20px'],
        'sm': ['16px', '22px'],
        'base': ['18px', '26px'],
        'lg': ['20px', '28px'],
        'xl': ['24px', '32px'],
      },
      colors: {
        // 深色科技風配色 — 更深更暗
        'dark-bg': '#0a0e1a',
        'dark-card': '#0c1929',
        'dark-border': '#1a3a5c',
        'dark-surface': '#111d2e',
        'neon-blue': '#00d4ff',
        'neon-green': '#00ff88',
        'neon-red': '#ff4757',
        'neon-orange': '#ffa502',
        'neon-purple': '#a855f7',
        'neon-cyan': '#00e5ff',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 212, 255, 0.3)',
        'neon-red': '0 0 10px rgba(255, 71, 87, 0.3)',
        'neon-green': '0 0 10px rgba(0, 255, 136, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
