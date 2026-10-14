-- =====================================================================
-- 0002: 타이머가 공부 시간을 "더하기" 위한 함수
-- Supabase 대시보드 → SQL Editor에 통째로 붙여넣고 Run 하면 돼요.
--
-- 왜 함수로 만들까?
--   앱에서 "읽고 → 더하고 → 저장"하면, 그 사이에 다른 곳(기록 탭 등)에서 저장한 값이
--   덮어써질 수 있어요. DB 안에서 한 번에 더하면 그런 일이 없어요.
--
-- 보안
--   security invoker: 호출한 사용자 권한으로 실행 → daily_logs의 RLS("내 행만")가 그대로 적용돼요.
--   set search_path = '': Supabase 보안 권장 사항 (함수 안에서 테이블 이름을 바꿔치기 못 하게)
--   anon(로그인 안 한 사용자)은 호출할 수 없게 막아요.
-- =====================================================================
create function public.add_study_minutes(p_date date, p_minutes int)
returns int
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result int;
begin
  if p_minutes is null or p_minutes < 1 or p_minutes > 1440 then
    raise exception 'p_minutes must be between 1 and 1440';
  end if;

  insert into public.daily_logs (user_id, date, study_minutes)
  values ((select auth.uid()), p_date, p_minutes)
  on conflict (user_id, date) do update
    -- 미입력(null)이면 0으로 보고 더해요. 하루 최대 1440분.
    set study_minutes = least(coalesce(public.daily_logs.study_minutes, 0) + excluded.study_minutes, 1440)
  returning study_minutes into result;

  return result;
end;
$$;

revoke execute on function public.add_study_minutes(date, int) from public, anon;
grant execute on function public.add_study_minutes(date, int) to authenticated;