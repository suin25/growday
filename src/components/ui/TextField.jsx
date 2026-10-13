import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, radius, spacing } from "@/theme/tokens";
import AppText from "./AppText";

// 라벨 + 입력창 + 에러 메시지를 묶은 입력 컴포넌트
// - onFocus/onBlur를 따로 받아서, 포커스 표시(초록 테두리)와 바깥에서 넘긴 동작이 둘 다 실행되게 해요
// - secureTextEntry(비밀번호 칸)면 오른쪽에 눈 아이콘이 생겨서 입력한 글자를 볼 수 있어요
export default function TextField({
  label,
  error,
  style,
  onFocus,
  onBlur,
  secureTextEntry,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true); // 비밀번호 가리기 상태

  return (
    <View style={[styles.wrap, style]}>
      {label && <AppText style={styles.label}>{label}</AppText>}
      {/* 테두리는 바깥 상자에 두고, 그 안에 입력칸 + 눈 아이콘을 가로로 배치 */}
      <View
        style={[
          styles.box,
          focused && styles.focused,
          error && styles.errorBorder,
          inputProps.multiline && styles.multilineBox,
        ]}
      >
        <TextInput
          placeholderTextColor={colors.gray500}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          secureTextEntry={secureTextEntry ? hidden : false}
          style={[styles.input, inputProps.multiline && styles.multilineInput]}
          {...inputProps}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "비밀번호 보기" : "비밀번호 숨기기"}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={colors.gray500}
            />
          </Pressable>
        )}
      </View>
      {error && <AppText style={styles.error}>{error}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: colors.gray600 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 50,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radius.control,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16, // iOS는 16 미만이면 입력할 때 화면이 확대될 수 있어요
    color: colors.gray900,
  },
  focused: { borderColor: colors.primary500 },
  errorBorder: { borderColor: colors.error },
  // 여러 줄 입력: 높이를 늘리고 글자를 위쪽부터 시작
  multilineBox: { height: undefined, minHeight: 100, alignItems: "flex-start" },
  multilineInput: {
    height: undefined,
    minHeight: 100,
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: "top",
  },
  error: { fontSize: 13, color: colors.error },
});
