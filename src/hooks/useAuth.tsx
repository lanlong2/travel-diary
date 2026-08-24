import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  initializationError: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializationError, setInitializationError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const timeoutId = window.setTimeout(() => {
      if (active) {
        setInitializationError('登录服务响应超时，请检查网络后重试')
        setLoading(false)
      }
    }, 8000)

    const applySession = (nextSession: Session | null) => {
      if (!active) return
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
      setInitializationError(null)
      window.clearTimeout(timeoutId)
    }

    void supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) throw error
        applySession(session)
      })
      .catch((error) => {
        if (!active) return
        console.warn('初始化登录会话失败:', error)
        setSession(null)
        setUser(null)
        setInitializationError('暂时无法连接登录服务，请检查网络后重试')
        setLoading(false)
        window.clearTimeout(timeoutId)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const msg =
          error.message === 'Invalid login credentials' ? '邮箱或密码错误' : '登录失败，请稍后重试'
        return { error: msg }
      }
      return { error: null }
    } catch (error) {
      console.warn('登录请求失败:', error)
      return { error: '无法连接登录服务，请检查网络后重试' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        initializationError,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// The context hook intentionally lives beside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
