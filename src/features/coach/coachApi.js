import { toDateString } from "@/lib/date";
import { supabase } from "@/lib/supabase";
import { describeFunctionError } from "@/lib/functionError";

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
  if (error) throw new Error(await describeFunctionError(error, "ai-coach"));
  return data; // { feedback, cached, empty? }
}
