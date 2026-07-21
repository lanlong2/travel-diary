import { useState, FormEvent, useEffect } from 'react'
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
  const [emailFilled, setEmailFilled] = useState(true)
  const [pwdFilled, setPwdFilled] = useState(false)

  useEffect(() => {
    setEmailFilled(email.trim().length > 0)
  }, [email])
  useEffect(() => {
    setPwdFilled(password.trim().length > 0)
  }, [password])

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
    <div className="min-h-screen flex flex-col items-center justify-center px-7 relative overflow-hidden" style={{ backgroundColor: 'oklch(22% 0.03 40)' }}>
      {/* 飘落爱心 — 极少、极淡 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-terracotta/40 animate-float-soft"
            style={{
              left: `${(i * 22 + 8) % 100}%`,
              top: `${(i * 19) % 100}%`,
              fontSize: `${10 + (i % 3) * 3}px`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${5 + (i % 2) * 2}s`,
              filter: 'blur(0.5px)',
              opacity: 0.08 + (i % 2) * 0.04,
            }}
          >
            <Heart fill="currentColor" className="w-full h-full" />
          </span>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* 标题 + 爱心 */}
        <div className="text-center mb-12">
          {/* 爱心 — 只保留呼吸，无三层波纹 */}
          <div className="inline-flex mb-7 relative">
            <div
              className="relative w-24 h-24 rounded-[1.75rem] bg-gradient-to-br from-terracotta/25 to-caramel/20 border border-terracotta/30 flex items-center justify-center animate-breathe"
              style={{
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                animationDuration: '4s',
              }}
            >
              <Heart
                className="w-12 h-12 text-terracotta"
                fill="currentColor"
                style={{ filter: 'drop-shadow(0 0 24px oklch(58% 0.13 40 / 0.35))' }}
              />
            </div>
          </div>

          {/* 标题 — 整体淡入，无逐字动画 */}
          <h1
            className="font-serif text-[29px] font-semibold text-dusk-50 tracking-[0.05em] leading-tight"
            style={{
              animation: 'fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            崔浩 &amp; 李沐桐
          </h1>

          {/* 副标题 — 静态显示，不做动画 */}
          <p className="text-[13px] text-dusk-100/55 mt-3 tracking-[0.05em]">
            旅行日记
          </p>
        </div>

        {/* 表单 — 1.5s 后淡入 */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          style={{
            animation: 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.5s both',
          }}
        >
          <Input
            label="邮箱"
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailFilled ? 'border-terracotta/40' : ''}
          />
          <Input
            label="密码"
            icon={Lock}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={pwdFilled ? 'border-terracotta/40' : ''}
          />

          {error && (
            <div className="p-4 rounded-[14px] bg-red-500/15 border border-red-400/30 text-red-300 text-[13px] text-center animate-scale-in">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full mt-3"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                登录中
              </span>
            ) : (
              '开门'
            )}
          </Button>
        </form>

        {/* 底部 — 极淡极小，几乎融入背景 */}
        <p className="text-center text-[10px] text-dusk-100/25 mt-12 tracking-[0.03em]">
          崔浩 · 李沐桐
        </p>
      </div>
    </div>
  )
}
