import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colors } from '@/theme/tokens'

// 앱의 가장 바깥 레이아웃.
// Stack: 화면이 카드처럼 위로 쌓이는 네비게이션 (설정 화면이 오른쪽에서 밀려 들어옴)
// (tabs): 괄호 폴더는 "그룹"이라 주소에 나타나지 않아요. 하단 탭 4개가 이 안에 있어요.
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.gray900,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.gray50 },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: '설정' }} />
      </Stack>
    </>
  )
}
