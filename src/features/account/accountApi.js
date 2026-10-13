import { supabase } from "@/lib/supabase";
import { describeFunctionError } from "@/lib/functionError";

// 닉네임 수정 (profiles 테이블 RLS: 내 행만 수정 가능)
export async function updateNickname(userId, nickname) {
  const { error } = await supabase
    .from("profiles")
    .update({ nickname })
    .eq("id", userId);
  if (error) throw new Error("닉네임을 저장하지 못했어요.");
}

// 비밀번호 변경: 현재 비밀번호로 한 번 더 로그인해서 본인 확인 → 새 비밀번호로 변경
// (폰을 잠깐 빌린 사람이 비밀번호를 바꾸지 못하게)
export async function changePassword(email, currentPassword, newPassword) {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (signInError) throw new Error("현재 비밀번호가 맞지 않아요.");

  // current_password: Supabase의 "Require current password when updating" 옵션이 켜져 있을 때 필요
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword,
  });
  if (error) {
    if (error.code === "same_password")
      throw new Error("지금과 다른 비밀번호를 입력해 주세요.");
    if (error.code === "weak_password")
      throw new Error(
        "비밀번호는 8자 이상, 영문 대문자·소문자·숫자·특수문자를 포함해야 해요.",
      );
    throw new Error("비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}

// 계정 삭제: 서버 함수(delete-account)가 계정과 모든 기록을 지워요
export async function deleteAccount() {
  const { error } = await supabase.functions.invoke("delete-account", {
    body: {},
  });
  if (error)
    throw new Error(await describeFunctionError(error, "delete-account"));
  // 서버에서 계정이 이미 없어졌으니, 폰에 남은 로그인 정보만 지워요
  await supabase.auth.signOut({ scope: "local" });
}
