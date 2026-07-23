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
        // 暮色琥珀 — 主深色背景体系（5 段层级 + 4 段光斑）
        dusk: {
          50: 'oklch(96% 0.02 70)',
          100: 'oklch(80% 0.03 65)',
          200: 'oklch(72% 0.03 60)',
          300: 'oklch(55% 0.04 55)',
          400: 'oklch(48% 0.04 50)',
          500: 'oklch(42% 0.03 50)',
          600: 'oklch(36% 0.04 55)',
          700: 'oklch(30% 0.035 55)',
          800: 'oklch(24% 0.03 45)',
          900: 'oklch(20% 0.03 40)',
          950: 'oklch(16% 0.025 40)',
        },
        // 玻璃材质 — 三层透明度（轻/中/重）+ 边光
        glass: {
          float: 'oklch(46% 0.035 50 / 0.5)',
          popup: 'oklch(46% 0.035 50 / 0.65)',
          heavy: 'oklch(46% 0.035 50 / 0.78)',
          border: 'oklch(75% 0.08 55 / 0.2)',
          'border-strong': 'oklch(68% 0.12 45 / 0.5)',
          'border-warm': 'oklch(80% 0.14 60 / 0.35)',
        },
        // 琥珀主调 — 留 default/glow/dim，增加 ember(余烬) 与 honey(蜜光)
        amber: {
          DEFAULT: 'oklch(68% 0.17 40)',
          glow: 'oklch(68% 0.17 40 / 0.3)',
          dim: 'oklch(68% 0.17 40 / 0.12)',
          ember: 'oklch(55% 0.15 35)',
          honey: 'oklch(78% 0.14 65)',
          wine: 'oklch(48% 0.10 20)',
        },
        // 邮戳红 — 仅用于印戳与日期标签
        stamp: {
          DEFAULT: 'oklch(52% 0.14 25)',
          dim: 'oklch(52% 0.14 25 / 0.55)',
          ink: 'oklch(38% 0.10 25 / 0.85)',
        },
        // 米白 — 拍立得纸面
        paper: {
          DEFAULT: 'oklch(94% 0.012 80)',
          warm: 'oklch(92% 0.018 75)',
          cream: 'oklch(90% 0.025 70)',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"ZCOOL XiaoWei"', '"Noto Serif SC Variable"', '"Noto Serif SC"', 'serif'],
        serif: ['"Noto Serif SC Variable"', '"Noto Serif SC"', '"PingFang SC"', '"Microsoft YaHei"', '"Hiragino Sans GB"', 'serif'],
        sans: ['"Inter"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"SF Mono"', '"Cascadia Code"', '"Consolas"', 'monospace'],
      },
      letterSpacing: {
        'editorial': '0.04em',
        'stamp': '0.08em',
        'label': '0.12em',
        'wide-label': '0.18em',
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
        'count-pulse': 'countPulse 2s ease-in-out infinite',
        'ripple-out': 'rippleOut 2s ease-out infinite',
        'rotate-halo': 'rotateHalo 4s linear infinite',
        'shimmer-text': 'shimmerText 2.5s ease-in-out infinite',
        'tab-bounce': 'tabBounce 0.15s ease-out',
        'heartbeat': 'heartbeat 2s ease-in-out infinite',
        // 新增 — 黄昏感动画
        'ember-glow': 'emberGlow 4s ease-in-out infinite',
        'stamp-press': 'stampPress 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'tape-stick': 'tapeStick 0.5s ease-out both',
        'paper-flutter': 'paperFlutter 5s ease-in-out infinite',
        'thread-draw': 'threadDraw 2s ease-out forwards',
        'dusk-shift': 'duskShift 8s ease-in-out infinite',
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
        countPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 24px oklch(68% 0.17 40 / 0.35))' },
          '50%': { filter: 'drop-shadow(0 0 48px oklch(68% 0.17 40 / 0.55))' },
        },
        rippleOut: {
          '0%': { boxShadow: '0 0 0 0 oklch(68% 0.17 40 / 0.5)' },
          '100%': { boxShadow: '0 0 0 22px oklch(68% 0.17 40 / 0)' },
        },
        rotateHalo: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmerText: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        tabBounce: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(0.85)' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.15)' },
          '30%': { transform: 'scale(1)' },
        },
        // 余烬呼吸 — 比单纯 scale 更有"火光感"
        emberGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px oklch(68% 0.17 40 / 0.15))' },
          '50%': { filter: 'drop-shadow(0 0 24px oklch(68% 0.17 40 / 0.4))' },
        },
        stampPress: {
          '0%': { transform: 'scale(1.4) rotate(-15deg)', opacity: '0' },
          '60%': { transform: 'scale(0.92) rotate(-2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-3deg)', opacity: '1' },
        },
        tapeStick: {
          '0%': { transform: 'rotate(-25deg) translateY(-30px)', opacity: '0' },
          '100%': { transform: 'rotate(-12deg) translateY(0)', opacity: '1' },
        },
        paperFlutter: {
          '0%, 100%': { transform: 'rotate(-0.3deg) translateY(0)' },
          '50%': { transform: 'rotate(0.4deg) translateY(-2px)' },
        },
        threadDraw: {
          to: { strokeDashoffset: '0' },
        },
        duskShift: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
