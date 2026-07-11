import { useState, FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Heart, Mail, Lock } from 'lucide-react'

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
    <div className="min-h-screen bg-dusk-700 flex flex-col items-center justify-center px-8 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex mb-6">
            <div className="w-24 h-24 rounded-[1.75rem] bg-gradient-to-br from-amber/20 to-caramel/20 border border-amber/30 flex items-center justify-center shadow-lg shadow-caramel/20">
              <Heart className="w-12 h-12 text-amber" fill="currentColor" />
            </div>
          </div>

          <h1 className="font-serif text-[30px] font-bold text-dusk-50 tracking-[0.2em] leading-tight">
            崔浩 & 李沐桐
          </h1>
          <p className="text-sm text-dusk-100/55 mt-3 tracking-[0.25em]">
            旅行日记
          </p>
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
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm text-center animate-scale-in backdrop-blur-sm">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-3" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                登录中
              </span>
            ) : (
              '进入我们的世界'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-dusk-100/40 mt-12 animate-fade-in-up stagger-5 tracking-[0.2em]" style={{ opacity: 0 }}>
          崔浩和李沐桐的私人空间
        </p>
      </div>
    </div>
  )
}
