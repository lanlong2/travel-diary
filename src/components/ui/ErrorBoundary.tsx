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
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8 text-center">
          <div className="text-4xl mb-4">😵</div>
          <h2 className="text-lg font-semibold text-warm-900 mb-2">出了点问题</h2>
          <p className="text-sm text-warm-400 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.href = '/'
            }}
            className="px-6 py-3 bg-warm-500 text-white rounded-2xl shadow-lg"
          >
            重新加载
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
