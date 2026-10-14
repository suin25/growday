// 디자인 토큰: 앱 전체에서 쓰는 색, 간격, 모서리, 글자 크기를 한 곳에 모아둔 파일.
// 화면에서 '#039855' 같은 값을 직접 쓰지 말고 colors.primary600처럼 여기서 가져다 써요.
// 나중에 색을 바꾸고 싶으면 이 파일만 고치면 앱 전체가 바뀌어요.

export const colors = {
  // Primary: 성장 느낌의 green
  primary50: "#ECFDF3",
  primary100: "#D1FADF",
  primary500: "#12B76A",
  primary600: "#039855",
  primary700: "#027A48",

  // 중립 (화면의 대부분)
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F2F4F7",
  gray200: "#EAECF0",
  gray300: "#D0D5DD",
  gray500: "#667085",
  gray600: "#475467",
  gray900: "#101828",

  // 카테고리 (칩, 점 정도로만)
  study: "#2E90FA",
  exercise: "#F79009",
  habit: "#7A5AF8",
  etc: "#98A2B3",

  // 시스템 오류에만 사용 (목표 미달성에는 쓰지 않음!)
  error: "#D92D20",
};

// 집중 화면(뽀모도로 전체 화면) 전용 어두운 색
// 눈부심을 줄이려고 순수 검정 대신 아주 어두운 초록빛 회색을 써요
export const focusColors = {
  bg: "#0B1210",
  text: "#E6F2EC",
  dim: "#7A8C85",
  track: "#22302B",
  accent: "#32D583", // primary 계열을 어두운 배경에서 잘 보이게 밝힌 색
  break: "#53B1FD", // 휴식(study 파랑 계열)
};

// 4의 배수 간격
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  control: 12, // 버튼, 입력창
  card: 16,
  full: 999, // 동그라미
};

// RN에는 CSS가 없어서 글자 스타일을 객체로 정의해요.
export const typography = {
  title: { fontSize: 26, fontWeight: "700", color: colors.gray900 },
  heading: { fontSize: 17, fontWeight: "600", color: colors.gray900 },
  body: { fontSize: 15, fontWeight: "400", color: colors.gray900 },
  caption: { fontSize: 13, fontWeight: "400", color: colors.gray500 },
  number: { fontSize: 32, fontWeight: "700", color: colors.gray900 },
};
