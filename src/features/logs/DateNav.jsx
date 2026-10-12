import AppText from "@/components/ui/AppText";
import {
    addDays,
    formatShortDate,
    parseDateString,
    toDateString,
} from "@/lib/date";
import { colors, spacing } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

// ‹ 10월 12일 (월) › — 하루씩 이동. 미래로는 못 가요.
export default function DateNav({ date, onChange }) {
  const today = toDateString();
  const isToday = date === today;
  const move = (n) => onChange(toDateString(addDays(parseDateString(date), n)));

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => move(-1)}
        hitSlop={12}
        accessibilityLabel="이전 날"
      >
        <Ionicons name="chevron-back" size={22} color={colors.gray600} />
      </Pressable>

      <View style={styles.center}>
        <AppText variant="heading">{formatShortDate(date)}</AppText>
        {isToday ? (
          <AppText style={styles.todayBadge}>오늘</AppText>
        ) : (
          <Pressable onPress={() => onChange(today)} hitSlop={8}>
            <AppText style={styles.toToday}>오늘로</AppText>
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={() => move(1)}
        disabled={isToday}
        hitSlop={12}
        accessibilityLabel="다음 날"
        style={{ opacity: isToday ? 0.25 : 1 }}
      >
        <Ionicons name="chevron-forward" size={22} color={colors.gray600} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  center: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  todayBadge: { fontSize: 13, fontWeight: "600", color: colors.primary600 },
  toToday: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray500,
    textDecorationLine: "underline",
  },
});
