-- =====================================================================
-- GrowDay 초기 스키마
-- Supabase 대시보드 → SQL Editor에 통째로 붙여넣고 Run 하면 돼요.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. profiles: 사용자 정보 (로그인 계정 1개당 1행)
--    auth.users는 Supabase가 관리하는 로그인 테이블이고,
--    우리는 거기에 닉네임 같은 추가 정보만 붙여요.
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null default '' check (char_length(nickname) <= 20),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. goals: 목표
--    repeat_days: 반복 요일 (0=일 ~ 6=토). 비어 있으면 "매일".
--    archived_at: 삭제 대신 "보관". 과거 통계가 깨지지 않게 해요.
-- ---------------------------------------------------------------------
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 50),
  category text not null check (category in ('study', 'exercise', 'habit', 'etc')),
  repeat_days smallint[] not null default '{}'
    check (repeat_days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  archived_at timestamptz,
  created_at timestamptz not null default now()
);
create index goals_user_idx on public.goals (user_id);

-- ---------------------------------------------------------------------
-- 3. goal_checks: 날짜별 목표 완료 체크
--    date는 timestamp가 아니라 "로컬 날짜(YYYY-MM-DD)"로 저장해요.
--    같은 목표를 같은 날 두 번 체크할 수 없게 unique.
-- ---------------------------------------------------------------------
create table public.goal_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  goal_id uuid not null references public.goals (id) on delete cascade,
  date date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (goal_id, date)
);
create index goal_checks_user_date_idx on public.goal_checks (user_id, date);

-- ---------------------------------------------------------------------
-- 4. daily_logs: 하루 기록 (사용자당 하루 1행)
--    모든 항목이 NULL 허용 → NULL = "미입력", 0 = "실제로 0"
-- ---------------------------------------------------------------------
create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  study_minutes int check (study_minutes between 0 and 1440),
  study_note text check (char_length(study_note) <= 500),
  exercise_type text check (char_length(exercise_type) <= 50),
  exercise_minutes int check (exercise_minutes between 0 and 1440),
  mood smallint check (mood between 1 and 5),
  memo text check (char_length(memo) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ---------------------------------------------------------------------
-- 5. ai_feedbacks: AI 응답 캐시 (같은 날 다시 열어도 API를 또 부르지 않게)
--    9단계에서 사용. 쓰기는 서버(Edge Function)만 하므로 앱에는 읽기 권한만 줘요.
-- ---------------------------------------------------------------------
create table public.ai_feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('daily', 'weekly')),
  target_date date not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);
create index ai_feedbacks_user_idx on public.ai_feedbacks (user_id, type, target_date);

-- =====================================================================
-- RLS (Row Level Security): "내 데이터는 나만" 규칙
-- 이게 없으면 앱에 들어있는 공개 키만으로 누구나 전체 DB를 읽을 수 있어요!
-- auth.uid() = 지금 요청을 보낸 로그인 사용자의 id
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.goal_checks enable row level security;
alter table public.daily_logs enable row level security;
alter table public.ai_feedbacks enable row level security;

-- profiles: 내 프로필만 읽기/수정 (생성은 아래 트리거가 해줌)
create policy "profiles: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: update own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- goals / goal_checks / daily_logs: 내 행만 읽기·추가·수정·삭제
create policy "goals: own rows" on public.goals
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "goal_checks: own rows" on public.goal_checks
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    -- 남의 목표에 체크를 끼워 넣지 못하게, 목표도 내 것인지 확인
    and exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid()))
  );

create policy "daily_logs: own rows" on public.daily_logs
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ai_feedbacks: 앱은 읽기만
create policy "ai_feedbacks: read own" on public.ai_feedbacks
  for select to authenticated using ((select auth.uid()) = user_id);

-- =====================================================================
-- 트리거: 회원가입하면 profiles 행을 자동으로 만들기
-- (가입할 때 넘긴 nickname을 사용)
-- =====================================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'nickname', ''), 20));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- daily_logs 수정 시 updated_at 자동 갱신
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger daily_logs_updated_at
  before update on public.daily_logs
  for each row execute function public.set_updated_at();
