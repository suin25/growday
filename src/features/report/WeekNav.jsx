import AppText from "@/components/ui/AppText";
import { addDays, parseDateString, toDateString } from "@/lib/date";
import { startOfWeek } from "@/lib/report";
import { colors, spacing } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

function label(weekStart, thisWeek) {
  if (weekStart === thisWeek) return "이번 주";
  const s = parseDateString(weekStart);
  const e = addDays(s, 6);
  return `${s.getMonth() + 1}월 ${s.getDate()}일 – ${e.getMonth() + 1}월 ${e.getDate()}일`;
}

// ‹ 이번 주 › — 한 주씩 이동, 미래 주로는 못 가요
export default function WeekNav({ weekStart, onChange }) {
  const thisWeek = startOfWeek(toDateString());
  const isThisWeek = weekStart === thisWeek;
  const move = (n) =>
    onChange(toDateString(addDays(parseDateString(weekStart), n * 7)));

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => move(-1)}
        hitSlop={12}
        accessibilityLabel="이전 주"
      >
        <Ionicons name="chevron-back" size={22} color={colors.gray600} />
      </Pressable>
      <View style={styles.center}>
        <AppText variant="heading">{label(weekStart, thisWeek)}</AppText>
        {!isThisWeek && (
          <Pressable onPress={() => onChange(thisWeek)} hitSlop={8}>
            <AppText style={styles.link}>이번 주로</AppText>
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={() => move(1)}
        disabled={isThisWeek}
        hitSlop={12}
        accessibilityLabel="다음 주"
        style={{ opacity: isThisWeek ? 0.25 : 1 }}
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
  link: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray500,
    textDecorationLine: "underline",
  },
});
