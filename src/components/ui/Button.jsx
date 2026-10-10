import { Pressable, StyleSheet } from 'react-native'
import { colors, radius, spacing } from '@/theme/tokens'
import AppText from './AppText'

// 웹의 <button> 대신 RN에서는 <Pressable>을 써요.
// style에 함수를 주면 pressed(눌린 상태)를 받아서 눌렸을 때 스타일을 바꿀 수 있어요.
export default function Button({ title, onPress, variant = 'primary', size = 'md', disabled }) {
  const v = variants[variant]
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        v.container,
        pressed && v.pressed,
        disabled && styles.disabled,
      ]}
    >
      <AppText style={[styles.label, v.label]}>{title}</AppText>
    </Pressable>
  )
}

const variants = {
  primary: {
    container: { backgroundColor: colors.primary600 },
    pressed: { backgroundColor: colors.primary700 },
    label: { color: colors.white },
  },
  secondary: {
    container: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray300 },
    pressed: { backgroundColor: colors.gray50 },
    label: { color: colors.gray900 },
  },
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.control, alignItems: 'center', justifyContent: 'center' },
  md: { height: 48, paddingHorizontal: spacing.xl },
  sm: { height: 38, paddingHorizontal: spacing.lg },
  label: { fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.5 },
})
