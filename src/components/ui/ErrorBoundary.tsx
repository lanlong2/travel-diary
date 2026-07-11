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
        <div className="min-h-screen bg-dusk-700 flex flex-col items-center justify-center p-8 text-center">
          <div className="glass-card p-10 max-w-sm">
            <h2 className="text-lg font-serif font-semibold text-amber tracking-wide mb-2">出了点问题</h2>
            <p className="text-sm text-dusk-100/60 mb-6">{this.state.error?.message}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="px-6 py-3 bg-gradient-to-br from-amber to-caramel-700 text-white rounded-2xl shadow-lg shadow-caramel/30 font-medium tracking-wide active:scale-95 transition-transform"
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
