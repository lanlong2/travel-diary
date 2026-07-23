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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-7 relative overflow-hidden"
      style={{ backgroundColor: 'oklch(20% 0.04 45)' }}
    >
      {/* 暮色光斑层 — 多 radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 15%, oklch(50% 0.10 40 / 0.25) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 85%, oklch(40% 0.08 30 / 0.28) 0%, transparent 55%)',
        }}
        aria-hidden="true"
      />

      {/* 飘落爱心 — 极少、极淡 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-amber/40 animate-float-soft"
            style={{
              left: `${(i * 17 + 8) % 100}%`,
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
        {/* 邮戳 — 左上角小印 */}
        <div
          className="absolute -top-2 -left-2 hidden sm:flex flex-col items-center justify-center stamp-mark px-3 py-2 animate-stamp-press"
          style={{ animationDelay: '1.4s', animationFillMode: 'both' }}
          aria-hidden="true"
        >
          <span className="text-[8px] tracking-[0.12em] text-stamp-dim">EST.</span>
          <span className="text-[14px] font-bold tracking-[0.05em] text-stamp-ink leading-tight">2025</span>
        </div>

        {/* 标题 + 爱心 */}
        <div className="text-center mb-12">
          {/* 爱心 — 印戳式徽章 */}
          <div className="inline-flex mb-7 relative">
            <div
              className="relative w-24 h-24 rounded-[1.75rem] bg-gradient-to-br from-amber/25 via-amber/15 to-amber-ember/10 border border-amber/35 flex items-center justify-center animate-breathe"
              style={{
                boxShadow:
                  '0 12px 36px oklch(68% 0.17 40 / 0.25), 0 0 0 1px oklch(80% 0.14 60 / 0.25), inset 0 1px 0 oklch(96% 0.02 70 / 0.15)',
                animationDuration: '4s',
              }}
            >
              {/* 印戳外环 */}
              <div className="absolute inset-2 rounded-[1.25rem] border border-amber/25 pointer-events-none" />
              <Heart
                className="w-12 h-12 text-amber"
                fill="currentColor"
                style={{ filter: 'drop-shadow(0 0 24px oklch(58% 0.13 40 / 0.4))' }}
              />
            </div>
          </div>

          {/* 标题 — Cormorant 大字 latin 双名 */}
          <h1
            className="display-hero text-[36px] text-dusk-50 tracking-[0.04em] leading-tight"
            style={{
              animation: 'fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            <span className="italic">Cui Hao</span>
            <span className="text-amber mx-2 font-light">&amp;</span>
            <span className="italic">Li Mutong</span>
          </h1>

          {/* 中文副标 — 衬线 + 双圆点装饰 */}
          <div
            className="flex items-center justify-center gap-3 mt-4"
            style={{
              animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both',
            }}
          >
            <span className="w-1 h-1 rounded-full bg-amber/50" />
            <p className="font-serif text-[14px] text-dusk-100/65 tracking-[0.15em]">
              崔浩 与 李沐桐
            </p>
            <span className="w-1 h-1 rounded-full bg-amber/50" />
          </div>

          {/* 引语 */}
          <p
            className="font-serif italic text-[12px] text-dusk-100/40 mt-3 tracking-[0.05em]"
            style={{ animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s both' }}
          >
            旅途回忆 · 共同书写
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
            className={emailFilled ? 'border-amber/40' : ''}
          />
          <Input
            label="密码"
            icon={Lock}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={pwdFilled ? 'border-amber/40' : ''}
          />

          {error && (
            <div className="p-4 rounded-[14px] bg-red-500/15 border border-red-400/30 text-red-300 text-[13px] text-center animate-scale-in flex items-center justify-center gap-2">
              <span className="w-1 h-1 rounded-full bg-red-400" />
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
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4" fill="currentColor" />
                开门
              </span>
            )}
          </Button>
        </form>

        {/* 底部 — 极淡极小，几乎融入背景 */}
        <div
          className="flex items-center justify-center gap-3 mt-12"
          style={{ animation: 'fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 2s both' }}
        >
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber/30" />
          <p className="text-[10px] text-dusk-100/35 tracking-[0.15em] font-mono">
            CUI · LI · 2025
          </p>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber/30" />
        </div>
      </div>
    </div>
  )
}
