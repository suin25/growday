import { useState } from "react";
import { Link, router } from "expo-router";
import AuthForm from "@/components/AuthForm";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import AppText from "@/components/ui/AppText";
import CheckRow from "@/components/ui/CheckRow";
import { PASSWORD_HINT, validatePassword } from "@/features/auth/password";
import { supabase, toKoreanAuthError } from "@/lib/supabase";
import { openPrivacyPolicy } from "@/lib/links";
import { colors } from "@/theme/tokens";

// 입력값 검사: 서버에 보내기 전에 앱에서 먼저 걸러내요 (빠른 피드백)
function validate({ nickname, email, password, over14 }) {
  const errors = {};
  if (!nickname.trim()) errors.nickname = "닉네임을 입력해 주세요.";
  else if (nickname.trim().length > 20)
    errors.nickname = "닉네임은 20자 이하로 해 주세요.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim()))
    errors.email = "이메일 형식을 확인해 주세요.";
  const pwError = validatePassword(password);
  if (pwError) errors.password = pwError;
  // 만 14세 미만은 법정대리인 동의 절차가 필요해서, 지금은 14세 이상만 가입할 수 있어요
  if (!over14) errors.over14 = "만 14세 이상만 가입할 수 있어요.";
  return errors;
}

export default function SignupScreen() {
  const [form, setForm] = useState({
    nickname: "",
    email: "",
    password: "",
    over14: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 객체 state 중 한 칸만 바꾸는 헬퍼 (고치는 칸의 에러 문구는 바로 지워요)
  const update = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSignup() {
    // 이전 시도의 서버 에러는 먼저 지워요 (안 지우면 새 입력 에러와 같이 보여요)
    setServerError(null);
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      // 닉네임을 함께 보내면 DB 트리거가 profiles 테이블에 저장해요
      options: { data: { nickname: form.nickname.trim() } },
    });
    setLoading(false);

    if (error) {
      setServerError(toKoreanAuthError(error));
      return;
    }
    // 이메일 인증이 켜져 있으면 session이 없어요 → 인증 코드 입력 화면으로
    // 꺼져 있으면 session이 바로 생기고 자동으로 홈으로 이동해요
    if (!data.session) {
      router.replace({
        pathname: "/verify-email",
        params: { email: form.email.trim(), sent: "1" },
      });
    }
  }

  return (
    <AuthForm
      title="GrowDay 시작하기"
      subtitle="기록은 가볍게, 목표는 작게."
      footer={
        <>
          <AppText variant="caption">이미 계정이 있나요?</AppText>
          <Link href="/login" replace>
            <AppText
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.primary600,
              }}
            >
              로그인
            </AppText>
          </Link>
        </>
      }
    >
      <TextField
        label="닉네임"
        value={form.nickname}
        onChangeText={update("nickname")}
        placeholder="앱에서 불릴 이름"
        maxLength={20}
        error={errors.nickname}
      />
      <TextField
        label="이메일"
        value={form.email}
        onChangeText={update("email")}
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
        onChangeText={update("password")}
        placeholder="8자 이상"
        hint={PASSWORD_HINT}
        secureTextEntry
        textContentType="newPassword"
        keyboardType="ascii-capable" // iOS: 영문 키보드만 (한글 전환 없음)
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.password}
      />
      <CheckRow
        checked={form.over14}
        onChange={update("over14")}
        label="만 14세 이상입니다"
        error={errors.over14}
      />
      {serverError && (
        <AppText style={{ color: colors.error, fontSize: 14 }}>
          {serverError}
        </AppText>
      )}
      <Button title="가입하기" onPress={handleSignup} loading={loading} />
      {/* 서비스 이용에 꼭 필요한 정보라 별도 동의 대신 처리방침을 안내해요 (개인정보 보호법 제15조 제1항 제4호) */}
      <AppText variant="caption" style={{ textAlign: "center" }}>
        가입하면{" "}
        <AppText
          variant="caption"
          onPress={openPrivacyPolicy}
          accessibilityRole="link"
          style={{ color: colors.primary600, textDecorationLine: "underline" }}
        >
          개인정보처리방침
        </AppText>
        에 따라 개인정보가 처리돼요.
      </AppText>
    </AuthForm>
  );
}
