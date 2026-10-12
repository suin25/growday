// 목표 관련 "순수 계산" 함수 모음.
// 화면(React)이나 DB와 상관없이 입력 → 출력만 있어서 테스트하기 쉬워요.
import { colors } from "@/theme/tokens";
import { WEEKDAY_LABELS, addDays, parseDateString, toDateString } from "./date";

export const CATEGORIES = {
  study: { label: "공부", color: colors.study },
  exercise: { label: "운동", color: colors.exercise },
  habit: { label: "생활 습관", color: colors.habit },
  etc: { label: "기타", color: colors.etc },
};
export const CATEGORY_KEYS = Object.keys(CATEGORIES);

// 화면에 보여줄 요일 순서: 월 → 일 (JS의 getDay()는 일요일이 0)
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

// 목표가 시작된 날 (created_at은 UTC 시각이라 로컬 날짜로 바꿔요)
export function goalStartDate(goal) {
  return toDateString(new Date(goal.created_at));
}

// 이 목표가 그 날짜에 해야 하는 날인지
export function isScheduledOn(goal, dateStr) {
  if (dateStr < goalStartDate(goal)) return false; // 만들기 전 날짜는 제외
  const days = goal.repeat_days ?? [];
  if (days.length === 0) return true; // 비어 있으면 매일
  return days.includes(parseDateString(dateStr).getDay());
}

// [1,3,5] → "월·수·금", [] → "매일"
export function describeRepeat(days = []) {
  if (days.length === 0 || days.length === 7) return "매일";
  const set = new Set(days);
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d))) return "평일";
  if (set.size === 2 && set.has(0) && set.has(6)) return "주말";
  return WEEK_ORDER.filter((d) => set.has(d))
    .map((d) => WEEKDAY_LABELS[d])
    .join("·");
}

// 최근 n일 현황. doneDates: 이 목표를 완료한 날짜들의 Set
export function recentStats(goal, doneDates, dates) {
  const days = dates.map((date) => ({
    date,
    scheduled: isScheduledOn(goal, date),
    done: doneDates.has(date),
  }));
  return {
    days,
    scheduledCount: days.filter((d) => d.scheduled).length,
    doneCount: days.filter((d) => d.scheduled && d.done).length,
  };
}

// 연속 달성 일수: "해야 하는 날"만 세요. (월수금 목표면 화·목은 건너뜀)
// 오늘은 아직 안 했어도 하루가 안 끝났으니 끊긴 걸로 치지 않아요.
export function computeStreak(goal, doneDates, todayStr, maxDays = 60) {
  const start = goalStartDate(goal);
  let streak = 0;
  let cursor = parseDateString(todayStr);
  for (let i = 0; i < maxDays; i++) {
    const date = toDateString(cursor);
    if (date < start) break;
    if (isScheduledOn(goal, date)) {
      if (doneDates.has(date)) streak++;
      else if (date !== todayStr) break;
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}
