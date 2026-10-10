import { Text } from 'react-native'
import { typography } from '@/theme/tokens'

// RN에서 글자는 반드시 <Text> 안에 있어야 해요. (<View> 안에 글자를 바로 쓰면 에러!)
// variant로 typography 토큰을 골라 쓰고, style로 추가 스타일을 덮어쓸 수 있어요.
// lineBreakStrategyIOS="hangul-word": iOS에서 한글을 단어 단위로 줄바꿈해요. ("과/제" 처럼 끊기지 않게)
export default function AppText({ variant = 'body', style, ...props }) {
  return <Text lineBreakStrategyIOS="hangul-word" style={[typography[variant], style]} {...props} />
}
