import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { colors, radius, spacing } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useCoach } from "./useCoach";

const TITLES = { daily: "오늘의 한 가지", weekly: "AI 주간 피드백" };

// AI 코치 카드. 홈(daily)과 리포트(weekly)에서 같이 써요.
export default function CoachCard({ type, targetDate }) {
  const { feedback, checking, generating, error, generate } = useCoach(
    type,
    targetDate,
  );
  const content = feedback?.content;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color={colors.primary600} />
        <AppText style={styles.title}>{TITLES[type]}</AppText>
      </View>

      {checking ? (
        <ActivityIndicator
          color={colors.primary600}
          style={{ alignSelf: "flex-start" }}
        />
      ) : generating ? (
        <View style={styles.row}>
          <ActivityIndicator color={colors.primary600} />
          <AppText style={styles.body}>AI가 기록을 살펴보고 있어요…</AppText>
        </View>
      ) : content ? (
        <>
          {type === "daily" ? (
            <DailyContent c={content} />
          ) : (
            <WeeklyContent c={content} />
          )}
          {content.evidence?.length > 0 && (
            <Evidence items={content.evidence} />
          )}
          {!feedback.empty && (
            <Pressable
              onPress={() => generate(true)}
              hitSlop={8}
              style={styles.again}
            >
              <Ionicons name="refresh" size={14} color={colors.gray500} />
              <AppText style={styles.againText}>다른 제안 보기</AppText>
            </Pressable>
          )}
        </>
      ) : (
        <>
          <AppText style={styles.body}>
            {type === "daily"
              ? "최근 기록을 바탕으로 오늘 실천할 작은 과제 하나를 추천해 드려요."
              : "이 주의 기록을 바탕으로 잘한 점과 다음 주 제안을 정리해 드려요."}
          </AppText>
          <Button
            title="AI 추천 받기"
            size="sm"
            onPress={() => generate(false)}
          />
          <AppText style={styles.privacy}>
            목표 이름과 숫자 기록만 AI에 보내요. 메모는 보내지 않아요.
          </AppText>
        </>
      )}

      {error && (
        <View style={styles.errorBox}>
          <AppText style={styles.errorText}>{error}</AppText>
          <Pressable onPress={() => generate(Boolean(content))} hitSlop={8}>
            <AppText style={styles.retry}>다시 시도</AppText>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

function DailyContent({ c }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText style={styles.task}>{c.task}</AppText>
      <AppText style={styles.body}>{c.reason}</AppText>
    </View>
  );
}

function WeeklyContent({ c }) {
  return (
    <View style={{ gap: spacing.md }}>
      <AppText style={styles.body}>{c.summary}</AppText>
      {c.highlights?.length > 0 && (
        <Section label="잘한 점">
          {c.highlights.map((h) => (
            <AppText key={h} style={styles.body}>
              • {h}
            </AppText>
          ))}
        </Section>
      )}
      <Section label="다음 주에 해볼 것">
        <AppText style={styles.strong}>{c.suggestion}</AppText>
      </Section>
      <Section label="돌아보기 질문">
        <AppText style={styles.body}>{c.question}</AppText>
      </Section>
    </View>
  );
}

function Section({ label, children }) {
  return (
    <View style={{ gap: 4 }}>
      <AppText style={styles.sectionLabel}>{label}</AppText>
      {children}
    </View>
  );
}

// "근거" 표시: AI가 어떤 기록을 보고 말했는지 보여줘요 (우리 앱의 차별점!)
function Evidence({ items }) {
  return (
    <View style={styles.evidence}>
      <AppText style={styles.sectionLabel}>근거가 된 기록</AppText>
      {items.map((e) => (
        <AppText key={e} style={styles.evidenceText}>
          · {e}
        </AppText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary100,
    gap: spacing.md,
  },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { fontSize: 15, fontWeight: "600", color: colors.primary700 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  task: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.gray900,
    lineHeight: 26,
  },
  body: { fontSize: 14, color: colors.gray600, lineHeight: 21 },
  strong: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray900,
    lineHeight: 22,
  },
  sectionLabel: { fontSize: 12, fontWeight: "600", color: colors.primary700 },
  evidence: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.white,
  },
  evidenceText: { fontSize: 13, color: colors.gray600, lineHeight: 19 },
  again: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  againText: { fontSize: 13, color: colors.gray500, fontWeight: "500" },
  privacy: { fontSize: 12, color: colors.gray500 },
  errorBox: { gap: 4 },
  errorText: { fontSize: 13, color: colors.error },
  retry: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray600,
    textDecorationLine: "underline",
  },
});
