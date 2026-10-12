import AppText from "@/components/ui/AppText";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Screen from "@/components/ui/Screen";
import { ErrorState, SkeletonList } from "@/components/ui/States";
import { MOODS, formatMinutes } from "@/features/logs/logForm";
import BarChart from "@/features/report/BarChart";
import StatTile from "@/features/report/StatTile";
import WeekNav from "@/features/report/WeekNav";
import { useWeekReport } from "@/features/report/useWeekReport";
import {
  WEEKDAY_LABELS,
  formatShortDate,
  parseDateString,
  toDateString,
} from "@/lib/date";
import { CATEGORIES } from "@/lib/goals";
import { startOfWeek } from "@/lib/report";
import { colors, radius, spacing } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function ReportScreen() {
  const [weekStart, setWeekStart] = useState(startOfWeek(toDateString()));
  const { report, loading, error, reload } = useWeekReport(weekStart);

  return (
    <Screen>
      <View style={{ gap: 4, paddingTop: spacing.sm }}>
        <AppText variant="title">리포트</AppText>
        <AppText variant="caption">한 주의 흐름을 가볍게 돌아봐요.</AppText>
      </View>

      <WeekNav weekStart={weekStart} onChange={setWeekStart} />

      {loading ? (
        <SkeletonList count={4} />
      ) : error ? (
        <Card>
          <ErrorState onRetry={reload} />
        </Card>
      ) : (
        <ReportBody report={report} />
      )}
    </Screen>
  );
}

