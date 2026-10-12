import { supabase } from "@/lib/supabase";
import { isEmptyLog } from "./logForm";

const LOG_FIELDS =
  "date, study_minutes, study_note, exercise_type, exercise_minutes, mood, memo";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

// 그 날짜의 기록 (없으면 null)
export async function fetchLog(date) {
  return unwrap(
    await supabase
      .from("daily_logs")
      .select(LOG_FIELDS)
      .eq("date", date)
      .maybeSingle(),
  );
}

// 기간 안의 기록들 (리포트용)
export async function fetchLogs(fromDate, toDate) {
  return unwrap(
    await supabase
      .from("daily_logs")
      .select(LOG_FIELDS)
      .gte("date", fromDate)
      .lte("date", toDate)
      .order("date"),
  );
}

// 저장: 하루에 1행이라 upsert (있으면 수정, 없으면 추가)
// 모든 항목이 비어 있으면 그 날 기록을 지워요 (= 기록 없음)
export async function saveLog(userId, date, values) {
  if (isEmptyLog(values)) {
    unwrap(await supabase.from("daily_logs").delete().eq("date", date));
    return null;
  }
  return unwrap(
    await supabase
      .from("daily_logs")
      .upsert(
        { user_id: userId, date, ...values },
        { onConflict: "user_id,date" },
      )
      .select(LOG_FIELDS)
      .single(),
  );
}
