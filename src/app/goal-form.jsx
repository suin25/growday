import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import TextField from "@/components/ui/TextField";
import {
    createGoal,
    fetchGoal,
    setArchived,
    updateGoal,
} from "@/features/goals/goalsApi";
import { WEEKDAY_LABELS } from "@/lib/date";
import { CATEGORIES, CATEGORY_KEYS, WEEK_ORDER } from "@/lib/goals";
import { colors, spacing } from "@/theme/tokens";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

// 목표 추가/수정 화면 (아래에서 올라오는 모달)
// 주소에 id가 있으면 수정, 없으면 새로 만들기: /goal-form?id=...
export default function GoalFormScreen() {
  const { id } = useLocalSearchParams();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("study");
  const [everyday, setEveryday] = useState(true);
  const [days, setDays] = useState([]); // 선택한 요일들 (0=일 ~ 6=토)
  const [titleError, setTitleError] = useState(null);
  const [daysError, setDaysError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingGoal, setLoadingGoal] = useState(isEdit);

  // 수정 모드면 기존 목표를 불러와서 입력칸을 채워요
  useEffect(() => {
    if (!isEdit) return;
    fetchGoal(id)
      .then((goal) => {
        setTitle(goal.title);
        setCategory(goal.category);
        setEveryday(goal.repeat_days.length === 0);
        setDays(goal.repeat_days);
      })
      .catch(() => {
        Alert.alert("목표를 불러오지 못했어요");
        router.back();
      })
      .finally(() => setLoadingGoal(false));
  }, [id, isEdit]);

  function toggleDay(day) {
    setDaysError(null);
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  async function handleSave() {
    const trimmed = title.trim();
    let ok = true;
    if (!trimmed) {
      setTitleError("목표 이름을 입력해 주세요.");
      ok = false;
    }
    if (!everyday && days.length === 0) {
      setDaysError("요일을 하나 이상 골라 주세요.");
      ok = false;
    }
    if (!ok) return;

    // 7일을 다 고르면 "매일"과 같으니 빈 배열로 저장
    const repeat_days = everyday || days.length === 7 ? [] : [...days].sort();
    const fields = { title: trimmed, category, repeat_days };

    setSaving(true);
    try {
      if (isEdit) await updateGoal(id, fields);
      else await createGoal(fields);
      router.back(); // 모달 닫기 → 목표 탭이 다시 보이면서 자동 새로고침
    } catch {
      setSaving(false);
      Alert.alert(
        "저장하지 못했어요",
        "인터넷 연결을 확인하고 다시 시도해 주세요.",
      );
    }
  }

  function confirmTrash() {
    Alert.alert(
      "휴지통으로 옮길까요?",
      "오늘 목표와 목록에서 사라져요. 휴지통에서 언제든 복원하거나 영구 삭제할 수 있어요.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "휴지통으로",
          style: "destructive",
          onPress: async () => {
            try {
              await setArchived(id, true);
              router.back();
            } catch {
              Alert.alert("옮기지 못했어요", "잠시 후 다시 시도해 주세요.");
            }
          },
        },
      ],
    );
  }

  return (
    <>
      {/* 화면마다 헤더 제목/버튼을 여기서 정할 수 있어요 */}
      <Stack.Screen
        options={{
          title: isEdit ? "목표 수정" : "새 목표",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <AppText style={{ color: colors.gray600 }}>취소</AppText>
            </Pressable>
          ),
        }}
      />

      {loadingGoal ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TextField
            label="목표 이름"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              setTitleError(null);
            }}
            placeholder="예: 영어 단어 20개 외우기"
            maxLength={50}
            autoFocus={!isEdit}
            returnKeyType="done"
            error={titleError}
          />

          <View style={styles.section}>
            <AppText style={styles.label}>카테고리</AppText>
            <View style={styles.wrap}>
              {CATEGORY_KEYS.map((key) => (
                <Chip
                  key={key}
                  label={CATEGORIES[key].label}
                  dotColor={CATEGORIES[key].color}
                  selected={category === key}
                  onPress={() => setCategory(key)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <AppText style={styles.label}>반복</AppText>
            <View style={styles.wrap}>
              <Chip
                label="매일"
                selected={everyday}
                onPress={() => setEveryday(true)}
                style={{ flex: 1 }}
              />
              <Chip
                label="요일 선택"
                selected={!everyday}
                onPress={() => setEveryday(false)}
                style={{ flex: 1 }}
              />
            </View>
            {!everyday && (
              <>
                <View style={styles.days}>
                  {WEEK_ORDER.map((d) => (
                    <Chip
                      key={d}
                      label={WEEKDAY_LABELS[d]}
                      selected={days.includes(d)}
                      onPress={() => toggleDay(d)}
                      style={styles.dayChip}
                    />
                  ))}
                </View>
                {daysError && (
                  <AppText style={styles.error}>{daysError}</AppText>
                )}
              </>
            )}
          </View>

          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            <Button
              title={isEdit ? "저장" : "목표 추가"}
              onPress={handleSave}
              loading={saving}
            />
            {isEdit && (
              <Button
                title="휴지통으로 이동"
                variant="danger"
                onPress={confirmTrash}
              />
            )}
          </View>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.xl, gap: spacing.xxl },
  section: { gap: spacing.sm },
  label: { fontSize: 14, fontWeight: "600", color: colors.gray600 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  days: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  dayChip: { width: 42, paddingHorizontal: 0 },
  error: { fontSize: 13, color: colors.error },
});
