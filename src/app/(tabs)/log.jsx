import Screen from '@/components/ui/Screen'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'

export default function LogScreen() {
  return (
    <Screen>
      <PageHeader title="기록" description="모든 항목은 선택이에요. 기억나는 것만 적어도 충분해요." />
      <Card>
        <EmptyState icon="create-outline" title="기록 기능 준비 중" description="7단계에서 구현할 예정이에요." />
      </Card>
    </Screen>
  )
}
