import { StyleSheet, View } from 'react-native'
import { colors, radius, spacing } from '@/theme/tokens'
import AppText from './AppText'

export default function Card({ style, children }) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function CardTitle({ children }) {
  return (
    <AppText variant="heading" style={styles.title}>
      {children}
    </AppText>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: spacing.xl,
  },
  title: { marginBottom: spacing.lg },
})
