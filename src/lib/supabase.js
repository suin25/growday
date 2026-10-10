import 'expo-sqlite/localStorage/install'
import { AppState } from 'react-native'
import { createClient } from '@supabase/supabase-js'

// EXPO_PUBLIC_ 으로 시작하는 환경변수는 앱 안에 그대로 들어가요 (= 공개됨).
// publishable 키는 공개돼도 괜찮게 설계된 키라 OK. 대신 DB는 RLS로 보호해요.
// ⚠️ secret 키나 DB 비밀번호는 절대 여기(앱)에 넣으면 안 돼요!
const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(url && key)

export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        storage: localStorage, // 로그인 상태를 폰에 저장 → 앱을 껐다 켜도 로그인 유지
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // 앱에는 웹 주소창이 없으니까 끔
      },
    })
  : null

// 앱이 화면에 떠 있을 때만 로그인 토큰을 자동 갱신 (배터리 절약)
if (supabase) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh()
    else supabase.auth.stopAutoRefresh()
  })
}

// Supabase 에러 메시지(영어)를 사용자용 한국어로 바꿔요
export function toKoreanAuthError(error) {
  const msg = error?.message ?? ''
  if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 맞지 않아요.'
  if (msg.includes('already registered')) return '이미 가입된 이메일이에요.'
  if (msg.includes('Email not confirmed')) return '이메일 인증을 먼저 완료해 주세요.'
  if (msg.toLowerCase().includes('password')) return '비밀번호는 6자 이상이어야 해요.'
  if (msg.toLowerCase().includes('email')) return '이메일 형식을 확인해 주세요.'
  if (msg.includes('Network') || msg.includes('fetch')) return '인터넷 연결을 확인해 주세요.'
  return '문제가 생겼어요. 잠시 후 다시 시도해 주세요.'
}
