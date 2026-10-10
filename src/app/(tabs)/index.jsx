import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import Screen from '@/components/ui/Screen'
import Card, { CardTitle } from '@/components/ui/Card'
import AppText from '@/components/ui/AppText'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { colors, radius, spacing } from '@/theme/tokens'
import { formatKoreanDate, greetingByTime } from '@/lib/date'
import { useProfile } from '@/features/profile/useProfile'

// 아직 데이터가 연결되지 않아서 모든 카드가 "빈 상태"로 보여요. (6단계에서 연결)
export default function HomeScreen() {
  const progress = 0 // 0 ~ 1
  const { profile } = useProfile()
  const name = profile?.nickname ? `${profile.nickname}님, ` : ''

  return (
    <Screen>
      {/* 인사 + 설정 버튼. flexDirection: 'row'로 가로 배치 (RN 기본은 세로!) */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <AppText variant="caption">{formatKoreanDate()}</AppText>
          <AppText variant="title" style={{ marginTop: 4 }}>
            {name}
            {greetingByTime()} 👋
          </AppText>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          hitSlop={12} // 작은 아이콘도 손가락으로 누르기 쉽게 터치 영역을 넓혀요
          accessibilityLabel="설정"
        >
          <Ionicons name="settings-outline" size={24} color={colors.gray600} />
        </Pressable>
      </View>

      <Card>
        <CardTitle>오늘의 달성률</CardTitle>
        <View style={styles.rowBetween}>
          <AppText variant="number">{Math.round(progress * 100)}%</AppText>
          <AppText variant="caption">0 / 0 완료</AppText>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
      </Card>

      <Card>
        <CardTitle>오늘의 목표</CardTitle>
        <EmptyState
          icon="flag-outline"
          title="아직 목표가 없어요"
          description="작은 목표 하나부터 시작해 볼까요?"
          action={<Button title="목표 추가하기" size="sm" onPress={() => router.navigate('/goals')} />}
        />
      </Card>

      <Card style={styles.aiCard}>
        <View style={styles.aiRow}>
          <Ionicons name="sparkles" size={20} color={colors.primary600} />
          <View style={{ flex: 1 }}>
            <AppText style={styles.aiTitle}>오늘의 한 가지</AppText>
            <AppText style={styles.aiBody}>
              며칠 기록이 쌓이면 AI가 오늘 실천할 작은 과제를 추천해 줄게요.
            </AppText>
          </View>
        </View>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  track: {
    height: 8,
    marginTop: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary500, borderRadius: radius.full },
  aiCard: { backgroundColor: colors.primary50, borderColor: colors.primary100 },
  aiRow: { flexDirection: 'row', gap: spacing.md },
  aiTitle: { fontSize: 14, fontWeight: '600', color: colors.primary700 },
  aiBody: { fontSize: 14, color: colors.gray600, marginTop: 4, lineHeight: 20 },
})
