import { useState, FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Heart, Mail, Lock, Sparkles } from 'lucide-react'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('us@journey.app')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('请输入邮箱和密码')
      return
    }
    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream paper-texture flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* 装饰 */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-bl from-warm-100/40 to-transparent -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gradient-to-tr from-warm-200/30 to-transparent translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/4 left-10 w-3 h-3 rounded-full bg-warm-400/20" />
      <div className="absolute bottom-1/3 right-12 w-2 h-2 rounded-full bg-warm-300/30" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="relative inline-flex mb-6">
            <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-warm-100 to-warm-200 border-2 border-warm-300/60 flex items-center justify-center rotate-6 shadow-sm">
              <Heart className="w-14 h-14 text-warm-500" fill="currentColor" />
            </div>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-warm-300/30 -rotate-3 rounded-sm blur-[0.5px]" />
          </div>

          <h1 className="text-[32px] font-black text-warm-900 tracking-wide leading-tight">
            崔浩和李沐桐
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Sparkles className="w-4 h-4 text-warm-400" />
            <p className="text-base text-warm-400/80">在一起的第 <span className="font-bold text-caramel">❤</span> 天</p>
            <Sparkles className="w-4 h-4 text-warm-400" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
          <Input
            label="邮箱"
            icon={Mail}
            type="email"
            placeholder="输入共享邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="密码"
            icon={Lock}
            type="password"
            placeholder="输入我们的密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200/50 text-red-500 text-sm text-center animate-scale-in backdrop-blur-sm">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-3" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                登录中...
              </span>
            ) : (
              '✨ 进入我们的世界'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-warm-300/70 mt-12 animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
          💕 崔浩和李沐桐的私人空间
        </p>
      </div>
    </div>
  )
}
