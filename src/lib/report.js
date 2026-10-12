// 주간 리포트 계산 (순수 함수)
import { addDays, parseDateString, toDateString } from "./date";
import { isScheduledOn } from "./goals";

// 그 날짜가 속한 주의 월요일 (한국 달력처럼 월요일 시작)
export function startOfWeek(dateStr) {
  const d = parseDateString(dateStr);
  const back = (d.getDay() + 6) % 7; // 월=0, 화=1 ... 일=6
  return toDateString(addDays(d, -back));
}

// 월요일부터 7일
export function weekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) =>
    toDateString(addDays(parseDateString(weekStart), i)),
  );
}

// 휴지통에 들어간 목표도 "들어가기 전 날짜"까지는 통계에 포함해요 (과거 기록 보존)
export function isGoalActiveOn(goal, date) {
  if (goal.archived_at && date >= toDateString(new Date(goal.archived_at)))
    return false;
  return isScheduledOn(goal, date);
}

// checkSet: "goalId|date" 형태의 Set
export function weekGoalStats(goals, checkSet, dates, today) {
  const days = dates.map((date) => {
    const future = date > today;
    const todays = future ? [] : goals.filter((g) => isGoalActiveOn(g, date));
    const done = todays.filter((g) => checkSet.has(`${g.id}|${date}`)).length;
    return {
      date,
      future,
      scheduled: todays.length,
      done,
      // 예정된 목표가 없던 날은 0%가 아니라 null (= 해당 없음)
      rate: todays.length ? Math.round((done / todays.length) * 100) : null,
    };
  });

  const scheduled = days.reduce((s, d) => s + d.scheduled, 0);
  const done = days.reduce((s, d) => s + d.done, 0);

  const perGoal = goals
    .map((goal) => {
      const own = dates.filter((d) => d <= today && isGoalActiveOn(goal, d));
      return {
        goal,
        scheduled: own.length,
        done: own.filter((d) => checkSet.has(`${goal.id}|${d}`)).length,
      };
    })
    .filter((g) => g.scheduled > 0);

  return {
    days,
    scheduled,
    done,
    rate: scheduled ? Math.round((done / scheduled) * 100) : null,
    perGoal,
  };
}

// 기록 한 항목의 일별 값. 기록이 없거나 미입력이면 null, 미래 날짜는 future 표시
export function logSeries(logsByDate, dates, key, today) {
  return dates.map((date) => ({
    date,
    future: date > today,
    value: logsByDate.get(date)?.[key] ?? null,
  }));
}

// null(미입력)은 빼고 합계/평균. recordedDays = 실제로 값을 적은 날 수 (0 포함)
export function summarize(series) {
  const values = series.filter((d) => d.value != null).map((d) => d.value);
  const total = values.reduce((s, v) => s + v, 0);
  return {
    total,
    recordedDays: values.length,
    average: values.length ? Math.round(total / values.length) : null,
  };
}
