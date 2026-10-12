import { addDays, toDateString } from "@/lib/date";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import * as api from "./goalsApi";

// 연속 기록 계산에 필요한 만큼만 과거 체크를 가져와요
const HISTORY_DAYS = 60;

// 목표 + 체크 기록을 불러오고, 체크 토글 기능을 제공하는 훅.
// 홈 탭과 목표 탭에서 같이 써요.
export function useGoals() {
  const [goals, setGoals] = useState([]);
  const [checks, setChecks] = useState([]); // [{ goal_id, date }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadedOnce = useRef(false);

  const load = useCallback(async () => {
    // 처음에만 로딩 화면. 이후엔 기존 화면을 보여주면서 조용히 새로고침
    if (!loadedOnce.current) setLoading(true);
    setError(null);
    try {
      const from = toDateString(addDays(new Date(), -HISTORY_DAYS));
      // 두 요청을 동시에 보내서 기다리는 시간을 줄여요
      const [g, c] = await Promise.all([
        api.fetchGoals(),
        api.fetchChecks(from),
      ]);
      setGoals(g);
      setChecks(c);
      loadedOnce.current = true;
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // 이 탭이 화면에 보일 때마다 새로고침.
  // (목표 탭에서 추가한 목표가 홈 탭에도 바로 보이게)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // goal_id → 완료한 날짜 Set. 매 렌더링마다 다시 만들지 않도록 useMemo로 캐싱
  const doneDatesByGoal = useMemo(() => {
    const map = new Map();
    for (const { goal_id, date } of checks) {
      if (!map.has(goal_id)) map.set(goal_id, new Set());
      map.get(goal_id).add(date);
    }
    return map;
  }, [checks]);

  const doneDatesOf = useCallback(
    (goalId) => doneDatesByGoal.get(goalId) ?? new Set(),
    [doneDatesByGoal],
  );

  // 낙관적 업데이트: 화면부터 바로 바꾸고, 저장은 뒤에서.
  // 저장이 실패하면 원래대로 되돌려요.
  const toggleCheck = useCallback(
    async (goalId, date) => {
      const wasDone = doneDatesOf(goalId).has(date);
      const without = (list) =>
        list.filter((c) => !(c.goal_id === goalId && c.date === date));

      setChecks((prev) =>
        wasDone ? without(prev) : [...prev, { goal_id: goalId, date }],
      );
      try {
        if (wasDone) await api.uncheckGoal(goalId, date);
        else await api.checkGoal(goalId, date);
      } catch {
        setChecks((prev) =>
          wasDone
            ? [...without(prev), { goal_id: goalId, date }]
            : without(prev),
        );
        Alert.alert(
          "저장하지 못했어요",
          "인터넷 연결을 확인하고 다시 시도해 주세요.",
        );
      }
    },
    [doneDatesOf],
  );

  const activeGoals = useMemo(
    () => goals.filter((g) => !g.archived_at),
    [goals],
  );
  const archivedGoals = useMemo(
    () => goals.filter((g) => g.archived_at),
    [goals],
  );

  return {
    activeGoals,
    archivedGoals,
    doneDatesOf,
    toggleCheck,
    loading,
    error,
    reload: load,
  };
}
