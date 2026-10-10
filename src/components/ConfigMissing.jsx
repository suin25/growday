import { useEffect } from 'react'
import { View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import AppText from '@/components/ui/AppText'
import { spacing } from '@/theme/tokens'

// .env 설정을 빼먹었을 때 하얀 화면 대신 원인을 알려주는 개발용 화면
export default function ConfigMissing() {
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xxl, gap: spacing.md }}>
      <AppText variant="heading">Supabase 설정이 필요해요</AppText>
      <AppText variant="caption">
        프로젝트 폴더의 .env.example을 복사해 .env 파일을 만들고, Supabase URL과 publishable 키를
        넣은 뒤 터미널에서 npx expo start -c 로 다시 실행해 주세요.
      </AppText>
    </View>
  )
}
