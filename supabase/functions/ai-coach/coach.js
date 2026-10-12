// AI 코치의 "순수 로직": 데이터 요약, 프롬프트, 응답 검증.
// 서버(Deno)에서 돌지만, 외부 의존성이 없어서 따로 테스트할 수 있어요.
//
// 날짜 주의: 서버 시계는 UTC라서 "오늘"을 서버가 정하지 않아요.
// 앱이 보내준 로컬 날짜 문자열(YYYY-MM-DD)과 시간대 오프셋을 기준으로 계산해요.

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const CATEGORY_LABEL = {
  study: "공부",
  exercise: "운동",
  habit: "생활 습관",
  etc: "기타",
};

export const isDateString = (s) =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

// 날짜 문자열 계산은 전부 UTC 자정 기준으로 해서 서버 시간대 영향을 없애요
const toUTC = (s) => Date.parse(`${s}T00:00:00Z`);
const fromUTC = (ms) => new Date(ms).toISOString().slice(0, 10);
export const addDays = (s, n) => fromUTC(toUTC(s) + n * DAY_MS);
export const weekdayOf = (s) => new Date(toUTC(s)).getUTCDay();
export const datesBetween = (from, to) => {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
};
export const startOfWeek = (s) => addDays(s, -((weekdayOf(s) + 6) % 7));

// 서버에 저장된 UTC 시각 → 사용자 로컬 날짜
// tzOffsetMinutes: 앱의 new Date().getTimezoneOffset() (한국은 -540)
export const localDateOf = (iso, tzOffsetMinutes) =>
  fromUTC(Date.parse(iso) - tzOffsetMinutes * 60 * 1000);

function isActiveOn(goal, date, tz) {
  if (date < localDateOf(goal.created_at, tz)) return false;
  if (goal.archived_at && date >= localDateOf(goal.archived_at, tz))
    return false;
  const days = goal.repeat_days ?? [];
  return days.length === 0 || days.includes(weekdayOf(date));
}

const describeRepeat = (days = []) =>
  days.length === 0 || days.length === 7
    ? "매일"
    : [1, 2, 3, 4, 5, 6, 0]
        .filter((d) => days.includes(d))
        .map((d) => WEEKDAYS[d])
        .join("·");

// 기간 안의 기록을 AI에게 보낼 "숫자 위주 요약"으로 만들어요.
// 메모(memo)와 공부 내용(study_note)은 보내지 않아요. (개인정보 보호)
export function buildSummary({ goals, checks, logs, from, to, tz }) {
  const dates = datesBetween(from, to);
  const checkSet = new Set(checks.map((c) => `${c.goal_id}|${c.date}`));
  const logByDate = new Map(logs.map((l) => [l.date, l]));

  const goalStats = goals
    .map((g) => {
      const scheduled = dates.filter((d) => isActiveOn(g, d, tz));
      const done = scheduled.filter((d) => checkSet.has(`${g.id}|${d}`));
      return {
        이름: g.title,
        카테고리: CATEGORY_LABEL[g.category] ?? "기타",
        반복: describeRepeat(g.repeat_days),
        상태: g.archived_at ? "휴지통" : "진행 중",
        예정: scheduled.length,
        완료: done.length,
      };
    })
    .filter((g) => g.예정 > 0 || g.상태 === "진행 중");

  // 일별 값: null = 기록 안 함, 0 = 실제로 0
  const daily = dates.map((d) => {
    const l = logByDate.get(d);
    return {
      날짜: `${d} (${WEEKDAYS[weekdayOf(d)]})`,
      공부분: l?.study_minutes ?? null,
      운동분: l?.exercise_minutes ?? null,
      운동종류: l?.exercise_type ?? null,
      기분: l?.mood ?? null, // 1(힘듦) ~ 5(최고)
    };
  });

  const sum = (key) => {
    const v = daily.map((x) => x[key]).filter((x) => x != null);
    return { 기록한날: v.length, 합계: v.reduce((a, b) => a + b, 0) };
  };

  return {
    기간: `${from} ~ ${to}`,
    목표: goalStats,
    일별기록: daily,
    합계: { 공부분: sum("공부분"), 운동분: sum("운동분") },
  };
}

// 기록이 아예 없으면 AI를 부르지 않고 안내 문구를 돌려줘요 (무료 한도 절약)
export function hasEnoughData(summary) {
  const anyGoal = summary.목표.some((g) => g.예정 > 0);
  const anyLog = summary.일별기록.some(
    (d) => d.공부분 != null || d.운동분 != null || d.기분 != null,
  );
  return anyGoal || anyLog;
}

