// 날짜는 항상 "기기의 로컬 시간" 기준 YYYY-MM-DD 문자열로 다뤄요.
// new Date().toISOString()은 UTC 기준이라 한국 시간 새벽에는 전날 날짜가 나와요!

export function toDateString(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 예: "10월 10일 토요일"
// (Intl 날짜 포맷은 기기 환경마다 결과가 다를 수 있어서 직접 만들어요)
export function formatKoreanDate(date = new Date()) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`
}

export function greetingByTime(date = new Date()) {
  const h = date.getHours()
  if (h < 6) return '늦은 밤이에요'
  if (h < 12) return '좋은 아침이에요'
  if (h < 18) return '좋은 오후예요'
  return '오늘 하루도 수고했어요'
}
