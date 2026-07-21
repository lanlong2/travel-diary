import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#fefaf5',
        warm: {
          50: '#fefaf5',
          100: '#fef0e6',
          200: '#fde8da',
          300: '#f0d5c0',
          400: '#e8c8a8',
          DEFAULT: '#e8755a',
          500: '#e8755a',
          600: '#d4845a',
          700: '#c44d34',
          800: '#a0402a',
          900: '#5c3d2e',
        },
        wood: '#8b7355',
        caramel: '#c44d34',
        blush: '#f4a460',
        // 分层暖色系统 — 去 amber 化
        terracotta: {
          DEFAULT: '#c4735a',
          light: '#d48b76',
          dark: '#a85a44',
        },
        sand: {
          light: '#f5ede4',
          DEFAULT: '#e8d5c4',
          dark: '#c4a88c',
        },
        mist: {
          DEFAULT: '#7b8fa1',
          light: '#9bb0c0',
        },
        dusk: {
          50: 'oklch(96% 0.02 70)',
          100: 'oklch(78% 0.04 70)',
          200: 'oklch(68% 0.04 70)',
          300: 'oklch(52% 0.03 300)',
          400: 'oklch(44% 0.035 300)',
          500: 'oklch(36% 0.03 300)',
          600: 'oklch(32% 0.035 300)',
          700: 'oklch(24% 0.03 45)',
          800: 'oklch(22% 0.03 40)',
          900: 'oklch(20% 0.03 40)',
        },
        glass: {
          float: 'oklch(40% 0.03 300 / 0.5)',
          popup: 'oklch(44% 0.035 300 / 0.65)',
          border: 'oklch(80% 0.12 70 / 0.3)',
          'border-strong': 'oklch(75% 0.15 60 / 0.55)',
        },
        amber: {
          DEFAULT: '#c4735a',
          glow: '#c4735a4d',
          dim: '#c4735a26',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"ZCOOL XiaoWei"', '"Noto Serif SC Variable"', '"Noto Serif SC"', 'serif'],
        serif: ['"Noto Serif SC Variable"', '"Noto Serif SC"', '"PingFang SC"', '"Microsoft YaHei"', '"Hiragino Sans GB"', 'serif'],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', '"Cascadia Code"', '"Consolas"', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'fade-in-down': 'fadeInDown 0.4s ease-out both',
        'scale-in': 'scaleIn 0.35s ease-out both',
        'slide-in-right': 'slideInRight 0.4s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'page-enter': 'pageEnter 0.25s ease-out both',
        'page-exit': 'pageExit 0.15s ease-in both',
        'breathe': 'breathe 3s ease-in-out infinite',
        'draw-line': 'drawLine 1.5s ease-out forwards',
        'float-up-down': 'floatUpDown 4s ease-in-out infinite',
        'ping-soft': 'pingSoft 2.5s ease-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pageEnter: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pageExit: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.04)', opacity: '0.85' },
        },
        drawLine: {
          to: { strokeDashoffset: '0' },
        },
        floatUpDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pingSoft: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '70%': { transform: 'scale(2.2)', opacity: '0' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
