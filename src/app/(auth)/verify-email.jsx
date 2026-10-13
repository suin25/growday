import { useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AuthForm from "@/components/AuthForm";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import AppText from "@/components/ui/AppText";
import ResendButton from "@/features/auth/ResendButton";
import {
  cleanCode,
  isValidCode,
  resendSignupCode,
  verifySignupCode,
} from "@/features/auth/authApi";
import { colors, spacing } from "@/theme/tokens";

// 가입 후 이메일 인증 화면: 메일로 받은 숫자 코드를 입력해요
// 주소 예: /verify-email?email=me@example.com&sent=1 (sent=1이면 방금 메일을 보낸 상태)
export default function VerifyEmailScreen() {
  const { email, sent } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (!isValidCode(code))
      return setError("메일로 받은 숫자 코드를 입력해 주세요.");
    setError(null);
    setLoading(true);
    try {
      await verifySignupCode(email, code);
      // 성공하면 로그인 상태가 되면서 자동으로 홈으로 이동해요 (5단계의 Stack.Protected)
    } catch (e) {
      setLoading(false);
      setError(e.message);
    }
  }

  return (
    <AuthForm
      title="메일함을 확인해 주세요"
      subtitle={`${email}(으)로 인증 코드를 보냈어요.`}
      footer={
        <AppText variant="caption" onPress={() => router.replace("/login")}>
          다른 이메일로 하기 ·{" "}
          <AppText style={{ fontSize: 13, color: colors.primary600 }}>
            로그인으로
          </AppText>
        </AppText>
      }
    >
      <TextField
        label="인증 코드"
        value={code}
        onChangeText={(v) => {
          setCode(cleanCode(v));
          setError(null);
        }}
        placeholder="숫자 코드"
        keyboardType="number-pad"
        textContentType="oneTimeCode" // iOS가 메일 속 코드를 자동완성으로 제안해 줄 수 있어요
        autoFocus
        maxLength={10}
        error={error}
      />
      <Button title="인증하기" onPress={handleVerify} loading={loading} />
      <View style={{ alignItems: "center", gap: spacing.sm }}>
        <ResendButton
          startCooling={sent === "1"}
          onResend={async () => {
            try {
              await resendSignupCode(email);
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
        <AppText variant="caption" style={{ textAlign: "center" }}>
          메일이 안 보이면 스팸함도 확인해 주세요.
        </AppText>
      </View>
    </AuthForm>
  );
}
