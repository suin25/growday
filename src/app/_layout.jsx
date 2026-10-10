import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import ConfigMissing from '@/components/ConfigMissing'
import { colors } from '@/theme/tokens'

// 로그인 상태를 확인하는 동안 스플래시 화면(앱 로고)을 계속 띄워둬요.
// 안 그러면 로그인 화면이 잠깐 번쩍 보였다가 홈으로 넘어가는 깜빡임이 생겨요.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      {isSupabaseConfigured ? <RootNavigator /> : <ConfigMissing />}
    </AuthProvider>
  )
}

function RootNavigator() {
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync()
  }, [loading])

  if (loading) return null

  const isLoggedIn = Boolean(session)

  // Stack.Protected: guard가 false인 화면 그룹은 아예 접근할 수 없어요.
  // 로그인 상태가 바뀌면 Expo Router가 알아서 맞는 화면으로 보내줘요.
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.gray900,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.gray50 },
      }}
    >
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: '설정' }} />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  )
}
