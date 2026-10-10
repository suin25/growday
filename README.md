# GrowDay (오늘도 성장 중)

기록하면 AI가 작은 실천 과제를 추천해 주는 자기관리 iOS 앱.

## 실행

```bash
npm install
npx expo start
```

터미널에 뜨는 QR 코드를 아이폰 카메라로 찍으면 Expo Go에서 앱이 열려요.
(맥과 아이폰이 같은 Wi-Fi에 있어야 해요)

## 기술 스택

Expo SDK 57 · React Native · Expo Router · JavaScript · Supabase(예정) · Gemini API(예정)

## 폴더 구조

```
src/
├─ app/                  # 화면 (파일 이름 = 화면 주소)
│  ├─ _layout.jsx        # 루트: Stack 네비게이션
│  ├─ (tabs)/            # 하단 탭 4개 (홈, 기록, 목표, 리포트)
│  └─ settings.jsx
├─ components/ui/        # 재사용 UI 부품 (Button, Card, Screen ...)
├─ theme/tokens.js       # 디자인 토큰 (색, 간격, 모서리, 글자)
└─ lib/date.js           # 날짜 유틸
```

## 진행 상황

- [x] 4단계: Expo 프로젝트, 탭 네비게이션, 디자인 토큰, 공통 UI 컴포넌트
- [ ] 5단계: Supabase 인증 + DB
- [ ] 6단계: 목표 관리 + 홈 대시보드
- [ ] 7단계: 일일 기록
- [ ] 8단계: 리포트(통계)
- [ ] 9단계: AI 코치
- [ ] 10단계: TestFlight + App Store
