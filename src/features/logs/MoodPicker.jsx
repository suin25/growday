import AppText from "@/components/ui/AppText";
import { colors, radius, spacing } from "@/theme/tokens";
import { Pressable, StyleSheet, View } from "react-native";
import { MOODS } from "./logForm";

// 기분 5단계. 선택된 걸 다시 누르면 선택 해제(= 미입력)
export default function MoodPicker({ value, onChange }) {
  return (
    <View style={styles.row}>
      {MOODS.map((m) => {
        const selected = value === m.value;
        return (
          <Pressable
            key={m.value}
            onPress={() => onChange(selected ? null : m.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={m.label}
            style={({ pressed }) => [
              styles.item,
              selected && styles.selected,
              pressed && { opacity: 0.7 },
            ]}
          >
            <AppText
              style={[styles.emoji, !selected && value != null && styles.dim]}
            >
              {m.emoji}
            </AppText>
            <AppText style={[styles.label, selected && styles.selectedLabel]}>
              {m.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  selected: {
    borderColor: colors.primary600,
    backgroundColor: colors.primary50,
  },
  emoji: { fontSize: 26 },
  dim: { opacity: 0.4 },
  label: { fontSize: 12, color: colors.gray500 },
  selectedLabel: { color: colors.primary700, fontWeight: "600" },
});
