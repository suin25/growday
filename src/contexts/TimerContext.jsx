import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import {
  addTodayCount,
  completePomo,
  initialTimerState,
  isBusy,
  pausePomo,
  pauseSw,
  pomoElapsedMin,
  resetPomo,
  resetSw,
  startPomo,
  startSw,
  swElapsedMs,
} from "@/features/timer/timerLogic";
import { addStudyMinutes } from "@/features/timer/timerApi";
import { toDateString } from "@/lib/date";
import {
  cancelAllScheduled,
  cancelScheduled,
  ensureNotificationPermission,
  scheduleAt,
} from "@/features/timer/notify";

// 타이머 상태를 앱 전체에서 관리해요.
// - 타이머 탭이 아닌 다른 탭에 있어도 시간이 끝나면 처리돼요.
// - 폰에 저장(localStorage)해서 앱을 완전히 껐다 켜도 이어져요. (서버에는 공부 시간만 보내요)
// - 공부 시간 기록이 실패하면(인터넷 끊김 등) "기록 대기"에 남겨 두고 다시 시도해요.
const TimerContext = createContext(null);
const storageKey = (uid) => `growday.timer.${uid}`; // 사용자마다 따로 저장

function readSaved(uid) {
  try {
    const raw = localStorage.getItem(storageKey(uid));
    if (!raw) return null;
    return {
      ...initialTimerState(),
      pending: [],
      notifId: null,
      ...JSON.parse(raw),
    };
  } catch {
    return null;
  }
}

// 기록 대기열에 추가 (id는 성공한 것만 골라 지우는 용도)
const queueRecord = (s, record) => ({
  ...s,
  pending: [
    ...s.pending,
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...record,
    },
  ],
});

