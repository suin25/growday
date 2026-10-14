import { supabase } from "@/lib/supabase";

// 그 날짜의 공부 시간에 minutes만큼 더해요 (DB 함수 add_study_minutes, 0002 마이그레이션)
// DB 안에서 한 번에 더해서, 기록 탭에서 저장한 값과 섞여도 덮어쓰지 않아요.
export async function addStudyMinutes(date, minutes) {
  const { data, error } = await supabase.rpc("add_study_minutes", {
    p_date: date,
    p_minutes: minutes,
  });
  if (error) throw error;
  return data; // 더한 뒤의 공부 시간(분)
}
