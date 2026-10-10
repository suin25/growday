import { useState } from 'react'
import { Link, router } from 'expo-router'
import AuthForm from '@/components/AuthForm'
import TextField from '@/components/ui/TextField'
import Button from '@/components/ui/Button'
import AppText from '@/components/ui/AppText'
import Card from '@/components/ui/Card'
import { supabase, toKoreanAuthError } from '@/lib/supabase'
import { colors } from '@/theme/tokens'

// 입력값 검사: 서버에 보내기 전에 앱에서 먼저 걸러내요 (빠른 피드백)
function validate({ nickname, email, password }) {
  const errors = {}
  if (!nickname.trim()) errors.nickname = '닉네임을 입력해 주세요.'
  else if (nickname.trim().length > 20) errors.nickname = '닉네임은 20자 이하로 해 주세요.'
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = '이메일 형식을 확인해 주세요.'
  if (password.length < 6) errors.password = '비밀번호는 6자 이상이어야 해요.'
  return errors
}

export default function SignupScreen() {
  const [form, setForm] = useState({ nickname: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)

  // 객체 state 중 한 칸만 바꾸는 헬퍼
  const update = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))

  async function handleSignup() {
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setServerError(null)
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      // 닉네임을 함께 보내면 DB 트리거가 profiles 테이블에 저장해요
      options: { data: { nickname: form.nickname.trim() } },
    })
    setLoading(false)

    if (error) {
      setServerError(toKoreanAuthError(error))
      return
    }
    // 이메일 인증이 켜져 있으면 session이 없어요 → 메일 확인 안내
    // 꺼져 있으면 session이 바로 생기고 자동으로 홈으로 이동해요
    if (!data.session) setNeedsConfirm(true)
  }

  if (needsConfirm) {
    return (
      <AuthForm title="메일함을 확인해 주세요" subtitle={`${form.email}로 인증 메일을 보냈어요.`}>
        <Card>
          <AppText variant="caption">메일의 링크를 누른 뒤, 돌아와서 로그인해 주세요.</AppText>
        </Card>
        <Button title="로그인하러 가기" onPress={() => router.replace('/login')} />
      </AuthForm>
    )
  }

  return (
    <AuthForm
      title="GrowDay 시작하기"
      subtitle="기록은 가볍게, 목표는 작게."
      footer={
        <>
          <AppText variant="caption">이미 계정이 있나요?</AppText>
          <Link href="/login" replace>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.primary600 }}>
              로그인
            </AppText>
          </Link>
        </>
      }
    >
      <TextField
        label="닉네임"
        value={form.nickname}
        onChangeText={update('nickname')}
        placeholder="앱에서 불릴 이름"
        maxLength={20}
        error={errors.nickname}
      />
      <TextField
        label="이메일"
        value={form.email}
        onChangeText={update('email')}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={errors.email}
      />
      <TextField
        label="비밀번호"
        value={form.password}
        onChangeText={update('password')}
        placeholder="6자 이상"
        secureTextEntry
        textContentType="newPassword"
        error={errors.password}
      />
      {serverError && <AppText style={{ color: colors.error, fontSize: 14 }}>{serverError}</AppText>}
      <Button title="가입하기" onPress={handleSignup} loading={loading} />
    </AuthForm>
  )
}
