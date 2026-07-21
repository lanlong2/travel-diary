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
        dusk: {
          50: 'oklch(96% 0.02 70)',
          100: 'oklch(78% 0.04 70)',
          200: 'oklch(68% 0.04 70)',
          300: 'oklch(52% 0.03 300)',
          400: 'oklch(44% 0.035 300)',
          500: 'oklch(36% 0.03 300)',
          600: 'oklch(32% 0.035 300)',
          700: 'oklch(28% 0.04 300)',
          800: 'oklch(24% 0.035 300)',
          900: 'oklch(20% 0.03 300)',
        },
        glass: {
          float: 'oklch(40% 0.03 300 / 0.5)',
          popup: 'oklch(44% 0.035 300 / 0.65)',
          border: 'oklch(80% 0.12 70 / 0.3)',
          'border-strong': 'oklch(75% 0.15 60 / 0.55)',
        },
        amber: {
          DEFAULT: 'oklch(68% 0.17 40)',
          glow: 'oklch(68% 0.17 40 / 0.3)',
          dim: 'oklch(68% 0.17 40 / 0.15)',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"PingFang SC"', '"Microsoft YaHei"', '"Hiragino Sans GB"', 'serif'],
        sans: ['system-ui', '-apple-system', '"PingFang SC"', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', '"Cascadia Code"', '"Consolas"', 'monospace'],
      },
      animation: {
        'heartbeat': 'heartbeat 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'fade-in-down': 'fadeInDown 0.4s ease-out both',
        'scale-in': 'scaleIn 0.35s ease-out both',
        'slide-in-right': 'slideInRight 0.4s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'ripple-expand': 'rippleExpand 0.6s ease-out forwards',
        'page-enter': 'pageEnter 0.25s ease-out both',
        'page-exit': 'pageExit 0.15s ease-in both',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'tab-bounce': 'tabBounce 0.15s ease-out',
        'breathe': 'breathe 3s ease-in-out infinite',
        'ripple-out': 'rippleOut 2s ease-out infinite',
        'shimmer-text': 'shimmerText 2.5s ease-in-out infinite',
        'draw-line': 'drawLine 1.5s ease-out forwards',
        'float-up-down': 'floatUpDown 4s ease-in-out infinite',
        'sticker-peel': 'stickerPeel 0.4s ease-out forwards',
        'rotate-halo': 'rotateHalo 4s linear infinite',
        'fade-in-stagger': 'fadeInStagger 0.5s ease-out both',
        'count-pulse': 'countPulse 2s ease-in-out infinite',
        'ping-soft': 'pingSoft 2.5s ease-out infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.15)' },
          '30%': { transform: 'scale(1)' },
        },
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
        shimmer: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(232,117,90,0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(232,117,90,0.4)' },
        },
        rippleExpand: {
          '0%': { transform: 'scale(0)', opacity: '0.4' },
          '100%': { transform: 'scale(12)', opacity: '0' },
        },
        pageEnter: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pageExit: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 4px 16px rgba(196,77,52,0.25)' },
          '50%': { boxShadow: '0 4px 28px rgba(196,77,52,0.45)' },
        },
        tabBounce: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(0.85)' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.04)', opacity: '0.85' },
        },
        rippleOut: {
          '0%': { boxShadow: '0 0 0 0 oklch(68% 0.17 40 / 0.5)' },
          '100%': { boxShadow: '0 0 0 22px oklch(68% 0.17 40 / 0)' },
        },
        shimmerText: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        drawLine: {
          to: { strokeDashoffset: '0' },
        },
        floatUpDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        stickerPeel: {
          '0%': { transform: 'rotate(0deg)' },
          '30%': { transform: 'rotate(-1.5deg) scale(1.03)' },
          '100%': { transform: 'rotate(0.5deg) scale(1.02)' },
        },
        rotateHalo: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        fadeInStagger: {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        countPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 24px oklch(68% 0.17 40 / 0.35))' },
          '50%': { filter: 'drop-shadow(0 0 48px oklch(68% 0.17 40 / 0.55))' },
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
