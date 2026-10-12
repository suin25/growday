import { colors, radius, spacing } from "@/theme/tokens";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "./AppText";

// 선택 가능한 작은 버튼 (카테고리, 요일 선택 등)
// dotColor를 주면 앞에 색깔 점이 붙어요
export default function Chip({ label, selected, onPress, dotColor, style }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      {dotColor && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
      <AppText style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  selected: {
    borderColor: colors.primary600,
    backgroundColor: colors.primary50,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 14, color: colors.gray600, fontWeight: "500" },
  selectedLabel: { color: colors.primary700, fontWeight: "600" },
});
