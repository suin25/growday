import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Screen from "@/components/ui/Screen";
import { ErrorState, SkeletonList } from "@/components/ui/States";
import TextField from "@/components/ui/TextField";
import DateNav from "@/features/logs/DateNav";
import MinutesField from "@/features/logs/MinutesField";
import MoodPicker from "@/features/logs/MoodPicker";
import { useDailyLog } from "@/features/logs/useDailyLog";
import { toDateString } from "@/lib/date";
import { spacing } from "@/theme/tokens";
import { useRef, useState } from "react";
import { Alert, Keyboard, StyleSheet, View } from "react-native";

export default function LogScreen() {
  const [date, setDate] = useState(toDateString());
  const {
    form,
    setField,
    errors,
    isDirty,
    hasRecord,
    loading,
    loadError,
    saving,
    save,
    reload,
  } = useDailyLog(date);

  const scrollRef = useRef(null);

  // 메모 칸을 누르면 화면 맨 아래(메모 칸 + 저장 버튼)까지 스크롤해요.
  // keyboardWillShow: 키보드가 올라오기 "시작할 때" 바로 스크롤 → 키보드와 화면이 함께 올라가요
  // keyboardDidShow: 다 올라온 뒤 한 번 더 맞춤 (이미 맨 아래면 움직이지 않아서 티가 안 나요)
  function revealBottom() {
    const scroll = () => scrollRef.current?.scrollToEnd({ animated: true });
    if (Keyboard.isVisible()) {
      scroll();
      return;
    }
    const subs = [
      Keyboard.addListener("keyboardWillShow", scroll),
      Keyboard.addListener("keyboardDidShow", () => {
        scroll();
        subs.forEach((s) => s.remove());
      }),
    ];
    setTimeout(() => subs.forEach((s) => s.remove()), 1500); // 혹시 키보드가 안 뜨면(외장 키보드 등) 대기 해제
  }

  // 저장 안 한 내용이 있는데 날짜를 바꾸려 하면 한 번 물어봐요
  function changeDate(next) {
    if (!isDirty) return setDate(next);
    Alert.alert(
      "저장하지 않은 내용이 있어요",
      "저장하지 않고 다른 날짜로 이동할까요?",
      [
        { text: "취소", style: "cancel" },
        { text: "이동", style: "destructive", onPress: () => setDate(next) },
      ],
    );
  }

  async function handleSave() {
    try {
      await save();
    } catch {
      Alert.alert(
        "저장하지 못했어요",
        "인터넷 연결을 확인하고 다시 시도해 주세요.",
      );
    }
  }

  const buttonTitle = isDirty ? "저장" : hasRecord ? "저장됨 ✓" : "저장";

  return (
    <Screen scrollRef={scrollRef}>
      <View style={{ gap: 4, paddingTop: spacing.sm }}>
        <AppText variant="title">기록</AppText>
        <AppText variant="caption">
          모든 항목은 선택이에요. 기억나는 것만 적어도 충분해요.
        </AppText>
      </View>

      <DateNav date={date} onChange={changeDate} />

      {loading ? (
        <SkeletonList count={4} />
      ) : loadError ? (
        <Card>
          <ErrorState onRetry={reload} />
        </Card>
      ) : (
        <>
          <Card style={styles.card}>
            <AppText variant="heading">📚 공부</AppText>
            <MinutesField
              label="공부 시간"
              value={form.study_minutes}
              onChange={(v) => setField("study_minutes", v)}
              error={errors.study_minutes}
            />
            <TextField
              label="무엇을 공부했나요?"
              value={form.study_note}
              onChangeText={(v) => setField("study_note", v)}
              placeholder="예: 토익 RC 파트5"
              maxLength={500}
            />
          </Card>

          <Card style={styles.card}>
            <AppText variant="heading">🏃 운동</AppText>
            <TextField
              label="운동 종류"
              value={form.exercise_type}
              onChangeText={(v) => setField("exercise_type", v)}
              placeholder="예: 러닝, 헬스, 산책"
              maxLength={50}
            />
            <MinutesField
              label="운동 시간"
              value={form.exercise_minutes}
              onChange={(v) => setField("exercise_minutes", v)}
              error={errors.exercise_minutes}
            />
          </Card>

          <Card style={styles.card}>
            <AppText variant="heading">오늘의 기분</AppText>
            <MoodPicker
              value={form.mood}
              onChange={(v) => setField("mood", v)}
            />
          </Card>

          <Card style={styles.card}>
            <AppText variant="heading">메모</AppText>
            <TextField
              value={form.memo}
              onChangeText={(v) => setField("memo", v)}
              placeholder="오늘 하루 한 줄 정리"
              maxLength={1000}
              multiline
              onFocus={revealBottom}
            />
          </Card>

          <View style={{ gap: spacing.sm }}>
            <Button
              title={buttonTitle}
              onPress={handleSave}
              loading={saving}
              disabled={!isDirty}
            />
            <AppText variant="caption" style={{ textAlign: "center" }}>
              비워둔 항목은 '미입력'으로 저장돼요.
            </AppText>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
});