function ReportBody({ report }) {
  const {
    goals,
    study,
    studySummary,
    exercise,
    exerciseSummary,
    mood,
    today,
    dates,
  } = report;
  const isEmpty =
    goals.scheduled === 0 &&
    studySummary.recordedDays === 0 &&
    exerciseSummary.recordedDays === 0 &&
    mood.every((m) => m.value == null);

  if (isEmpty) {
    return (
      <Card>
        <EmptyState
          icon="bar-chart-outline"
          title="이 주에는 기록이 없어요"
          description="목표를 체크하거나 기록을 남기면 여기에 모여요."
        />
      </Card>
    );
  }

  // 타일은 좁아서 짧게: 210분 → "3.5시간", 45분 → "45분", 기록 없으면 "–"
  const compact = (s) => {
    if (!s.recordedDays) return "–";
    if (s.total < 60) return `${s.total}분`;
    return `${Number((s.total / 60).toFixed(1))}시간`;
  };

  return (
    <>
      {/* 핵심 숫자 3개 */}
      <View style={styles.tiles}>
        <StatTile
          label="목표 달성"
          value={goals.rate == null ? "–" : `${goals.rate}%`}
          sub={
            goals.scheduled
              ? `${goals.scheduled}번 중 ${goals.done}번`
              : "예정 없음"
          }
          color={colors.primary500}
        />
        <StatTile
          label="공부"
          value={compact(studySummary)}
          sub={`${studySummary.recordedDays}일 기록`}
          color={colors.study}
        />
        <StatTile
          label="운동"
          value={compact(exerciseSummary)}
          sub={`${exerciseSummary.recordedDays}일 기록`}
          color={colors.exercise}
        />
      </View>

      <Card style={styles.card}>
        <AppText variant="heading">일별 목표 달성률</AppText>
        <BarChart
          data={goals.days.map((d) => ({
            date: d.date,
            future: d.future,
            value: d.rate,
          }))}
          color={colors.primary500}
          max={100}
          formatValue={(v) => `${v}%`}
          emptyLabel="예정된 목표 없음"
          today={today}
        />
      </Card>

      <Card style={styles.card}>
        <View style={styles.titleRow}>
          <AppText variant="heading">공부 시간</AppText>
          {studySummary.average != null && (
            <AppText variant="caption">
              기록한 날 평균 {formatMinutes(studySummary.average)}
            </AppText>
          )}
        </View>
        <BarChart
          data={study}
          color={colors.study}
          formatValue={formatMinutes}
          today={today}
        />
      </Card>

      <Card style={styles.card}>
        <View style={styles.titleRow}>
          <AppText variant="heading">운동 시간</AppText>
          {exerciseSummary.average != null && (
            <AppText variant="caption">
              기록한 날 평균 {formatMinutes(exerciseSummary.average)}
            </AppText>
          )}
        </View>
        <BarChart
          data={exercise}
          color={colors.exercise}
          formatValue={formatMinutes}
          today={today}
        />
        <AppText variant="caption">
          – 는 기록하지 않은 날이에요. (0분과 달라요)
        </AppText>
      </Card>

      {goals.perGoal.length > 0 && (
        <Card style={styles.card}>
          <AppText variant="heading">목표별 실천</AppText>
          {goals.perGoal.map(({ goal, scheduled, done }) => (
            <View key={goal.id} style={{ gap: 6 }}>
              <View style={styles.titleRow}>
                <View style={styles.goalName}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: CATEGORIES[goal.category].color },
                    ]}
                  />
                  <AppText numberOfLines={1} style={{ flexShrink: 1 }}>
                    {goal.title}
                    {goal.archived_at ? " (휴지통)" : ""}
                  </AppText>
                </View>
                <AppText variant="caption">
                  {scheduled}번 중 {done}번
                </AppText>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    { width: `${(done / scheduled) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </Card>
      )}

      <Card style={styles.card}>
        <AppText variant="heading">기분</AppText>
        <View style={styles.moodRow}>
          {mood.map((m) => {
            const info = MOODS.find((x) => x.value === m.value);
            return (
              <View key={m.date} style={styles.moodCell}>
                <AppText style={[styles.moodEmoji, !info && styles.moodEmpty]}>
                  {m.future ? "" : info ? info.emoji : "–"}
                </AppText>
                <AppText
                  style={[
                    styles.dayLabel,
                    m.date === today && styles.todayLabel,
                  ]}
                >
                  {m.date === today
                    ? "오늘"
                    : WEEKDAY_LABELS[parseDateString(m.date).getDay()]}
                </AppText>
              </View>
            );
          })}
        </View>
      </Card>

      {/* 과거 기록 조회: 누르면 기록 탭에서 그 날짜가 열려요 */}
      <Card style={styles.card}>
        <AppText variant="heading">하루씩 보기</AppText>
        {dates
          .filter((d) => d <= today)
          .reverse()
          .map((date) => (
            <DayRow key={date} date={date} report={report} />
          ))}
      </Card>

      <Card style={styles.aiCard}>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Ionicons name="sparkles" size={20} color={colors.primary600} />
          <View style={{ flex: 1 }}>
            <AppText style={styles.aiTitle}>AI 주간 피드백</AppText>
            <AppText style={styles.aiBody}>
              이번 주 기록을 바탕으로 한 피드백이 여기에 생길 거예요. (9단계)
            </AppText>
          </View>
        </View>
      </Card>
    </>
  );
}

function DayRow({ date, report }) {
  const log = report.logsByDate.get(date);
  const day = report.goals.days.find((d) => d.date === date);
  const mood = MOODS.find((m) => m.value === log?.mood);

  const parts = [];
  if (day?.scheduled) parts.push(`목표 ${day.done}/${day.scheduled}`);
  if (log?.study_minutes != null)
    parts.push(`공부 ${formatMinutes(log.study_minutes)}`);
  if (log?.exercise_minutes != null)
    parts.push(`운동 ${formatMinutes(log.exercise_minutes)}`);
  if (mood) parts.push(mood.emoji);

  return (
    <Pressable
      onPress={() =>
        router.navigate({ pathname: "/log", params: { date, t: Date.now() } })
      }
      style={({ pressed }) => [styles.dayRow, pressed && { opacity: 0.6 }]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <AppText style={{ fontWeight: "500" }}>
          {formatShortDate(date)}
          {date === report.today ? " · 오늘" : ""}
        </AppText>
        <AppText variant="caption" numberOfLines={1}>
          {parts.length ? parts.join(" · ") : "기록 없음"}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.gray300} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: "row", gap: spacing.sm },
  card: { gap: spacing.lg },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  goalName: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  track: {
    height: 6,
    backgroundColor: colors.gray100,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary500,
    borderRadius: radius.full,
  },
  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodCell: { flex: 1, alignItems: "center", gap: spacing.xs },
  moodEmoji: { fontSize: 24, minHeight: 30 },
  moodEmpty: { fontSize: 14, color: colors.gray300, lineHeight: 30 },
  dayLabel: { fontSize: 11, color: colors.gray500 },
  todayLabel: { color: colors.gray900, fontWeight: "600" },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  aiCard: { backgroundColor: colors.primary50, borderColor: colors.primary100 },
  aiTitle: { fontSize: 14, fontWeight: "600", color: colors.primary700 },
  aiBody: { fontSize: 14, color: colors.gray600, marginTop: 4, lineHeight: 20 },
});