export const SYSTEM_PROMPT = `너는 자기관리 앱 "GrowDay"의 코치야. 반드시 아래 규칙을 지켜.
1. 주어진 JSON 데이터에 있는 사실만 근거로 말한다. 데이터에 없는 원인·감정·사정을 추측해서 단정하지 않는다. 짐작이 필요하면 질문으로 바꾼다.
2. null은 "기록하지 않음"이고 0은 "실제로 0"이다. 기록하지 않은 날을 "안 한 날"로 해석하지 않는다.
3. 건강·의료·식단·체중에 대한 진단이나 전문적인 조언을 하지 않는다. 운동은 무리 없는 수준으로만 제안한다.
4. 비난하거나 죄책감을 주거나 훈계하지 않는다. 다정하고 담백한 해요체로 쓴다.
5. 제안은 바로 실천할 수 있을 만큼 작고 구체적으로 한다. 달성률이 낮은 목표는 더 작게 쪼개는 쪽으로 제안한다.
6. evidence에는 데이터에서 직접 확인되는 숫자 사실만 짧게 적는다. (예: "최근 7일 중 공부 기록 3일, 합계 4시간")
7. 정해진 JSON 형식으로만 답한다. 영어 문장을 쓰지 않는다.`;

export function buildUserPrompt(type, summary, extra) {
  const task =
    type === "daily"
      ? `아래는 사용자의 최근 7일 기록과 오늘(${extra.today}) 예정된 목표야. 오늘 하루 실천할 작은 과제 딱 1개를 추천해 줘.`
      : `아래는 사용자의 한 주(${summary.기간}) 기록이야. 지난주 합계와 비교 정보도 있어. 한 주를 돌아보는 피드백을 써 줘.`;
  return `${task}\n\n${JSON.stringify({ ...summary, ...extra }, null, 1)}`;
}

// Gemini 응답 형식 (JSON Schema의 일부를 쓰는 Gemini 형식)
export const RESPONSE_SCHEMAS = {
  daily: {
    type: "OBJECT",
    properties: {
      task: { type: "STRING", description: "오늘 실천할 과제 1개. 40자 이내." },
      reason: {
        type: "STRING",
        description: "이 과제를 추천한 이유. 기록을 근거로 2문장 이내.",
      },
      evidence: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "근거가 된 숫자 사실 1~3개",
      },
    },
    required: ["task", "reason", "evidence"],
  },
  weekly: {
    type: "OBJECT",
    properties: {
      summary: { type: "STRING", description: "한 주 요약. 2문장 이내." },
      highlights: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "잘한 점 1~3개",
      },
      suggestion: {
        type: "STRING",
        description: "다음 주에 해볼 작은 계획 1개",
      },
      question: { type: "STRING", description: "스스로 돌아볼 질문 1개" },
      evidence: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "근거가 된 숫자 사실 1~3개",
      },
    },
    required: ["summary", "highlights", "suggestion", "question", "evidence"],
  },
};

// AI 응답을 그대로 믿지 않고, 형식과 길이를 검사해서 정리해요
const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const cleanList = (v, maxItems, maxLen) =>
  (Array.isArray(v) ? v : [])
    .map((x) => clean(x, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);

export function parseModelOutput(type, text) {
  let obj;
  try {
    // 혹시 ```json ... ``` 으로 감싸서 오면 벗겨내요
    obj = JSON.parse(String(text).replace(/^```(json)?\s*|\s*```$/g, ""));
  } catch {
    return null;
  }
  if (type === "daily") {
    const out = {
      task: clean(obj.task, 60),
      reason: clean(obj.reason, 200),
      evidence: cleanList(obj.evidence, 3, 80),
    };
    return out.task && out.reason ? out : null;
  }
  const out = {
    summary: clean(obj.summary, 240),
    highlights: cleanList(obj.highlights, 3, 80),
    suggestion: clean(obj.suggestion, 120),
    question: clean(obj.question, 120),
    evidence: cleanList(obj.evidence, 3, 80),
  };
  return out.summary && out.suggestion && out.question ? out : null;
}

// 기록이 없을 때 보여줄 기본 문구 (AI 호출 없음)
export function emptyFeedback(type) {
  return type === "daily"
    ? {
        task: "오늘 할 작은 목표 하나 정하기",
        reason:
          "아직 기록이 없어서 맞춤 추천을 만들기 어려워요. 며칠만 기록해 주면 그걸 바탕으로 추천해 드릴게요.",
        evidence: [],
      }
    : {
        summary: "이 주에는 기록이 없어서 돌아볼 내용이 아직 없어요.",
        highlights: [],
        suggestion: "이번 주에는 하루 한 번, 30초만 기록해 보기",
        question: "기록하기 가장 편한 시간대는 언제인가요?",
        evidence: [],
      };
}
