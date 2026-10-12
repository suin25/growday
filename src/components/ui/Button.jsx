import { colors, radius, spacing } from "@/theme/tokens";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import AppText from "./AppText";

// 웹의 <button> 대신 RN에서는 <Pressable>을 써요.
// style에 함수를 주면 pressed(눌린 상태)를 받아서 눌렸을 때 스타일을 바꿀 수 있어요.
// loading: true면 글자 대신 빙글빙글 표시 + 중복 클릭 방지
export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
}) {
  const v = variants[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      // VoiceOver(화면 읽기)가 "버튼"이라고 읽어주고, 비활성 상태도 알려줘요
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        size === "sm" ? styles.sm : styles.md,
        v.container,
        pressed && v.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.label.color} />
      ) : (
        <AppText style={[styles.label, v.label]}>{title}</AppText>
      )}
    </Pressable>
  );
}

const variants = {
  primary: {
    container: { backgroundColor: colors.primary600 },
    pressed: { backgroundColor: colors.primary700 },
    label: { color: colors.white },
  },
  danger: {
    container: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.gray300,
    },
    pressed: { backgroundColor: colors.gray50 },
    label: { color: colors.error },
  },
  secondary: {
    container: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.gray300,
    },
    pressed: { backgroundColor: colors.gray50 },
    label: { color: colors.gray900 },
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.control,
    alignItems: "center",
    justifyContent: "center",
  },
  md: { height: 48, paddingHorizontal: spacing.xl },
  sm: { height: 38, paddingHorizontal: spacing.lg },
  label: { fontSize: 15, fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
