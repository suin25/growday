import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";

// 서버 함수(Edge Function) 호출 실패를 "원인이 보이는" 한국어 메시지로 바꿔요.
// 상태 코드별로 어디를 확인하면 되는지까지 알려줘요.
export async function describeFunctionError(error, name) {
  if (error instanceof FunctionsHttpError) {
    const status = error.context?.status;
    const body = await error.context?.json?.().catch(() => null);
    if (body?.error) return body.error; // 우리 함수가 직접 보낸 한국어 메시지
    if (status === 404)
      return `서버 함수(${name})가 아직 배포되지 않았어요. (404)`;
    if (status === 401 || status === 403)
      return `서버가 로그인 정보를 확인하지 못했어요. (${status})\n함수를 --no-verify-jwt 옵션으로 다시 배포했는지 확인해 주세요.`;
    return `서버 함수에서 오류가 났어요. (${status ?? "알 수 없음"})`;
  }
  if (error instanceof FunctionsRelayError)
    return "서버 연결 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
  if (error instanceof FunctionsFetchError)
    return "인터넷 연결을 확인하고 다시 시도해 주세요.";
  return "알 수 없는 오류가 생겼어요.";
}
