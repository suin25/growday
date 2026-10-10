import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '@/theme/tokens'

// 모든 화면의 바깥 틀.
// SafeAreaView: 아이폰 노치(위)와 홈바(아래)에 내용이 가려지지 않게 여백을 자동으로 넣어줘요.
// edges={['top']}: 아래쪽은 탭 바가 이미 처리해주니까 위쪽만 신경 써요.
export default function Screen({ children, edges = ['top'] }) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
})
