// 이메일 인증 코드(OTP) 관련 함수
// 메일에 링크 대신 6자리 코드를 보내고, 앱에서 그 코드를 입력받아요.
// (Supabase 이메일 템플릿의 {{ .Token }} 사용 → 딥링크 설정 없이 Expo Go와 실제 앱에서 똑같이 동작)
import { supabase, toKoreanAuthError } from "@/lib/supabase";

const fail = (error) => {
  throw new Error(toKoreanAuthError(error));
};

// 가입 인증 코드 확인 → 성공하면 바로 로그인 상태가 돼요
export async function verifySignupCode(email, code) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "signup",
  });
  if (error) fail(error);
}

// 가입 인증 코드 다시 보내기
export async function resendSignupCode(email) {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) fail(error);
}

// 비밀번호 재설정 코드 보내기
export async function sendResetCode(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) fail(error);
}

// 재설정 코드 확인 → (확인되면 로그인 상태가 됨) → 바로 새 비밀번호로 변경
export async function resetPasswordWithCode(email, code, newPassword) {
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "recovery",
  });
  if (verifyError) fail(verifyError);
  // 여기까지 오면 이미 로그인된 상태예요. 비밀번호 변경만 실패하면 설정에서 다시 바꿀 수 있게 안내해요.
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    const reason =
      error.code === "same_password"
        ? "예전과 다른 비밀번호를 입력해야 해요."
        : toKoreanAuthError(error);
    throw new Error(
      `로그인은 됐지만 비밀번호를 바꾸지 못했어요. ${reason}\n설정 → 비밀번호 변경에서 다시 시도해 주세요.`,
    );
  }
}

// 코드 입력값 정리: 숫자만, 공백 제거 (메일에서 복사해 붙여넣을 때 공백이 섞일 수 있어서)
export const cleanCode = (v) => v.replace(/[^0-9]/g, "").slice(0, 10);
export const isValidCode = (v) => /^\d{6,10}$/.test(v);
