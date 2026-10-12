import { fetchChecks, fetchGoals } from "@/features/goals/goalsApi";
import { fetchLogs } from "@/features/logs/logsApi";
import { toDateString } from "@/lib/date";
import { logSeries, summarize, weekDates, weekGoalStats } from "@/lib/report";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";

// 한 주(weekStart = 월요일)의 목표·기록을 불러와서 리포트 숫자로 만들어요
export function useWeekReport(weekStart) {
  const [raw, setRaw] = useState(null); // { goals, checks, logs }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const shownWeek = useRef(null);

  const dates = useMemo(() => weekDates(weekStart), [weekStart]);

  const load = useCallback(async () => {
    // 다른 주로 넘어갈 때만 로딩 화면, 같은 주 새로고침은 조용히
    if (shownWeek.current !== weekStart) setLoading(true);
    setError(null);
    try {
      const [goals, checks, logs] = await Promise.all([
        fetchGoals(), // 휴지통 목표도 포함 (지난 기록 계산용)
        fetchChecks(dates[0], dates[6]),
        fetchLogs(dates[0], dates[6]),
      ]);
      setRaw({ goals, checks, logs });
      shownWeek.current = weekStart;
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [weekStart, dates]);

  // 탭이 보일 때 + 주가 바뀔 때 다시 불러오기
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const report = useMemo(() => {
    if (!raw) return null;
    const today = toDateString();
    const checkSet = new Set(raw.checks.map((c) => `${c.goal_id}|${c.date}`));
    const logsByDate = new Map(raw.logs.map((l) => [l.date, l]));
    const study = logSeries(logsByDate, dates, "study_minutes", today);
    const exercise = logSeries(logsByDate, dates, "exercise_minutes", today);
    return {
      today,
      dates,
      goals: weekGoalStats(raw.goals, checkSet, dates, today),
      study,
      studySummary: summarize(study),
      exercise,
      exerciseSummary: summarize(exercise),
      mood: logSeries(logsByDate, dates, "mood", today),
      logsByDate,
    };
  }, [raw, dates]);

  return { report, loading, error, reload: load };
}
