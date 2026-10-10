import { View } from 'react-native'
import { Stack, router } from 'expo-router'
import AppText from '@/components/ui/AppText'
import Button from '@/components/ui/Button'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '앗!' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <AppText variant="heading">화면을 찾을 수 없어요</AppText>
        <Button title="홈으로 가기" variant="secondary" onPress={() => router.replace('/')} />
      </View>
    </>
  )
}
