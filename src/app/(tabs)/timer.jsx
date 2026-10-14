import { Alert, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Screen from "@/components/ui/Screen";
import Card from "@/components/ui/Card";
import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { SkeletonList } from "@/components/ui/States";
import { useTimer } from "@/contexts/TimerContext";
import KeepAwake from "@/features/timer/KeepAwake";
import {
  BREAK_MIN,
  FOCUS_OPTIONS,
  formatClock,
  pomoDurationMs,
  pomoRemainingMs,
  swElapsedMs,
  todayCount,
} from "@/features/timer/timerLogic";
import { formatMinutes } from "@/features/logs/logForm";
import { colors, radius, spacing } from "@/theme/tokens";

export default function TimerScreen() {
  const timer = useTimer();
  if (!timer) {
    return (
      <Screen>
        <SkeletonList count={2} />
      </Screen>
    );
  }

  const { state, now, setMode, lastRecord, pendingMinutes, notifDenied } =
    timer;
  const running =
    state.pomo.status === "running" || state.sw.status === "running";

  function changeMode(mode) {
    if (mode === state.mode) return;
    if (!setMode(mode))
      Alert.alert(
        "진행 중인 타이머가 있어요",
        "지금 타이머를 끝낸 뒤에 바꿀 수 있어요.",
      );
  }

  // 방금(10분 이내) 기록된 공부 시간 안내
  const showRecord = lastRecord && now - lastRecord.at < 10 * 60 * 1000;

  return (
    <Screen>
      {running && <KeepAwake tag="timer-tab" />}
      <View style={{ gap: 4, paddingTop: spacing.sm }}>
        <AppText variant="title">타이머</AppText>
        <AppText variant="caption">
          집중한 시간은 오늘 기록의 공부 시간에 자동으로 더해져요.
        </AppText>
      </View>

      <View style={styles.modeRow}>
        <Chip
          label="⏳ 뽀모도로"
          selected={state.mode === "pomodoro"}
          onPress={() => changeMode("pomodoro")}
          style={{ flex: 1 }}
        />
        <Chip
          label="⏱ 스톱워치"
          selected={state.mode === "stopwatch"}
          onPress={() => changeMode("stopwatch")}
          style={{ flex: 1 }}
        />
      </View>

      {state.mode === "pomodoro" ? (
        <Pomodoro timer={timer} />
      ) : (
        <Stopwatch timer={timer} />
      )}

      {showRecord && (
        <View style={styles.notice}>
          <AppText style={styles.noticeText}>
            ✓ {formatMinutes(lastRecord.minutes)}이 오늘 공부 시간에 더해졌어요
          </AppText>
        </View>
      )}
      {pendingMinutes > 0 && (
        <AppText variant="caption" style={{ textAlign: "center" }}>
          인터넷에 연결되면 {formatMinutes(pendingMinutes)}을 공부 시간에
          기록할게요.
        </AppText>
      )}
      {notifDenied && (
        <AppText variant="caption" style={{ textAlign: "center" }}>
          알림이 꺼져 있어서 앱 밖에서는 종료를 알려드릴 수 없어요. (iPhone 설정
          → 알림에서 켤 수 있어요)
        </AppText>
      )}
      {running && (
        <AppText variant="caption" style={{ textAlign: "center" }}>
          앱을 닫거나 다른 탭으로 가도 타이머는 계속 흘러가요.
        </AppText>
      )}
    </Screen>
  );
}

function Pomodoro({ timer }) {
  const {
    state,
    now,
    setFocusMin,
    startPomodoro,
    pausePomodoro,
    stopPomodoro,
    skipBreak,
  } = timer;
  // 시작/계속/휴식 시작을 누르면 어두운 집중 화면으로 크게 보여줘요
  const startAndFocus = () => {
    startPomodoro();
    router.push("/focus");
  };
  const { pomo } = state;
  const remaining = pomoRemainingMs(pomo, now);
  const progress = 1 - remaining / pomoDurationMs(pomo);
  const isFocus = pomo.phase === "focus";
  const breakReady = !isFocus && pomo.status === "idle";
  const count = todayCount(state, now);

  function confirmStop() {
    if (!isFocus) return stopPomodoro(); // 휴식 중엔 바로 끝내기
    const elapsed = Math.floor((pomoDurationMs(pomo) - remaining) / 60000);
    Alert.alert(
      "집중을 그만할까요?",
      elapsed > 0
        ? `지금까지 집중한 ${elapsed}분은 공부 시간에 기록돼요.`
        : "1분 미만이라 기록되지 않아요.",
      [
        { text: "계속하기", style: "cancel" },
        { text: "그만하기", style: "destructive", onPress: stopPomodoro },
      ],
    );
  }

  return (
    <Card style={{ gap: spacing.lg }}>
      <View style={{ alignItems: "center", gap: spacing.xs }}>
        <AppText style={[styles.phase, !isFocus && { color: colors.study }]}>
          {isFocus ? "집중" : breakReady ? "집중 완료! 🎉" : "휴식"}
        </AppText>
        <AppText
          style={styles.clock}
          accessibilityLabel={`남은 시간 ${formatClock(remaining)}`}
        >
          {formatClock(remaining)}
        </AppText>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(100, progress * 100)}%` },
            !isFocus && { backgroundColor: colors.study },
          ]}
        />
      </View>

      {/* 집중 시간 고르기: 시작 전에만 */}
      {isFocus && pomo.status === "idle" && (
        <View style={styles.chips}>
          {FOCUS_OPTIONS.map((m) => (
            <Chip
              key={m}
              label={`${m}분`}
              selected={pomo.focusMin === m}
              onPress={() => setFocusMin(m)}
            />
          ))}
        </View>
      )}

      {breakReady && (
        <AppText variant="caption" style={{ textAlign: "center" }}>
          {pomo.focusMin}분 집중했어요. {BREAK_MIN}분 쉬어 갈까요?
        </AppText>
      )}

      <View style={styles.buttons}>
        {pomo.status === "idle" && isFocus && (
          <Button title="집중 시작" onPress={startAndFocus} />
        )}
        {breakReady && (
          <>
            <Button
              title={`휴식 ${BREAK_MIN}분 시작`}
              onPress={startAndFocus}
            />
            <Button title="건너뛰기" variant="secondary" onPress={skipBreak} />
          </>
        )}
        {(pomo.status === "running" || pomo.status === "paused") && (
          <Button
            title="🌙 집중 화면으로 보기"
            variant="secondary"
            onPress={() => router.push("/focus")}
          />
        )}
        {pomo.status === "running" && (
          <>
            <Button
              title="일시정지"
              variant="secondary"
              onPress={pausePomodoro}
            />
            <Button
              title={isFocus ? "그만하기" : "휴식 끝내기"}
              variant="danger"
              onPress={confirmStop}
            />
          </>
        )}
        {pomo.status === "paused" && (
          <>
            <Button title="계속하기" onPress={startAndFocus} />
            <Button
              title={isFocus ? "그만하기" : "휴식 끝내기"}
              variant="danger"
              onPress={confirmStop}
            />
          </>
        )}
      </View>

      <AppText variant="caption" style={{ textAlign: "center" }}>
        오늘 완료한 집중 {count}회
      </AppText>
    </Card>
  );
}

function Stopwatch({ timer }) {
  const { state, now, startStopwatch, pauseStopwatch, finishStopwatch } = timer;
  const { sw } = state;
  const elapsed = swElapsedMs(sw, now);

  function confirmFinish() {
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) {
      Alert.alert("1분 미만은 기록되지 않아요", "그래도 끝낼까요?", [
        { text: "계속하기", style: "cancel" },
        { text: "끝내기", style: "destructive", onPress: finishStopwatch },
      ]);
      return;
    }
    finishStopwatch();
  }

  return (
    <Card style={{ gap: spacing.lg }}>
      <View style={{ alignItems: "center", gap: spacing.xs }}>
        <AppText style={styles.phase}>
          {sw.status === "running"
            ? "측정 중"
            : sw.status === "paused"
              ? "일시정지"
              : "공부 시간 재기"}
        </AppText>
        <AppText
          style={styles.clock}
          accessibilityLabel={`잰 시간 ${formatClock(elapsed, "down")}`}
        >
          {formatClock(elapsed, "down")}
        </AppText>
      </View>

      <View style={styles.buttons}>
        {sw.status === "idle" && (
          <Button title="시작" onPress={startStopwatch} />
        )}
        {sw.status === "running" && (
          <>
            <Button
              title="일시정지"
              variant="secondary"
              onPress={pauseStopwatch}
            />
            <Button title="끝내고 기록" onPress={confirmFinish} />
          </>
        )}
        {sw.status === "paused" && (
          <>
            <Button
              title="계속하기"
              variant="secondary"
              onPress={startStopwatch}
            />
            <Button title="끝내고 기록" onPress={confirmFinish} />
          </>
        )}
      </View>

      <AppText variant="caption" style={{ textAlign: "center" }}>
        끝내면 잰 시간(분 단위, 내림)이 오늘 공부 시간에 더해져요.
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  modeRow: { flexDirection: "row", gap: spacing.sm },
  phase: { fontSize: 15, fontWeight: "600", color: colors.primary600 },
  // tabular-nums: 숫자 폭을 같게 해서 1초마다 글자가 흔들리지 않게
  clock: {
    fontSize: 64,
    fontWeight: "700",
    color: colors.gray900,
    fontVariant: ["tabular-nums"],
    lineHeight: 76,
  },
  track: {
    height: 8,
    backgroundColor: colors.gray100,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary500,
    borderRadius: radius.full,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  buttons: { gap: spacing.sm },
  notice: {
    backgroundColor: colors.primary50,
    borderRadius: radius.control,
    padding: spacing.md,
  },
  noticeText: {
    fontSize: 14,
    color: colors.primary700,
    textAlign: "center",
    fontWeight: "500",
  },
});
