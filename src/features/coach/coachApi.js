import { toDateString } from "@/lib/date";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";

// 이미 만들어진 피드백이 있으면 DB에서 바로 읽어요 (AI 호출 없음, 횟수 차감 없음)
export async function fetchSavedFeedback(type, targetDate) {
  const { data, error } = await supabase
    .from("ai_feedbacks")
    .select("type, target_date, content, created_at")
    .eq("type", type)
    .eq("target_date", targetDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Edge Function(ai-coach)을 불러서 새 피드백을 받아요.
// 로그인 토큰은 supabase-js가 알아서 같이 보내요.
export async function requestFeedback({ type, weekStart, regenerate = false }) {
  const { data, error } = await supabase.functions.invoke("ai-coach", {
    body: {
      type,
      today: toDateString(), // "오늘"은 폰 기준 날짜 (서버는 UTC라서)
      tzOffset: new Date().getTimezoneOffset(), // 한국: -540
      weekStart,
      regenerate,
    },
  });
  if (error) {
    // 서버가 보낸 한국어 에러 메시지를 꺼내요
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      throw new Error(body?.error ?? "AI 추천을 받지 못했어요.");
    }
    throw new Error("인터넷 연결을 확인하고 다시 시도해 주세요.");
  }
  return data; // { feedback, cached, empty? }
}
