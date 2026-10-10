import { useState } from 'react'
import { Link } from 'expo-router'
import AuthForm from '@/components/AuthForm'
import TextField from '@/components/ui/TextField'
import Button from '@/components/ui/Button'
import AppText from '@/components/ui/AppText'
import { supabase, toKoreanAuthError } from '@/lib/supabase'
import { colors } from '@/theme/tokens'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.')
      return
    }
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)
    if (authError) setError(toKoreanAuthError(authError))
    // 성공하면? 여기서 화면 이동을 안 해도 돼요.
    // AuthContext가 로그인을 감지 → _layout.jsx의 guard가 바뀜 → 자동으로 홈으로 이동
  }

  return (
    <AuthForm
      title="다시 만나서 반가워요"
      subtitle="오늘도 작은 한 걸음부터 시작해요."
      footer={
        <>
          <AppText variant="caption">처음이신가요?</AppText>
          <Link href="/signup" replace>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.primary600 }}>
              회원가입
            </AppText>
          </Link>
        </>
      }
    >
      <TextField
        label="이메일"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none" // 첫 글자 자동 대문자 끄기
        autoComplete="email"
        textContentType="emailAddress" // iOS 자동완성/키체인 힌트
      />
      <TextField
        label="비밀번호"
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry // ●●●● 로 가리기
        textContentType="password"
        onSubmitEditing={handleLogin} // 키보드의 '완료'로도 로그인
        returnKeyType="go"
      />
      {error && <AppText style={{ color: colors.error, fontSize: 14 }}>{error}</AppText>}
      <Button title="로그인" onPress={handleLogin} loading={loading} />
    </AuthForm>
  )
}
