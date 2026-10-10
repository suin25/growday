import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '@/theme/tokens'

// 하단 탭 4개. 파일 이름(name)이 곧 화면이에요:
// index.jsx → 홈, log.jsx → 기록, goals.jsx → 목표, report.jsx → 리포트
const tabs = [
  { name: 'index', title: '홈', icon: 'home' },
  { name: 'log', title: '기록', icon: 'create' },
  { name: 'goals', title: '목표', icon: 'flag' },
  { name: 'report', title: '리포트', icon: 'bar-chart' },
]

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // 각 화면이 자기 제목을 직접 그려요
        tabBarActiveTintColor: colors.primary600,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: { borderTopColor: colors.gray200 },
      }}
    >
      {tabs.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            // 선택된 탭은 꽉 찬 아이콘, 나머지는 테두리 아이콘
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? icon : `${icon}-outline`} size={24} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
