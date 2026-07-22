import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: 'oklch(24% 0.03 45)' }}>
          <div className="glass-card p-10 max-w-sm">
            <h2 className="text-[17px] font-serif font-semibold text-amber tracking-[0.02em] mb-2">出了点问题</h2>
            <p className="text-[13px] text-dusk-100/60 mb-6">{this.state.error?.message}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="px-6 py-3 bg-gradient-to-br from-amber to-amber text-white rounded-[14px] font-medium tracking-[0.02em] active:brightness-95 transition-all"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
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
