import AppText from "@/components/ui/AppText";
import { CATEGORIES } from "@/lib/goals";
import { colors, radius, spacing } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

// 홈 화면의 "오늘 목표" 한 줄. 줄 전체를 눌러서 체크/해제해요.
export default function GoalCheckItem({ goal, done, onToggle }) {
  const category = CATEGORIES[goal.category];
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      style={({ pressed }) => [
        styles.row,
        done && styles.rowDone,
        pressed && { opacity: 0.6 },
      ]}
    >
      <Ionicons
        name={done ? "checkmark-circle" : "ellipse-outline"}
        size={28}
        color={done ? colors.primary500 : colors.gray300}
      />
      <View style={{ flex: 1 }}>
        <AppText
          style={[styles.title, done && styles.titleDone]}
          numberOfLines={2}
        >
          {goal.title}
        </AppText>
        <View style={styles.meta}>
          <View style={[styles.dot, { backgroundColor: category.color }]} />
          <AppText variant="caption">{category.label}</AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.gray50,
  },
  rowDone: { backgroundColor: colors.primary50 },
  title: { fontSize: 16, fontWeight: "500" },
  titleDone: { color: colors.gray500 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
