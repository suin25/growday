import { StyleSheet, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors, radius, spacing } from '@/theme/tokens'
import AppText from './AppText'

// 데이터가 없을 때 빈 화면 대신 다음 행동을 안내해요.
export default function EmptyState({ icon, title, description, action }) {
  return (
    <View style={styles.wrap}>
      {icon && (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={24} color={colors.gray500} />
        </View>
      )}
      <AppText variant="heading" style={styles.center}>{title}</AppText>
      {description && (
        <AppText variant="caption" style={[styles.center, styles.desc]}>{description}</AppText>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  iconCircle: {
    backgroundColor: colors.gray100,
    borderRadius: radius.full,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  center: { textAlign: 'center' },
  desc: { marginTop: spacing.xs },
  action: { marginTop: spacing.xl },
})
