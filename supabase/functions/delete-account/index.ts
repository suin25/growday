// 계정 삭제 Edge Function
// 로그인한 본인 계정만 삭제할 수 있어요. (다른 사람 id를 보내도 무시하고 토큰의 id만 써요)
// auth.users에서 지우면, DB 테이블들이 "on delete cascade"로 묶여 있어서
// profiles / goals / goal_checks / daily_logs / ai_feedbacks 가 전부 함께 지워져요.
import { withSupabase } from "npm:@supabase/server@1.9.1";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST")
      return Response.json({ error: "잘못된 요청이에요." }, { status: 405 });

    const userId = ctx.userClaims!.id;
    // 계정 삭제는 관리자 권한이 필요해서 supabaseAdmin을 써요 (서버에서만 가능)
    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("deleteUser failed", error);
      return Response.json(
        { error: "계정을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요." },
        { status: 500 },
      );
    }
    return Response.json({ ok: true });
  }),
};
