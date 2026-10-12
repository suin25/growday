import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Card, { CardTitle } from "@/components/ui/Card";
import { toDateString } from "@/lib/date";
import { colors, spacing } from "@/theme/tokens";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MOODS, formatMinutes } from "./logForm";
import { fetchLog } from "./logsApi";

// 홈 화면의 "오늘의 기록" 요약 카드
export default function TodayLogSummary() {
  const [log, setLog] = useState(undefined); // undefined = 아직 불러오는 중

  // 홈 탭이 보일 때마다 새로 불러와요 (기록 탭에서 저장하고 돌아오면 바로 반영)
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      fetchLog(toDateString())
        .then((l) => alive && setLog(l))
        .catch(() => alive && setLog(null));
      return () => {
        alive = false;
      };
    }, []),
  );

  if (log === undefined) return null; // 로딩 중엔 카드를 숨겨서 깜빡임 방지

  const mood = MOODS.find((m) => m.value === log?.mood);
  const exercise =
    log?.exercise_minutes != null
      ? [log.exercise_type, formatMinutes(log.exercise_minutes)]
          .filter(Boolean)
          .join(" ")
      : log?.exercise_type;

  const rows = [
    { label: "📚 공부", value: formatMinutes(log?.study_minutes) },
    { label: "🏃 운동", value: exercise },
    { label: "기분", value: mood && `${mood.emoji} ${mood.label}` },
  ];

  return (
    <Card>
      <CardTitle>오늘의 기록</CardTitle>
      {log ? (
        <View style={{ gap: spacing.md }}>
          {rows.map((r) => (
            <View key={r.label} style={styles.row}>
              <AppText variant="caption">{r.label}</AppText>
              {/* 미입력은 "–"로 표시 (0분과 구분돼요) */}
              <AppText style={[styles.value, r.value == null && styles.empty]}>
                {r.value ?? "–"}
              </AppText>
            </View>
          ))}
          <Button
            title="기록 수정하기"
            variant="secondary"
            size="sm"
            onPress={() => router.navigate("/log")}
          />
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          <AppText variant="caption">
            아직 오늘 기록이 없어요. 30초면 충분해요.
          </AppText>
          <Button
            title="기록하기"
            variant="secondary"
            size="sm"
            onPress={() => router.navigate("/log")}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.lg,
  },
  value: { fontWeight: "500", flexShrink: 1, textAlign: "right" },
  empty: { color: colors.gray300 },
});
