import { View } from 'react-native'
import AppText from './AppText'

export default function PageHeader({ title, description }) {
  return (
    <View style={{ gap: 4 }}>
      <AppText variant="title">{title}</AppText>
      {description && <AppText variant="caption">{description}</AppText>}
    </View>
  )
}
