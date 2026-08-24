import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('未捕获的界面错误', {
      name: error.name,
      message: error.message,
      componentStack: info.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-dvh flex flex-col items-center justify-center p-8 text-center"
          style={{ backgroundColor: 'oklch(17% 0.009 56)' }}
        >
          <div className="glass-card p-10 max-w-sm">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-amber/15 border-2 border-amber/30 flex items-center justify-center animate-stamp-press">
              <span className="font-display italic text-2xl text-amber">!</span>
            </div>
            <h2 className="text-[17px] font-serif font-semibold text-amber tracking-[0.04em] mb-2">
              出了点问题
            </h2>
            <p className="text-[13px] text-dusk-100/60 mb-6 leading-relaxed">
              页面没有正常完成加载，请重新进入。
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="px-6 py-3 bg-gradient-to-br from-amber via-amber to-amber-ember text-white rounded-[14px] font-medium tracking-[0.02em] active:brightness-95 transition-all active:scale-95 duration-200 edge-glow-amber"
            >
              重新加载
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
