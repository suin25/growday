import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppText from "@/components/ui/AppText";
import KeepAwake from "@/features/timer/KeepAwake";
import { useTimer } from "@/contexts/TimerContext";
import {
  BREAK_MIN,
  formatClock,
  pomoDurationMs,
  pomoRemainingMs,
  todayCount,
} from "@/features/timer/timerLogic";
import { focusColors as c } from "@/theme/tokens";

// 집중 화면: 뽀모도로를 시작하면 어두운 전체 화면으로 타이머만 크게 보여줘요.
// - 탭 바·카드 같은 밝은 요소를 모두 숨겨서 눈에 덜 띄게
// - 버튼은 작고 흐리게, 아래쪽에만
// - 왼쪽 위 ⌄ 버튼으로 언제든 작게(타이머 탭으로) 돌아갈 수 있어요
// (폰의 실제 화면 밝기는 바꾸지 않아요. 앱 화면 색만 어둡게 해요)
export default function FocusScreen() {
  const timer = useTimer();

  if (!timer) return null;
  const { state, now, startPomodoro, pausePomodoro, stopPomodoro, skipBreak } =
    timer;
  const { pomo } = state;
  const remaining = pomoRemainingMs(pomo, now);
  const progress = Math.min(1, 1 - remaining / pomoDurationMs(pomo));
  const isFocus = pomo.phase === "focus";
  const breakReady = !isFocus && pomo.status === "idle";
  const breakDone = isFocus && pomo.status === "idle"; // 휴식이 끝나서 다시 집중 대기
  const running = pomo.status === "running";

  function confirmStop() {
    if (!isFocus) {
      stopPomodoro();
      return;
    }
    const elapsed = Math.floor((pomoDurationMs(pomo) - remaining) / 60000);
    Alert.alert(
      "집중을 그만할까요?",
      elapsed > 0
        ? `지금까지 집중한 ${elapsed}분은 공부 시간에 기록돼요.`
        : "1분 미만이라 기록되지 않아요.",
      [
        { text: "계속하기", style: "cancel" },
        {
          text: "그만하기",
          style: "destructive",
          onPress: () => {
            stopPomodoro();
            close();
          },
        },
      ],
    );
  }

  const label = breakReady
    ? "집중 완료 🎉"
    : breakDone
      ? "휴식 끝"
      : isFocus
        ? `집중 · ${pomo.focusMin}분`
        : `휴식 · ${BREAK_MIN}분`;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      {running && <KeepAwake tag="focus-screen" />}

      <View style={styles.top}>
        <Pressable
          onPress={close}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel="작게 보기"
        >
          <Ionicons name="chevron-down" size={28} color={c.dim} />
        </Pressable>
        <AppText style={styles.count}>
          오늘 집중 {todayCount(state, now)}회
        </AppText>
      </View>

      <View style={styles.center}>
        <AppText
          style={[styles.label, !isFocus && !breakDone && { color: c.break }]}
        >
          {label}
        </AppText>
        <AppText
          style={[styles.clock, pomo.status === "paused" && { opacity: 0.5 }]}
          accessibilityLabel={`남은 시간 ${formatClock(remaining)}`}
        >
          {breakReady ? formatClock(BREAK_MIN * 60000) : formatClock(remaining)}
        </AppText>
        {!breakReady && !breakDone && (
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${progress * 100}%` },
                !isFocus && { backgroundColor: c.break },
              ]}
            />
          </View>
        )}
        {pomo.status === "paused" && (
          <AppText style={styles.hint}>일시정지</AppText>
        )}
        {breakReady && (
          <AppText style={styles.hint}>
            {pomo.focusMin}분 집중했어요. 잠깐 쉬어 가요
          </AppText>
        )}
      </View>

      {/* 아래쪽 작은 버튼들 */}
      <View style={styles.controls}>
        {(running || pomo.status === "paused") && (
          <>
            <RoundButton
              icon="stop"
              label={isFocus ? "그만하기" : "휴식 끝내기"}
              onPress={confirmStop}
            />
            <RoundButton
              icon={running ? "pause" : "play"}
              label={running ? "일시정지" : "계속하기"}
              onPress={running ? pausePomodoro : startPomodoro}
              primary
              tint={isFocus ? c.accent : c.break}
            />
          </>
        )}
        {breakReady && (
          <>
            <RoundButton
              icon="play-skip-forward"
              label="건너뛰기"
              onPress={skipBreak}
            />
            <RoundButton
              icon="cafe"
              label={`휴식 ${BREAK_MIN}분`}
              onPress={startPomodoro}
              primary
              tint={c.break}
            />
          </>
        )}
        {breakDone && (
          <>
            <RoundButton icon="close" label="닫기" onPress={close} />
            <RoundButton
              icon="play"
              label="다시 집중"
              onPress={startPomodoro}
              primary
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function close() {
  if (router.canGoBack()) router.back();
  else router.replace("/timer");
}

// 작은 동그라미 버튼 + 아래 작은 글자
// primary: 테두리·아이콘만 강조색 (꽉 찬 밝은 버튼은 집중을 방해해서 쓰지 않아요)
function RoundButton({ icon, label, onPress, primary, tint = c.accent }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.roundWrap, pressed && { opacity: 0.6 }]}
    >
      <View style={[styles.round, primary && { borderColor: tint }]}>
        <Ionicons name={icon} size={22} color={primary ? tint : c.dim} />
      </View>
      <AppText style={styles.roundLabel}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  count: { fontSize: 13, color: c.dim },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  label: {
    fontSize: 16,
    color: c.accent,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  // 얇고 큰 숫자. tabular-nums로 1초마다 글자 폭이 흔들리지 않게
  clock: {
    fontSize: 88,
    lineHeight: 100,
    fontWeight: "200",
    color: c.text,
    fontVariant: ["tabular-nums"],
  },
  track: {
    width: 200,
    height: 3,
    backgroundColor: c.track,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 8,
  },
  fill: { height: "100%", backgroundColor: c.accent },
  hint: { fontSize: 14, color: c.dim, marginTop: 4 },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 48,
    paddingBottom: 32,
  },
  roundWrap: { alignItems: "center", gap: 8 },
  round: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: c.track,
    alignItems: "center",
    justifyContent: "center",
  },
  roundLabel: { fontSize: 12, color: c.dim },
});
