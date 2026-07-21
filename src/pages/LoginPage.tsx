import { useState, FormEvent, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Heart, Mail, Lock } from 'lucide-react'

const TITLE_CHARS = ['崔', '浩', ' ', '&', ' ', '李', '沐', '桐']
const SUBTITLE_CHARS = ['旅', '行', '日', '记']

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

  const titleChars = useMemo(() => TITLE_CHARS, [])
  const subtitleChars = useMemo(() => SUBTITLE_CHARS, [])

  return (
    <div className="min-h-screen bg-dusk-700 flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* 顶部飘落爱心层（轻量 CSS 实现） */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-amber/40 animate-float-soft"
            style={{
              left: `${(i * 12 + 6) % 100}%`,
              top: `${(i * 17) % 100}%`,
              fontSize: `${10 + (i % 4) * 4}px`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + (i % 3) * 1.5}s`,
              filter: 'blur(0.5px)',
              opacity: 0.18 + (i % 3) * 0.05,
            }}
          >
            <Heart fill="currentColor" className="w-full h-full" />
          </span>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* 标题 + 爱心 */}
        <div className="text-center mb-12">
          {/* 爱心 + 三层波纹 */}
          <div className="inline-flex mb-6 relative">
            <span className="absolute inset-0 rounded-[1.75rem] animate-ripple" style={{ animationDelay: '0s' }} aria-hidden="true" />
            <span className="absolute inset-0 rounded-[1.75rem] animate-ripple" style={{ animationDelay: '1s' }} aria-hidden="true" />
            <span className="absolute inset-0 rounded-[1.75rem] animate-ripple" style={{ animationDelay: '2s' }} aria-hidden="true" />
            <div
              className="relative w-24 h-24 rounded-[1.75rem] bg-gradient-to-br from-amber/25 to-caramel/25 border border-amber/40 flex items-center justify-center shadow-lg shadow-caramel/25 animate-float-soft"
              style={{ animationDuration: '3.5s' }}
            >
              <Heart
                className="w-12 h-12 text-amber animate-breathe"
                fill="currentColor"
                style={{ filter: 'drop-shadow(0 0 16px oklch(68% 0.17 40 / 0.65))' }}
              />
            </div>
          </div>

          {/* 标题 — 逐字渐入 */}
          <h1 className="font-serif text-[30px] font-bold text-dusk-50 tracking-[0.2em] leading-tight char-stagger">
            {titleChars.map((c, i) => (
              <span key={i} style={{ animationDelay: `${0.4 + i * 0.08}s` }}>
                {c}
              </span>
            ))}
          </h1>

          {/* 副标题 — 字距动画 */}
          <p
            className="text-sm text-dusk-100/55 mt-3 tracking-[0.25em] animate-fade-in-down"
            style={{ animationDelay: '1.2s', opacity: 0 }}
          >
            <span className="char-stagger">
              {subtitleChars.map((c, i) => (
                <span key={i} style={{ animationDelay: `${1.2 + i * 0.08}s` }}>{c}</span>
              ))}
            </span>
          </p>
        </div>

        {/* 表单 */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 animate-fade-in-up"
          style={{ animationDelay: '1.5s', opacity: 0 }}
        >
          <div className="relative">
            <Input
              label="邮箱"
              icon={Mail}
              type="email"
              placeholder="输入共享邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={emailFilled ? 'border-amber/40' : ''}
            />
            <style>{`
              input:focus + .input-glow, .input-glow:focus { box-shadow: 0 0 0 3px oklch(68% 0.17 40 / 0.18); }
            `}</style>
          </div>
          <Input
            label="密码"
            icon={Lock}
            type="password"
            placeholder="输入我们的密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={pwdFilled ? 'border-amber/40' : ''}
          />

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm text-center animate-scale-in backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="relative">
            {/* 脉冲光晕 */}
            {!loading && (
              <span
                className="absolute inset-0 rounded-[18px] pointer-events-none animate-ripple"
                style={{ opacity: 0.5 }}
                aria-hidden="true"
              />
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full mt-3 relative hover:scale-[1.02] hover:shadow-2xl hover:shadow-caramel/55"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中
                </span>
              ) : (
                '进入我们的世界'
              )}
            </Button>
          </div>
        </form>

        <p
          className="text-center text-xs text-dusk-100/40 mt-12 animate-fade-in-up tracking-[0.2em] relative overflow-hidden"
          style={{ animationDelay: '1.8s', opacity: 0 }}
        >
          <span className="animate-shimmer-text">崔浩和李沐桐的私人空间</span>
        </p>
      </div>
    </div>
  )
}
