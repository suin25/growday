import CoachCard from "@/features/coach/CoachCard";
import { AI_ENABLED } from "@/lib/features";
import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Card, { CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Screen from "@/components/ui/Screen";
import { ErrorState, SkeletonList } from "@/components/ui/States";
import GoalCheckItem from "@/features/goals/GoalCheckItem";
import { useGoals } from "@/features/goals/useGoals";
import TodayLogSummary from "@/features/logs/TodayLogSummary";
import { useProfile } from "@/features/profile/useProfile";
import { formatKoreanDate, greetingByTime, toDateString } from "@/lib/date";
import { isScheduledOn } from "@/lib/goals";
import { colors, radius, spacing } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

// 달성률에 따라 부담 없는 한마디 (0%여도 비난하지 않기!)
function progressMessage(done, total) {
  if (total === 0) return "오늘은 예정된 목표가 없어요. 푹 쉬어도 좋아요.";
  if (done === total) return "오늘 목표를 모두 달성했어요 🎉";
  if (done === 0) return "하나만 해도 충분해요. 가볍게 시작해 볼까요?";
  return `좋아요! ${total - done}개 남았어요.`;
}

export default function HomeScreen() {
  const { profile } = useProfile();
  const { activeGoals, doneDatesOf, toggleCheck, loading, error, reload } =
    useGoals();

  const today = toDateString();
  const todaysGoals = activeGoals.filter((g) => isScheduledOn(g, today));
  const doneCount = todaysGoals.filter((g) =>
    doneDatesOf(g.id).has(today),
  ).length;
  const total = todaysGoals.length;
  const progress = total === 0 ? 0 : doneCount / total;
  const name = profile?.nickname ? `${profile.nickname}님, ` : "";

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <AppText variant="caption">{formatKoreanDate()}</AppText>
          <AppText variant="title" style={{ marginTop: 4 }}>
            {name}
            {greetingByTime()} 👋
          </AppText>
        </View>
        <Pressable
          onPress={() => router.push("/settings")}
          hitSlop={12}
          accessibilityLabel="설정"
        >
          <Ionicons name="settings-outline" size={24} color={colors.gray600} />
        </Pressable>
      </View>

      <Card>
        <CardTitle>오늘의 달성률</CardTitle>
        <View style={styles.rowBetween}>
          <AppText variant="number">{Math.round(progress * 100)}%</AppText>
          <AppText variant="caption">
            {doneCount} / {total} 완료
          </AppText>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        {!loading && !error && (
          <AppText variant="caption" style={{ marginTop: spacing.md }}>
            {progressMessage(doneCount, total)}
          </AppText>
        )}
      </Card>

      <Card>
        <CardTitle>오늘의 목표</CardTitle>
        {loading ? (
          <SkeletonList count={3} />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : activeGoals.length === 0 ? (
          <EmptyState
            icon="flag-outline"
            title="아직 목표가 없어요"
            description="작은 목표 하나부터 시작해 볼까요?"
            action={
              <Button
                title="목표 추가하기"
                size="sm"
                onPress={() => router.push("/goal-form")}
              />
            }
          />
        ) : total === 0 ? (
          <EmptyState
            icon="cafe-outline"
            title="오늘은 쉬는 날이에요"
            description="다른 요일에 예정된 목표만 있어요."
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {todaysGoals.map((goal) => (
              <GoalCheckItem
                key={goal.id}
                goal={goal}
                done={doneDatesOf(goal.id).has(today)}
                onToggle={() => toggleCheck(goal.id, today)}
              />
            ))}
          </View>
        )}
      </Card>
      <TodayLogSummary />
      {AI_ENABLED && <CoachCard type="daily" targetDate={today} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: spacing.sm,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  track: {
    height: 8,
    marginTop: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary500,
    borderRadius: radius.full,
  },
});
