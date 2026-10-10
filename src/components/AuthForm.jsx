import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import AppText from '@/components/ui/AppText'
import { colors, spacing } from '@/theme/tokens'

// 로그인/회원가입 화면이 공유하는 틀.
// KeyboardAvoidingView: 키보드가 올라올 때 입력창이 가려지지 않게 화면을 밀어 올려요.
// keyboardShouldPersistTaps="handled": 키보드가 떠 있어도 버튼이 한 번에 눌리게 해요.
export default function AuthForm({ title, subtitle, children, footer }) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Ionicons name="leaf" size={32} color={colors.primary600} />
            <AppText variant="title">{title}</AppText>
            {subtitle && <AppText variant="caption">{subtitle}</AppText>}
          </View>
          <View style={styles.form}>{children}</View>
          {footer && <View style={styles.footer}>{footer}</View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xxl, gap: spacing.xxxl },
  brand: { gap: spacing.sm },
  form: { gap: spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
})
