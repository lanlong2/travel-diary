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
          50: 'oklch(96% 0.012 82)',
          100: 'oklch(84% 0.014 78)',
          200: 'oklch(73% 0.014 75)',
          300: 'oklch(58% 0.015 72)',
          400: 'oklch(49% 0.014 68)',
          500: 'oklch(41% 0.013 64)',
          600: 'oklch(34% 0.012 62)',
          700: 'oklch(28% 0.011 60)',
          800: 'oklch(23% 0.01 58)',
          900: 'oklch(18% 0.009 56)',
          950: 'oklch(14% 0.008 54)',
        },
        // 玻璃材质 — 三层透明度（轻/中/重）+ 边光
        glass: {
          float: 'oklch(34% 0.014 62 / 0.66)',
          popup: 'oklch(30% 0.014 60 / 0.9)',
          heavy: 'oklch(27% 0.012 58 / 0.94)',
          border: 'oklch(82% 0.03 74 / 0.16)',
          'border-strong': 'oklch(68% 0.12 45 / 0.5)',
          'border-warm': 'oklch(80% 0.1 65 / 0.3)',
        },
        // 琥珀主调 — 留 default/glow/dim，增加 ember(余烬) 与 honey(蜜光)
        amber: {
          DEFAULT: 'oklch(72% 0.14 48)',
          glow: 'oklch(72% 0.14 48 / 0.28)',
          dim: 'oklch(72% 0.14 48 / 0.1)',
          ember: 'oklch(60% 0.14 38)',
          honey: 'oklch(82% 0.12 72)',
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
        'slide-in-left': 'slideInLeft 0.4s ease-out both',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float': 'float 6s ease-in-out infinite',
        'page-enter': 'pageEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'page-exit': 'pageExit 0.2s ease-in both',
        'breathe': 'breathe 3s ease-in-out infinite',
        'breathe-slow': 'breathe 5s ease-in-out infinite',
        'draw-line': 'drawLine 1.5s ease-out forwards',
        'float-up-down': 'floatUpDown 4s ease-in-out infinite',
        'ping-soft': 'pingSoft 2.5s ease-out infinite',
        'count-pulse': 'countPulse 2s ease-in-out infinite',
        'ripple-out': 'rippleOut 2s ease-out infinite',
        'rotate-halo': 'rotateHalo 4s linear infinite',
        'shimmer-text': 'shimmerText 2.5s ease-in-out infinite',
        'tab-bounce': 'tabBounce 0.15s ease-out',
        'heartbeat': 'heartbeat 2s ease-in-out infinite',
        'ember-glow': 'emberGlow 4s ease-in-out infinite',
        'gentle-zoom': 'gentleZoom 20s ease-in-out infinite',
        'stamp-press': 'stampPress 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'tape-stick': 'tapeStick 0.5s ease-out both',
        'paper-flutter': 'paperFlutter 5s ease-in-out infinite',
        'thread-draw': 'threadDraw 2s ease-out forwards',
        'dusk-shift': 'duskShift 8s ease-in-out infinite',
        'reveal-up': 'revealUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'reveal-down': 'revealDown 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'reveal-scale': 'revealScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'ken-burns': 'kenBurns 12s ease-in-out infinite',
        'image-reveal': 'imageReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
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
        // 滚动触发展开动画
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        revealDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        revealScale: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px oklch(68% 0.17 40 / 0.15)) drop-shadow(0 0 20px oklch(68% 0.17 40 / 0.05))' },
          '50%': { filter: 'drop-shadow(0 0 16px oklch(68% 0.17 40 / 0.35)) drop-shadow(0 0 40px oklch(68% 0.17 40 / 0.12))' },
        },
        // 肯尼兹效果 — 封面背景缓慢放大
        kenBurns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '50%': { transform: 'scale(1.08) translate(-1%, -1%)' },
          '100%': { transform: 'scale(1) translate(0, 0)' },
        },
        // 图片加载展开
        imageReveal: {
          '0%': { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0% 0 0)' },
        },
        // 光斑脉冲
        gentleZoom: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
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
