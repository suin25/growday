import AppText from "@/components/ui/AppText";
import { CATEGORIES, describeRepeat } from "@/lib/goals";
import { colors, radius, spacing } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";
import WeekStrip from "./WeekStrip";

// 목표 탭의 카드 하나. 누르면 수정 화면이 열려요.
export default function GoalCard({ goal, stats, streak, today, onPress }) {
  const category = CATEGORIES[goal.category];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText style={styles.title} numberOfLines={2}>
            {goal.title}
          </AppText>
          <View style={styles.meta}>
            <View style={[styles.dot, { backgroundColor: category.color }]} />
            <AppText variant="caption">
              {category.label} · {describeRepeat(goal.repeat_days)}
            </AppText>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.gray300} />
      </View>

      <WeekStrip days={stats.days} today={today} />

      <View style={styles.footer}>
        <AppText variant="caption">
          {stats.scheduledCount === 0
            ? "최근 7일 동안 예정된 날이 없었어요"
            : `최근 7일 · ${stats.scheduledCount}번 중 ${stats.doneCount}번 달성`}
        </AppText>
        {streak >= 2 && (
          <View style={styles.streak}>
            <Ionicons name="flame" size={14} color={colors.exercise} />
            <AppText style={styles.streakText}>{streak}회 연속</AppText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  title: { fontSize: 16, fontWeight: "600" },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streak: { flexDirection: "row", alignItems: "center", gap: 2 },
  streakText: { fontSize: 13, fontWeight: "600", color: colors.gray600 },
});
