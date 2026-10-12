import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Screen from "@/components/ui/Screen";
import { ErrorState, SkeletonList } from "@/components/ui/States";
import GoalCard from "@/features/goals/GoalCard";
import { deleteGoal, setArchived } from "@/features/goals/goalsApi";
import { useGoals } from "@/features/goals/useGoals";
import { lastNDates, toDateString } from "@/lib/date";
import {
  CATEGORIES,
  computeStreak,
  describeRepeat,
  recentStats,
} from "@/lib/goals";
import { colors, radius, spacing } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

export default function GoalsScreen() {
  const { activeGoals, archivedGoals, doneDatesOf, loading, error, reload } =
    useGoals();
  const [showTrash, setShowTrash] = useState(false);

  const today = toDateString();
  const week = lastNDates(7);

  const openNew = () => router.push("/goal-form");
  const openEdit = (id) =>
    router.push({ pathname: "/goal-form", params: { id } });

  async function restore(goal) {
    try {
      await setArchived(goal.id, false);
      reload();
    } catch {
      Alert.alert("복원하지 못했어요", "잠시 후 다시 시도해 주세요.");
    }
  }

  function confirmDelete(goal) {
    Alert.alert(
      "영구 삭제할까요?",
      `"${goal.title}"의 체크 기록도 모두 사라지고 되돌릴 수 없어요.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "영구 삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoal(goal.id);
              reload();
            } catch {
              Alert.alert("삭제하지 못했어요", "잠시 후 다시 시도해 주세요.");
            }
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="title">목표</AppText>
          <AppText variant="caption">
            매일 또는 원하는 요일에 반복할 목표예요.
          </AppText>
        </View>
        <Pressable
          onPress={openNew}
          accessibilityLabel="목표 추가"
          style={({ pressed }) => [
            styles.addButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </Pressable>
      </View>

      {loading ? (
        <SkeletonList count={3} />
      ) : error ? (
        <Card>
          <ErrorState onRetry={reload} />
        </Card>
      ) : activeGoals.length === 0 ? (
        <Card>
          <EmptyState
            icon="flag-outline"
            title="첫 목표를 만들어 볼까요?"
            description="'물 2L 마시기'처럼 작고 구체적일수록 좋아요."
            action={
              <Button title="목표 추가하기" size="sm" onPress={openNew} />
            }
          />
        </Card>
      ) : (
        activeGoals.map((goal) => {
          const done = doneDatesOf(goal.id);
          return (
            <GoalCard
              key={goal.id}
              goal={goal}
              today={today}
              stats={recentStats(goal, done, week)}
              streak={computeStreak(goal, done, today)}
              onPress={() => openEdit(goal.id)}
            />
          );
        })
      )}

      {/* 휴지통: DB에서는 archived_at이 채워진 목표예요 */}
      {archivedGoals.length > 0 && (
        <View style={{ gap: spacing.sm }}>
          <Pressable
            onPress={() => setShowTrash((v) => !v)}
            style={styles.trashToggle}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={18} color={colors.gray500} />
            <AppText variant="caption" style={{ flex: 1 }}>
              휴지통 ({archivedGoals.length})
            </AppText>
            <Ionicons
              name={showTrash ? "chevron-down" : "chevron-forward"}
              size={16}
              color={colors.gray500}
            />
          </Pressable>

          {showTrash &&
            archivedGoals.map((goal) => (
              <View key={goal.id} style={styles.trashRow}>
                <View style={{ flex: 1 }}>
                  <AppText style={{ color: colors.gray600 }} numberOfLines={1}>
                    {goal.title}
                  </AppText>
                  <AppText variant="caption">
                    {CATEGORIES[goal.category].label} ·{" "}
                    {describeRepeat(goal.repeat_days)}
                  </AppText>
                </View>
                <Pressable onPress={() => restore(goal)} hitSlop={8}>
                  <AppText style={styles.restore}>복원</AppText>
                </Pressable>
                <Pressable onPress={() => confirmDelete(goal)} hitSlop={8}>
                  <AppText style={styles.delete}>영구 삭제</AppText>
                </Pressable>
              </View>
            ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary600,
    alignItems: "center",
    justifyContent: "center",
  },
  trashToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  trashRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.gray100,
  },
  restore: { fontSize: 14, fontWeight: "600", color: colors.primary600 },
  delete: { fontSize: 14, fontWeight: "600", color: colors.error },
});
