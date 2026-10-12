// AI 코치 Edge Function (Supabase 서버에서 실행돼요)
//
// 흐름: 로그인 확인 → 캐시 확인 → 사용 횟수 제한 → 기록 요약 → Gemini 호출 → 검증 → 저장 → 응답
// Gemini API 키는 여기(서버)에만 있어요. 앱에는 절대 들어가지 않아요.

import { withSupabase } from "npm:@supabase/server@1.9.1";
import {
  RESPONSE_SCHEMAS,
  SYSTEM_PROMPT,
  addDays,
  buildSummary,
  buildUserPrompt,
  emptyFeedback,
  hasEnoughData,
  isDateString,
  parseModelOutput,
  startOfWeek,
} from "./coach.js";

const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.5-flash-lite";
const DAILY_LIMIT = 10; // 한 사람이 24시간 동안 AI를 부를 수 있는 횟수

const fail = (status: number, message: string) =>
  Response.json({ error: message }, { status });

export default {
  // auth: 'user' → 로그인한 사용자의 요청만 통과. 아니면 함수가 실행되지도 않아요.
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") return fail(405, "잘못된 요청이에요.");

    const userId = ctx.userClaims!.id;
    const body = await req.json().catch(() => ({}));
    const { today, tzOffset = -540, regenerate = false } = body;
    const type: "daily" | "weekly" = body.type;

    // ---- 1. 입력 검사 (앱에서 온 값도 믿지 않아요) ----
    if (type !== "daily" && type !== "weekly")
      return fail(400, "잘못된 요청이에요.");
    if (!isDateString(today)) return fail(400, "날짜 형식이 올바르지 않아요.");
    if (!Number.isInteger(tzOffset) || Math.abs(tzOffset) > 14 * 60)
      return fail(400, "시간대가 올바르지 않아요.");
    // 주간 피드백은 body.weekStart(월요일)를 받고, 없으면 이번 주
    const target =
      type === "daily"
        ? today
        : isDateString(body.weekStart)
          ? startOfWeek(body.weekStart)
          : startOfWeek(today);
    if (target > today) return fail(400, "미래 날짜는 볼 수 없어요.");

    // ---- 2. 캐시: 이미 만든 피드백이 있으면 그대로 돌려줘요 (API 비용 0) ----
    const { data: cached } = await ctx.supabase
      .from("ai_feedbacks")
      .select("type, target_date, content, created_at")
      .eq("type", type)
      .eq("target_date", target)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (cached && !regenerate)
      return Response.json({ feedback: cached, cached: true });

    // ---- 3. 사용 횟수 제한 (남용 방지) ----
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await ctx.supabase
      .from("ai_feedbacks")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);
    if ((count ?? 0) >= DAILY_LIMIT) {
      return fail(
        429,
        `AI 추천은 하루 ${DAILY_LIMIT}번까지 받을 수 있어요. 내일 다시 시도해 주세요.`,
      );
    }

    // ---- 4. 기록 모으기 (ctx.supabase는 RLS가 적용돼서 내 데이터만 보여요) ----
    const from = type === "daily" ? addDays(today, -7) : addDays(target, -7); // 주간은 지난주 비교용으로 2주
    const to =
      type === "daily"
        ? addDays(today, -1)
        : [addDays(target, 6), today].sort()[0];
    const [goalsRes, checksRes, logsRes] = await Promise.all([
      ctx.supabase
        .from("goals")
        .select("id, title, category, repeat_days, archived_at, created_at"),
      ctx.supabase
        .from("goal_checks")
        .select("goal_id, date")
        .gte("date", from)
        .lte("date", today),
      ctx.supabase
        .from("daily_logs")
        .select("date, study_minutes, exercise_type, exercise_minutes, mood") // 메모는 안 가져와요
        .gte("date", from)
        .lte("date", today),
    ]);
    if (goalsRes.error || checksRes.error || logsRes.error)
      return fail(500, "기록을 불러오지 못했어요.");
    const data = {
      goals: goalsRes.data,
      checks: checksRes.data,
      logs: logsRes.data,
      tz: tzOffset,
    };

    let summary, extra;
    if (type === "daily") {
      summary = buildSummary({ ...data, from, to });
      const todayInfo = buildSummary({ ...data, from: today, to: today });
      extra = {
        today,
        오늘예정목표: todayInfo.목표
          .filter((g: { 예정: number }) => g.예정 > 0)
          .map((g: { 이름: string; 완료: number }) => ({
            이름: g.이름,
            완료: g.완료 > 0,
          })),
      };
    } else {
      summary = buildSummary({ ...data, from: target, to });
      const prev = buildSummary({
        ...data,
        from: addDays(target, -7),
        to: addDays(target, -1),
      });
      extra = { 지난주합계: prev.합계 };
    }

    // ---- 5. 기록이 하나도 없으면 AI 대신 기본 안내 (저장하지 않음) ----
    if (!hasEnoughData(summary)) {
      return Response.json({
        feedback: {
          type,
          target_date: target,
          content: emptyFeedback(type),
          created_at: new Date().toISOString(),
        },
        cached: false,
        empty: true,
      });
    }

    // ---- 6. Gemini 호출 ----
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return fail(500, "AI 설정이 아직 안 됐어요.");

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [{ text: buildUserPrompt(type, summary, extra) }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMAS[type],
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      },
    );
    if (geminiRes.status === 429)
      return fail(503, "AI 사용량이 많아요. 잠시 후 다시 시도해 주세요.");
    if (!geminiRes.ok) {
      console.error("Gemini error", geminiRes.status, await geminiRes.text());
      return fail(502, "AI가 응답하지 않아요. 잠시 후 다시 시도해 주세요.");
    }
    const json = await geminiRes.json();
    const text = json?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("");
    const content = parseModelOutput(type, text);
    if (!content) {
      console.error("Bad model output", text);
      return fail(502, "AI 답변을 이해하지 못했어요. 다시 시도해 주세요.");
    }

    // ---- 7. 저장 (앱은 이 표에 쓸 권한이 없어서, 서버의 관리자 클라이언트로 저장) ----
    const { data: saved, error } = await ctx.supabaseAdmin
      .from("ai_feedbacks")
      .insert({ user_id: userId, type, target_date: target, content })
      .select("type, target_date, content, created_at")
      .single();
    if (error) return fail(500, "저장하지 못했어요.");

    return Response.json({ feedback: saved, cached: false });
  }),
};
