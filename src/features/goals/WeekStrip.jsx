import AppText from "@/components/ui/AppText";
import { WEEKDAY_LABELS, parseDateString } from "@/lib/date";
import { colors, spacing } from "@/theme/tokens";
import { StyleSheet, View } from "react-native";

// 최근 7일을 점 7개로 보여줘요.
// 완료 = 초록 / 해야 했는데 안 함 = 회색 테두리 / 쉬는 날 = 작은 점
// (안 한 날을 빨간색으로 표시하지 않는 게 우리 디자인 원칙!)
export default function WeekStrip({ days, today }) {
  return (
    <View style={styles.row}>
      {days.map(({ date, scheduled, done }) => {
        const isToday = date === today;
        return (
          <View key={date} style={styles.col}>
            <View
              style={[
                styles.circle,
                scheduled && styles.pending,
                done && styles.done,
                !scheduled && !done && styles.rest,
              ]}
            />
            <AppText style={[styles.label, isToday && styles.today]}>
              {isToday
                ? "오늘"
                : WEEKDAY_LABELS[parseDateString(date).getDay()]}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const SIZE = 18;
const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { alignItems: "center", gap: spacing.xs, width: 32 },
  circle: { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
  pending: { borderWidth: 2, borderColor: colors.gray300 },
  done: { backgroundColor: colors.primary500, borderWidth: 0 },
  rest: {
    width: 6,
    height: 6,
    marginVertical: (SIZE - 6) / 2,
    backgroundColor: colors.gray200,
  },
  label: { fontSize: 11, color: colors.gray500 },
  today: { color: colors.gray900, fontWeight: "600" },
});
