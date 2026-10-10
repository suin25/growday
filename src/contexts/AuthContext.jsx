import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Context: 로그인 정보(session)를 앱 어디서든 꺼내 쓸 수 있게 해주는 React 기능.
// props로 화면마다 일일이 넘기지 않아도 useAuth()만 부르면 돼요.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true) // 저장된 로그인 정보를 읽는 중인지

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // 1) 앱 시작 시: 폰에 저장된 로그인 정보가 있는지 확인
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // 2) 로그인/로그아웃이 일어날 때마다 session을 자동으로 업데이트
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    // 화면이 사라질 때 구독 해제 (메모리 누수 방지)
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있어요')
  return ctx
}
