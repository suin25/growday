// 일일 기록 입력값 ↔ DB 값 변환 (순수 함수)
//
// 핵심 규칙: "미입력"과 "0"을 구분해요.
//   입력칸이 비어 있음 ''   → DB에 null  (= 미입력, 기록 안 함)
//   입력칸에 '0'           → DB에 0     (= 실제로 0분 함)
// 그래서 입력칸 값은 숫자가 아니라 문자열로 들고 있어요. (숫자면 ''와 0을 구분 못 해요)

export const MOODS = [
  { value: 1, emoji: "😣", label: "힘듦" },
  { value: 2, emoji: "😕", label: "별로" },
  { value: 3, emoji: "😐", label: "보통" },
  { value: 4, emoji: "🙂", label: "좋음" },
  { value: 5, emoji: "😄", label: "최고" },
];

export function emptyForm() {
  return {
    study_minutes: "",
    study_note: "",
    exercise_type: "",
    exercise_minutes: "",
    mood: null,
    memo: "",
  };
}

const toInput = (n) => (n == null ? "" : String(n));

// DB 행 → 입력칸 값
export function logToForm(log) {
  if (!log) return emptyForm();
  return {
    study_minutes: toInput(log.study_minutes),
    study_note: log.study_note ?? "",
    exercise_type: log.exercise_type ?? "",
    exercise_minutes: toInput(log.exercise_minutes),
    mood: log.mood ?? null,
    memo: log.memo ?? "",
  };
}

function parseMinutes(str) {
  const t = str.trim();
  if (t === "") return { value: null };
  if (!/^\d+$/.test(t)) return { error: "숫자만 입력해 주세요." };
  const n = Number(t);
  if (n > 1440) return { error: "하루는 1440분까지예요." };
  return { value: n };
}

const textOrNull = (s) => (s.trim() === "" ? null : s.trim());

// 입력칸 값 → DB에 저장할 값 + 오류 메시지
export function formToLog(form) {
  const study = parseMinutes(form.study_minutes);
  const exercise = parseMinutes(form.exercise_minutes);
  const errors = {};
  if (study.error) errors.study_minutes = study.error;
  if (exercise.error) errors.exercise_minutes = exercise.error;

  const values = {
    study_minutes: study.value ?? null,
    study_note: textOrNull(form.study_note),
    exercise_type: textOrNull(form.exercise_type),
    exercise_minutes: exercise.value ?? null,
    mood: form.mood ?? null,
    memo: textOrNull(form.memo),
  };
  return { values, errors };
}

// 모든 항목이 미입력인지 (→ 이 날 기록 자체를 지워요)
export function isEmptyLog(values) {
  return Object.values(values).every((v) => v == null);
}

// 서버에서 새로 받아온 값(fresh)을 입력 중인 값(form)에 합치기
// - 사용자가 손대지 않은 칸(form === 예전 저장값)은 새 값으로 바꿔요 (예: 타이머가 더한 공부 시간)
// - 사용자가 고치고 있는 칸은 그대로 둬요
export function mergeFresh(form, oldSaved, fresh) {
  const out = {};
  for (const k of Object.keys(fresh))
    out[k] = form[k] === oldSaved[k] ? fresh[k] : form[k];
  return out;
}

// 바뀐 게 있는지 비교 (저장 버튼 활성화용)
export function isSameForm(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// 90 → "1시간 30분", 0 → "0분", null → null
export function formatMinutes(m) {
  if (m == null) return null;
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}시간 ${r}분` : `${h}시간`;
}
