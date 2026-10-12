import AppText from "@/components/ui/AppText";
import Chip from "@/components/ui/Chip";
import { colors, radius, spacing } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { formatMinutes } from "./logForm";

const QUICK_ADD = [
  { label: "+10분", add: 10 },
  { label: "+30분", add: 30 },
  { label: "+1시간", add: 60 },
];

// 분 단위 입력칸 + 빠른 입력 버튼
// value는 문자열: '' = 미입력, '0' = 안 했음
export default function MinutesField({ label, value, onChange, error }) {
  const num = /^\d+$/.test(value) ? Number(value) : null;
  const isEmpty = value === "";

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.row}>
        <AppText style={styles.label}>{label}</AppText>
        <AppText variant="caption">
          {isEmpty ? "미입력" : num != null ? formatMinutes(num) : ""}
        </AppText>
      </View>

      <View style={[styles.inputWrap, error && { borderColor: colors.error }]}>
        <TextInput
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))} // 숫자만
          placeholder="비워두면 미입력"
          placeholderTextColor={colors.gray500}
          keyboardType="number-pad"
          maxLength={4}
          style={styles.input}
        />
        <AppText variant="caption">분</AppText>
        {!isEmpty && (
          <Pressable
            onPress={() => onChange("")}
            hitSlop={10}
            accessibilityLabel={`${label} 지우기`}
          >
            <Ionicons name="close-circle" size={20} color={colors.gray300} />
          </Pressable>
        )}
      </View>
      {error && <AppText style={styles.error}>{error}</AppText>}

      <View style={styles.chips}>
        <Chip
          label="안 했어요"
          selected={value === "0"}
          onPress={() => onChange("0")}
        />
        {QUICK_ADD.map(({ label: l, add }) => (
          <Chip
            key={l}
            label={l}
            onPress={() => onChange(String(Math.min(1440, (num ?? 0) + add)))}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 14, fontWeight: "600", color: colors.gray600 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 50,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radius.control,
    backgroundColor: colors.white,
  },
  input: { flex: 1, fontSize: 16, color: colors.gray900, height: "100%" },
  error: { fontSize: 13, color: colors.error },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
