import Screen from '@/components/ui/Screen'
import Card from '@/components/ui/Card'
import AppText from '@/components/ui/AppText'

// 상단 헤더(뒤로가기 포함)는 _layout.jsx의 Stack이 그려줘요. 그래서 위쪽 SafeArea는 필요 없어요.
export default function SettingsScreen() {
  return (
    <Screen edges={['bottom']}>
      <Card>
        <AppText variant="caption">
          로그인 기능을 붙이면(5단계) 닉네임 변경과 로그아웃이 여기에 생겨요.
        </AppText>
      </Card>
    </Screen>
  )
}