export function TimerProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [state, setState] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [lastRecord, setLastRecord] = useState(null); // 방금 기록된 공부 시간 안내용 { minutes, at }
  const [notifDenied, setNotifDenied] = useState(false);
  const stateRef = useRef(null); // 타이머 콜백 안에서도 항상 최신 상태를 보려고
  const flushing = useRef(false);
  const prevUid = useRef(null);

  // 상태 바꾸기 = 화면 갱신 + 폰에 저장
  const commit = useCallback(
    (next) => {
      stateRef.current = next;
      setState(next);
      if (uid) {
        try {
          localStorage.setItem(storageKey(uid), JSON.stringify(next));
        } catch {}
      }
    },
    [uid],
  );

  // 로그인한 사용자가 바뀌면 그 사용자의 타이머를 불러와요. 로그아웃하면 예약된 알림을 지워요.
  useEffect(() => {
    if (prevUid.current && prevUid.current !== uid) cancelAllScheduled();
    prevUid.current = uid;
    const s = uid
      ? (readSaved(uid) ?? {
          ...initialTimerState(),
          pending: [],
          notifId: null,
        })
      : null;
    stateRef.current = s;
    setState(s);
    setLastRecord(null);
  }, [uid]);

  // 기록 대기 중인 공부 시간을 서버에 보내요 (하나씩, 성공한 것만 지움)
  const flush = useCallback(async () => {
    if (flushing.current) return;
    flushing.current = true;
    try {
      while (stateRef.current?.pending.length) {
        const item = stateRef.current.pending[0];
        try {
          await addStudyMinutes(item.date, item.minutes);
        } catch {
          break; // 인터넷이 없으면 다음 기회에
        }
        const s = stateRef.current;
        commit({ ...s, pending: s.pending.filter((p) => p.id !== item.id) });
        setLastRecord({ minutes: item.minutes, at: Date.now() });
      }
    } finally {
      flushing.current = false;
    }
  }, [commit]);

  // 시간이 다 됐는지 확인 → 다 됐으면 다음 단계로 + 공부 시간 기록
  const process = useCallback(
    (t) => {
      const s = stateRef.current;
      if (!s || s.pomo.status !== "running" || t < s.pomo.endAt) return;
      const { pomo, record } = completePomo(s.pomo);
      let next = { ...s, pomo, notifId: null };
      if (record) next = queueRecord(addTodayCount(next, record.date), record);
      commit(next);
      if (record) flush();
    },
    [commit, flush],
  );

  // 진행 중일 때만 0.5초마다 화면 갱신
  const running =
    state?.pomo.status === "running" || state?.sw.status === "running";
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      process(t);
    }, 500);
    return () => clearInterval(id);
  }, [running, process]);

  // 앱으로 돌아왔을 때 (백그라운드에서 시간이 끝났을 수 있어요) + 처음 불러왔을 때
  useEffect(() => {
    if (!uid) return;
    const t = Date.now();
    setNow(t);
    process(t);
    flush();
    const sub = AppState.addEventListener("change", (st) => {
      if (st !== "active") return;
      const t2 = Date.now();
      setNow(t2);
      process(t2);
      flush();
    });
    return () => sub.remove();
  }, [uid, process, flush]);

  // 기록 대기가 남아 있으면 30초마다 다시 시도
  const hasPending = Boolean(state?.pending.length);
  useEffect(() => {
    if (!hasPending) return;
    const id = setInterval(flush, 30000);
    return () => clearInterval(id);
  }, [hasPending, flush]);

  // ---------- 동작들 ----------
  const setMode = (mode) => {
    const s = stateRef.current;
    if (isBusy(s)) return false;
    commit({ ...s, mode });
    return true;
  };

  const setFocusMin = (focusMin) => {
    const s = stateRef.current;
    if (s.pomo.status !== "idle" || s.pomo.phase !== "focus") return;
    commit({ ...s, pomo: { ...s.pomo, focusMin } });
  };

  const startPomodoro = async () => {
    const t = Date.now();
    const s = stateRef.current;
    const pomo = startPomo(s.pomo, t);
    commit({ ...s, pomo });
    setNow(t);
    const granted = await ensureNotificationPermission();
    setNotifDenied(!granted);
    const [title, body] =
      pomo.phase === "focus"
        ? [
            "집중 완료 🎉",
            `${pomo.focusMin}분 집중했어요. 공부 시간에 기록할게요. 앱에서 휴식을 시작해 보세요.`,
          ]
        : ["휴식 끝", "다시 집중해 볼까요?"];
    const id = await scheduleAt(pomo.endAt, title, body);
    // 알림 예약하는 사이에 일시정지했다면 방금 예약한 알림은 취소
    const cur = stateRef.current;
    if (cur.pomo.status === "running" && cur.pomo.endAt === pomo.endAt)
      commit({ ...cur, notifId: id });
    else cancelScheduled(id);
  };

  const pausePomodoro = () => {
    const s = stateRef.current;
    cancelScheduled(s.notifId);
    commit({ ...s, pomo: pausePomo(s.pomo, Date.now()), notifId: null });
  };

  // 집중 중 그만두기: 지금까지 한 분(내림)은 기록해요. 휴식 중이면 휴식만 끝내요.
  const stopPomodoro = () => {
    const s = stateRef.current;
    const minutes = pomoElapsedMin(s.pomo, Date.now());
    cancelScheduled(s.notifId);
    let next = { ...s, pomo: resetPomo(s.pomo), notifId: null };
    if (minutes > 0)
      next = queueRecord(next, { date: toDateString(), minutes });
    commit(next);
    if (minutes > 0) flush();
    return minutes;
  };

  const skipBreak = () => {
    const s = stateRef.current;
    cancelScheduled(s.notifId);
    commit({ ...s, pomo: resetPomo(s.pomo), notifId: null });
  };

  const startStopwatch = () => {
    const t = Date.now();
    const s = stateRef.current;
    commit({ ...s, sw: startSw(s.sw, t) });
    setNow(t);
  };

  const pauseStopwatch = () => {
    const s = stateRef.current;
    commit({ ...s, sw: pauseSw(s.sw, Date.now()) });
  };

  // 끝내고 기록: 1분 미만은 기록하지 않아요. 한 번에 최대 1440분(하루).
  const finishStopwatch = () => {
    const s = stateRef.current;
    const minutes = Math.min(
      Math.floor(swElapsedMs(s.sw, Date.now()) / 60000),
      1440,
    );
    let next = { ...s, sw: resetSw() };
    if (minutes > 0)
      next = queueRecord(next, { date: toDateString(), minutes });
    commit(next);
    if (minutes > 0) flush();
    return minutes;
  };

  const value = state && {
    state,
    now,
    lastRecord,
    notifDenied,
    pendingMinutes: state.pending.reduce((sum, p) => sum + p.minutes, 0),
    setMode,
    setFocusMin,
    startPomodoro,
    pausePomodoro,
    stopPomodoro,
    skipBreak,
    startStopwatch,
    pauseStopwatch,
    finishStopwatch,
  };

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

// 로그인 전이거나 아직 불러오는 중이면 null
export function useTimer() {
  return useContext(TimerContext);
}
