// 비밀번호 규칙 (Supabase 대시보드 설정과 똑같이 맞춰요)
// - 서버 설정: 최소 8자 + "Lowercase, uppercase letters, digits and symbols"
// - 특수문자 목록은 Supabase가 이 설정에서 쓰는 목록과 같아요 (목록에 없는 기호는 특수문자로 인정 안 됨)
// - 한글·공백 등은 앱에서 막아요 (영문/숫자/특수문자만)
export const PASSWORD_SYMBOLS = "!@#$%^&*()_+-=[]{};':\"|<>?,./`~";
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // Supabase가 받는 최대 길이
export const PASSWORD_HINT = "8자 이상, 영문 대문자·소문자·숫자·특수문자 포함";

const isAllowedChar = (c) =>
  /[A-Za-z0-9]/.test(c) || PASSWORD_SYMBOLS.includes(c);

// 문제가 있으면 한국어 메시지, 괜찮으면 null
export function validatePassword(pw) {
  if (pw.length < PASSWORD_MIN)
    return `비밀번호는 ${PASSWORD_MIN}자 이상이어야 해요.`;
  if (pw.length > PASSWORD_MAX)
    return `비밀번호는 ${PASSWORD_MAX}자 이하로 해 주세요.`;
  if (![...pw].every(isAllowedChar))
    return "영문, 숫자, 특수문자만 쓸 수 있어요. (한글·공백 불가)";
  const missing = [];
  if (!/[a-z]/.test(pw)) missing.push("소문자");
  if (!/[A-Z]/.test(pw)) missing.push("대문자");
  if (!/[0-9]/.test(pw)) missing.push("숫자");
  if (![...pw].some((c) => PASSWORD_SYMBOLS.includes(c)))
    missing.push("특수문자");
  if (missing.length) return `${missing.join("·")}를 포함해 주세요.`;
  return null;
}
