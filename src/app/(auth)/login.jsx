import { useState } from "react";
import { Alert, Pressable } from "react-native";
import { Link, router } from "expo-router";
import AuthForm from "@/components/AuthForm";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import AppText from "@/components/ui/AppText";
import { supabase, toKoreanAuthError } from "@/lib/supabase";
import { resendSignupCode } from "@/features/auth/authApi";
import { colors } from "@/theme/tokens";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (!authError) return;
    // 성공하면? 여기서 화면 이동을 안 해도 돼요.
    // AuthContext가 로그인을 감지 → _layout.jsx의 guard가 바뀜 → 자동으로 홈으로 이동

    // 가입은 했는데 이메일 인증을 안 한 경우 → 인증 화면으로 안내
    if (authError.code === "email_not_confirmed") {
      Alert.alert(
        "이메일 인증이 필요해요",
        "가입한 이메일로 인증 코드를 다시 보내 드릴까요?",
        [
          { text: "취소", style: "cancel" },
          {
            text: "코드 받기",
            onPress: async () => {
              try {
                await resendSignupCode(email.trim());
                router.push({
                  pathname: "/verify-email",
                  params: { email: email.trim(), sent: "1" },
                });
              } catch (e) {
                Alert.alert("보내지 못했어요", e.message);
              }
            },
          },
        ],
      );
      return;
    }
    setError(toKoreanAuthError(authError));
  }

  return (
    <AuthForm
      title="다시 만나서 반가워요"
      subtitle="오늘도 작은 한 걸음부터 시작해요."
      footer={
        <>
          <AppText variant="caption">처음이신가요?</AppText>
          <Link href="/signup" replace>
            <AppText
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.primary600,
              }}
            >
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
        secureTextEntry // ●●●● 로 가리기 (오른쪽 눈 아이콘으로 보기)
        textContentType="password"
        onSubmitEditing={handleLogin} // 키보드의 '완료'로도 로그인
        returnKeyType="go"
      />
      {error && (
        <AppText style={{ color: colors.error, fontSize: 14 }}>{error}</AppText>
      )}
      <Button title="로그인" onPress={handleLogin} loading={loading} />
      <Pressable
        onPress={() => router.push("/forgot-password")}
        hitSlop={8}
        style={{ alignSelf: "center" }}
      >
        <AppText variant="caption" style={{ textDecorationLine: "underline" }}>
          비밀번호를 잊으셨나요?
        </AppText>
      </Pressable>
    </AuthForm>
  );
}
