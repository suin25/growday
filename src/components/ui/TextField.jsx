import { useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { colors, radius, spacing } from '@/theme/tokens'
import AppText from './AppText'

// 라벨 + 입력창 + 에러 메시지를 묶은 입력 컴포넌트
export default function TextField({ label, error, style, ...inputProps }) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={[styles.wrap, style]}>
      {label && <AppText style={styles.label}>{label}</AppText>}
      <TextInput
        placeholderTextColor={colors.gray500}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused && styles.focused,
          error && styles.errorBorder,
        ]}
        {...inputProps}
      />
      {error && <AppText style={styles.error}>{error}</AppText>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.gray600 },
  input: {
    height: 50,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radius.control,
    fontSize: 16, // iOS는 16 미만이면 입력할 때 화면이 확대될 수 있어요
    color: colors.gray900,
  },
  focused: { borderColor: colors.primary500 },
  errorBorder: { borderColor: colors.error },
  error: { fontSize: 13, color: colors.error },
})
