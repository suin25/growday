// 기능 스위치 (.env에서 켜고 끄기)
// AI 코치: 'true'일 때만 화면에 보이고 서버를 불러요. 기본은 꺼짐.
// ⚠️ Gemini 무료 티어에는 실제 개인 기록을 보내면 안 돼요 (약관). 테스트 계정 + 가짜 데이터로만 켜세요.
export const AI_ENABLED = process.env.EXPO_PUBLIC_AI_ENABLED === "true";
