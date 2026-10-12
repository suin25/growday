import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { fetchSavedFeedback, requestFeedback } from "./coachApi";

// type: 'daily' | 'weekly', targetDate: 오늘 날짜 또는 그 주 월요일
export function useCoach(type, targetDate) {
  const [feedback, setFeedback] = useState(null); // { content, created_at, ... }
  const [checking, setChecking] = useState(true); // 저장된 피드백 확인 중
  const [generating, setGenerating] = useState(false); // AI가 만드는 중
  const [error, setError] = useState(null);

  // 화면이 보일 때 저장된 피드백이 있는지 확인 (없으면 버튼만 보여줘요)
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setChecking(true);
      setError(null);
      fetchSavedFeedback(type, targetDate)
        .then((f) => alive && setFeedback(f))
        .catch(() => alive && setFeedback(null))
        .finally(() => alive && setChecking(false));
      return () => {
        alive = false;
      };
    }, [type, targetDate]),
  );

  const generate = useCallback(
    async (regenerate = false) => {
      setGenerating(true);
      setError(null);
      try {
        const res = await requestFeedback({
          type,
          weekStart: type === "weekly" ? targetDate : undefined,
          regenerate,
        });
        setFeedback({ ...res.feedback, empty: res.empty });
      } catch (e) {
        setError(e.message);
      } finally {
        setGenerating(false);
      }
    },
    [type, targetDate],
  );

  return { feedback, checking, generating, error, generate };
}
