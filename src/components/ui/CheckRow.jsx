import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing } from "@/theme/tokens";
import AppText from "./AppText";

// 체크박스 + 문구 한 줄 (예: "만 14세 이상입니다")
export default function CheckRow({ checked, onChange, label, error }) {
  return (
    <View style={{ gap: 4 }}>
      <Pressable
        onPress={() => onChange(!checked)}
        style={styles.row}
        hitSlop={6}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
      >
        <Ionicons
          name={checked ? "checkbox" : "square-outline"}
          size={22}
          color={
            checked ? colors.primary600 : error ? colors.error : colors.gray500
          }
        />
        <AppText style={styles.label}>{label}</AppText>
      </Pressable>
      {error && <AppText style={styles.error}>{error}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: { fontSize: 14, color: colors.gray900, flexShrink: 1 },
  error: { fontSize: 13, color: colors.error },
});
