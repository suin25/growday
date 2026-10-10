import Screen from '@/components/ui/Screen'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'

export default function ReportScreen() {
  return (
    <Screen>
      <PageHeader title="리포트" description="이번 주 흐름을 확인하고 AI 피드백을 받아요." />
      <Card>
        <EmptyState icon="bar-chart-outline" title="리포트 준비 중" description="8단계에서 구현할 예정이에요." />
      </Card>
    </Screen>
  )
}
