// 타이머 계산 (순수 함수) — 화면/저장과 분리해서 테스트하기 쉽게 만들었어요.
//
// 핵심 아이디어: "남은 초"를 1초씩 줄이지 않고, "끝나는 시각(endAt)"을 저장해요.
// 앱이 백그라운드에 가거나 화면이 꺼지면 iOS가 JS 실행을 멈추는데,
// 끝나는 시각을 저장해 두면 돌아왔을 때 지금 시각과 비교해서 정확히 계산할 수 있어요.
import { toDateString } from "@/lib/date";

export const FOCUS_OPTIONS = [25, 30, 45, 50, 60]; // 분
export const BREAK_MIN = 5;
const MIN = 60 * 1000;

export function initialTimerState() {
  return {
    mode: "pomodoro", // 'pomodoro' | 'stopwatch'
    // 뽀모도로: phase는 지금(또는 다음) 구간, status는 진행 상태
    pomo: {
      focusMin: 25,
      phase: "focus",
      status: "idle",
      endAt: null,
      remainingMs: null,
    },
    // 스톱워치: startedAt부터 지금까지 + 이전에 잰 시간(accMs)
    sw: { status: "idle", startedAt: null, accMs: 0 },
    today: { date: null, count: 0 }, // 오늘 완료한 집중 횟수
  };
}

// ---------- 뽀모도로 ----------
export const pomoDurationMs = (pomo) =>
  (pomo.phase === "focus" ? pomo.focusMin : BREAK_MIN) * MIN;

export function pomoRemainingMs(pomo, now) {
  if (pomo.status === "running") return Math.max(0, pomo.endAt - now);
  if (pomo.status === "paused") return pomo.remainingMs;
  return pomoDurationMs(pomo);
}

export function startPomo(pomo, now) {
  const left =
    pomo.status === "paused" ? pomo.remainingMs : pomoDurationMs(pomo);
  return { ...pomo, status: "running", endAt: now + left, remainingMs: null };
}

export function pausePomo(pomo, now) {
  return {
    ...pomo,
    status: "paused",
    remainingMs: Math.max(0, pomo.endAt - now),
    endAt: null,
  };
}

// 시간이 다 됐을 때: 집중이 끝났으면 기록할 분 + 휴식 대기로, 휴식이 끝났으면 다시 집중 대기로
export function completePomo(pomo) {
  if (pomo.phase === "focus") {
    const record = {
      date: toDateString(new Date(pomo.endAt)),
      minutes: pomo.focusMin,
    };
    return {
      pomo: {
        ...pomo,
        phase: "break",
        status: "idle",
        endAt: null,
        remainingMs: null,
      },
      record,
    };
  }
  return {
    pomo: {
      ...pomo,
      phase: "focus",
      status: "idle",
      endAt: null,
      remainingMs: null,
    },
    record: null,
  };
}

// 집중 도중에 그만둘 때 지금까지 한 시간(분, 내림)
export function pomoElapsedMin(pomo, now) {
  if (pomo.phase !== "focus" || pomo.status === "idle") return 0;
  return Math.floor((pomoDurationMs(pomo) - pomoRemainingMs(pomo, now)) / MIN);
}

// 그만두기 / 휴식 건너뛰기 → 집중 대기 상태로
export function resetPomo(pomo) {
  return {
    ...pomo,
    phase: "focus",
    status: "idle",
    endAt: null,
    remainingMs: null,
  };
}

// ---------- 스톱워치 ----------
export function swElapsedMs(sw, now) {
  return sw.accMs + (sw.status === "running" ? now - sw.startedAt : 0);
}
export const startSw = (sw, now) => ({
  ...sw,
  status: "running",
  startedAt: now,
});
export const pauseSw = (sw, now) => ({
  status: "paused",
  startedAt: null,
  accMs: swElapsedMs(sw, now),
});
export const resetSw = () => ({ status: "idle", startedAt: null, accMs: 0 });

// ---------- 공통 ----------
// 하나라도 진행 중(또는 일시정지)이면 다른 모드로 못 바꿔요 (공부 시간이 두 번 기록되지 않게)
export function isBusy(state) {
  return (
    state.pomo.status !== "idle" ||
    state.pomo.phase === "break" ||
    state.sw.status !== "idle"
  );
}

// 오늘 완료 횟수 (날짜가 바뀌면 0부터)
export function todayCount(state, now) {
  return state.today.date === toDateString(new Date(now))
    ? state.today.count
    : 0;
}
export function addTodayCount(state, date) {
  const count = state.today.date === date ? state.today.count + 1 : 1;
  return { ...state, today: { date, count } };
}

// 61_000 → "01:01", 3_661_000 → "1:01:01"
// 남은 시간은 올림(0.2초 남았을 때 00:01), 잰 시간은 내림(0.8초 지났을 때 00:00)
export function formatClock(ms, round = "up") {
  const total = round === "up" ? Math.ceil(ms / 1000) : Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
