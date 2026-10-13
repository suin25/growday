import { useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import AuthForm from "@/components/AuthForm";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import AppText from "@/components/ui/AppText";
import ResendButton from "@/features/auth/ResendButton";
import {
  cleanCode,
  isValidCode,
  resetPasswordWithCode,
  sendResetCode,
} from "@/features/auth/authApi";
import { colors, spacing } from "@/theme/tokens";

// 비밀번호 찾기: ① 이메일 입력 → 코드 발송  ② 코드 + 새 비밀번호 입력
export default function ForgotPasswordScreen() {
  const [step, setStep] = useState("email"); // 'email' | 'code'
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const e = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(e))
      return setErrors({ email: "이메일 형식을 확인해 주세요." });
    setErrors({});
    setLoading(true);
    try {
      await sendResetCode(e);
      setEmail(e);
      setStep("code");
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    const e = {};
    if (!isValidCode(code)) e.code = "메일로 받은 숫자 코드를 입력해 주세요.";
    if (password.length < 6) e.password = "새 비밀번호는 6자 이상이어야 해요.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await resetPasswordWithCode(email, code, password);
      // 성공하면 로그인 상태가 되면서 홈으로 이동해요
      Alert.alert("비밀번호를 바꿨어요", "새 비밀번호로 로그인됐어요.");
    } catch (err) {
      setLoading(false);
      // 코드가 틀린 경우는 이 화면에 그대로 남고, 로그인 후 실패한 경우는 홈으로 가니까 알림으로 보여줘요
      if (err.message.startsWith("로그인은 됐지만"))
        Alert.alert("비밀번호 변경 실패", err.message);
      else setErrors({ code: err.message });
    }
  }

  const footer = (
    <AppText variant="caption" onPress={() => router.replace("/login")}>
      비밀번호가 생각났나요?{" "}
      <AppText style={{ fontSize: 13, color: colors.primary600 }}>
        로그인
      </AppText>
    </AppText>
  );

  if (step === "email") {
    return (
      <AuthForm
        title="비밀번호 찾기"
        subtitle="가입한 이메일로 인증 코드를 보내 드릴게요."
        footer={footer}
      >
        <TextField
          label="이메일"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setErrors({});
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          error={errors.email}
        />
        <Button title="인증 코드 받기" onPress={handleSend} loading={loading} />
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="새 비밀번호 설정"
      subtitle={`${email}(으)로 보낸 코드를 입력해 주세요.`}
      footer={footer}
    >
      <TextField
        label="인증 코드"
        value={code}
        onChangeText={(v) => {
          setCode(cleanCode(v));
          setErrors((p) => ({ ...p, code: undefined }));
        }}
        placeholder="숫자 코드"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={10}
        error={errors.code}
      />
      <TextField
        label="새 비밀번호"
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          setErrors((p) => ({ ...p, password: undefined }));
        }}
        placeholder="6자 이상"
        secureTextEntry
        textContentType="newPassword"
        error={errors.password}
      />
      <Button title="비밀번호 바꾸기" onPress={handleReset} loading={loading} />
      <View style={{ alignItems: "center", gap: spacing.sm }}>
        <ResendButton
          startCooling
          onResend={async () => {
            try {
              await sendResetCode(email);
              Alert.alert(
                "새 코드를 보냈어요",
                "메일함(스팸함 포함)을 확인해 주세요.",
              );
            } catch (e) {
              Alert.alert("보내지 못했어요", e.message);
              throw e;
            }
          }}
        />
      </View>
    </AuthForm>
  );
}
