// 날짜는 항상 "기기의 로컬 시간" 기준 YYYY-MM-DD 문자열로 다뤄요.
// new Date().toISOString()은 UTC 기준이라 한국 시간 새벽에는 전날 날짜가 나와요!

export function toDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 예: "10월 10일 토요일"
// (Intl 날짜 포맷은 기기 환경마다 결과가 다를 수 있어서 직접 만들어요)
export function formatKoreanDate(date = new Date()) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

export function greetingByTime(date = new Date()) {
  const h = date.getHours();
  if (h < 6) return "늦은 밤이에요";
  if (h < 12) return "좋은 아침이에요";
  if (h < 18) return "좋은 오후예요";
  return "오늘 하루도 수고했어요";
}

// "2026-10-12" → 그 날짜의 로컬 자정 Date 객체
// (new Date('2026-10-12')는 UTC로 해석돼서 한국에선 오전 9시가 돼요. 그래서 직접 만들어요)
export function parseDateString(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// 오늘 포함 최근 n일의 날짜 문자열 (오래된 날 → 오늘 순서)
export function lastNDates(n, end = new Date()) {
  return Array.from({ length: n }, (_, i) =>
    toDateString(addDays(end, i - (n - 1))),
  );
}

export const WEEKDAY_LABELS = WEEKDAYS;

// "2026-10-12" → "10월 12일 (월)"
export function formatShortDate(dateStr) {
  const d = parseDateString(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}
