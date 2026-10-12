// Supabase와 통신하는 함수만 모아둔 파일.
// 화면 코드에서 supabase.from(...)을 직접 쓰지 않고 여기 함수를 불러요.
// → DB 구조가 바뀌어도 이 파일만 고치면 돼요.
import { supabase } from "@/lib/supabase";

const GOAL_FIELDS = "id, title, category, repeat_days, archived_at, created_at";

// 에러가 있으면 throw해서, 부르는 쪽에서 try/catch로 처리하게 해요
function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function fetchGoals() {
  return unwrap(
    await supabase.from("goals").select(GOAL_FIELDS).order("created_at"),
  );
}

export async function fetchGoal(id) {
  return unwrap(
    await supabase.from("goals").select(GOAL_FIELDS).eq("id", id).single(),
  );
}

// fromDate ~ toDate 사이의 완료 체크들 (toDate를 안 주면 fromDate 이후 전부)
export async function fetchChecks(fromDate, toDate) {
  let query = supabase
    .from("goal_checks")
    .select("goal_id, date")
    .gte("date", fromDate)
    .eq("completed", true);
  if (toDate) query = query.lte("date", toDate);
  return unwrap(await query);
}

// user_id는 안 보내도 돼요. DB의 기본값(auth.uid())이 알아서 채워요.
export async function createGoal({ title, category, repeat_days }) {
  return unwrap(
    await supabase
      .from("goals")
      .insert({ title, category, repeat_days })
      .select(GOAL_FIELDS)
      .single(),
  );
}

export async function updateGoal(id, fields) {
  return unwrap(
    await supabase
      .from("goals")
      .update(fields)
      .eq("id", id)
      .select(GOAL_FIELDS)
      .single(),
  );
}

export async function setArchived(id, archived) {
  return updateGoal(id, {
    archived_at: archived ? new Date().toISOString() : null,
  });
}

// 완전 삭제: 체크 기록도 함께 지워져요 (DB의 on delete cascade)
export async function deleteGoal(id) {
  unwrap(await supabase.from("goals").delete().eq("id", id));
}

// 체크 = 행 추가, 체크 해제 = 행 삭제
// upsert: 이미 있으면 덮어쓰기 (같은 날 두 번 눌러도 에러 없이)
export async function checkGoal(goalId, date) {
  unwrap(
    await supabase
      .from("goal_checks")
      .upsert(
        { goal_id: goalId, date, completed: true },
        { onConflict: "goal_id,date" },
      ),
  );
}

export async function uncheckGoal(goalId, date) {
  unwrap(
    await supabase
      .from("goal_checks")
      .delete()
      .eq("goal_id", goalId)
      .eq("date", date),
  );
}
