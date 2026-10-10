import Screen from '@/components/ui/Screen'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'

export default function GoalsScreen() {
  return (
    <Screen>
      <PageHeader title="목표" description="매일 또는 원하는 요일에 반복할 목표를 관리해요." />
      <Card>
        <EmptyState icon="flag-outline" title="목표 관리 준비 중" description="6단계에서 구현할 예정이에요." />
      </Card>
    </Screen>
  )
}
