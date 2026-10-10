import { Alert, StyleSheet, View } from 'react-native'
import Screen from '@/components/ui/Screen'
import Card from '@/components/ui/Card'
import AppText from '@/components/ui/AppText'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/features/profile/useProfile'
import { colors, spacing } from '@/theme/tokens'

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption">{label}</AppText>
      <AppText style={styles.value} numberOfLines={1}>{value}</AppText>
    </View>
  )
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth()
  const { profile, loading } = useProfile()

  // 실수로 누르는 걸 막기 위해 iOS 기본 확인창(Alert)을 띄워요
  function confirmSignOut() {
    Alert.alert('로그아웃할까요?', '', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: signOut },
    ])
  }

  return (
    <Screen edges={['bottom']}>
      <Card style={{ gap: spacing.md }}>
        <Row label="닉네임" value={loading ? '불러오는 중…' : profile?.nickname || '-'} />
        <View style={styles.divider} />
        <Row label="이메일" value={user?.email} />
      </Card>
      <Button title="로그아웃" variant="danger" onPress={confirmSignOut} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.lg },
  value: { flexShrink: 1, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.gray100 },
})
