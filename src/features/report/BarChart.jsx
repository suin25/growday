import AppText from "@/components/ui/AppText";
import { WEEKDAY_LABELS, formatShortDate, parseDateString } from "@/lib/date";
import { colors, spacing } from "@/theme/tokens";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const HEIGHT = 120;
const BAR_WIDTH = 22;

// 7일 막대 차트 (라이브러리 없이 View로 직접 그려요)
// data: [{ date, value(숫자 | null), future }]
//   value null  → 막대 없이 "–" (미입력)
//   value 0     → 바닥에 얇은 선 (실제로 0)
// 막대를 누르면 위에 그날 값이 나와요.
export default function BarChart({
  data,
  color,
  max,
  formatValue,
  today,
  emptyLabel = "미입력",
}) {
  const [selected, setSelected] = useState(null);
  const top = max ?? Math.max(1, ...data.map((d) => d.value ?? 0));
  const sel = data.find((d) => d.date === selected);

  return (
    <View style={{ gap: spacing.sm }}>
      {/* 선택한 날 값 (안내 문구 자리) */}
      <AppText variant="caption" style={styles.readout}>
        {sel
          ? `${formatShortDate(sel.date)} · ${sel.future ? "아직이에요" : sel.value == null ? emptyLabel : formatValue(sel.value)}`
          : "막대를 누르면 그날 값을 볼 수 있어요"}
      </AppText>

      <View style={styles.plot}>
        {data.map((d) => {
          const h = d.value ? Math.max(4, (d.value / top) * HEIGHT) : 0;
          const isSel = d.date === selected;
          return (
            <Pressable
              key={d.date}
              style={styles.col}
              onPress={() => setSelected(isSel ? null : d.date)}
              accessibilityLabel={`${formatShortDate(d.date)} ${d.value == null ? emptyLabel : formatValue(d.value)}`}
            >
              <View style={styles.barArea}>
                {d.future ? null : d.value == null ? (
                  <AppText style={styles.dash}>–</AppText>
                ) : d.value === 0 ? (
                  <View style={[styles.zero, { backgroundColor: color }]} />
                ) : (
                  <View
                    style={[
                      styles.bar,
                      { height: h, backgroundColor: color },
                      selected && !isSel && { opacity: 0.35 }, // 선택한 막대만 또렷하게
                    ]}
                  />
                )}
              </View>
              <AppText
                style={[
                  styles.label,
                  d.date === today && styles.today,
                  d.future && styles.futureLabel,
                ]}
              >
                {d.date === today
                  ? "오늘"
                  : WEEKDAY_LABELS[parseDateString(d.date).getDay()]}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  readout: { minHeight: 18 },
  plot: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: { flex: 1, alignItems: "center", gap: spacing.xs },
  barArea: {
    height: HEIGHT,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200, // 바닥선 (얇고 연하게)
  },
  // 위쪽만 둥글게, 바닥은 각지게
  bar: { width: BAR_WIDTH, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  zero: { width: BAR_WIDTH, height: 2 },
  dash: { fontSize: 14, color: colors.gray300, marginBottom: 2 },
  label: { fontSize: 11, color: colors.gray500 },
  today: { color: colors.gray900, fontWeight: "600" },
  futureLabel: { color: colors.gray300 },
});
