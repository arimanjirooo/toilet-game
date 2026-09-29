-- Run schema.sql first, then seed.sql. Only aggregate counts are shared.
create table public.questions (id text primary key, choices text[] not null);
create table public.votes (
 question_id text not null references public.questions(id),
 user_id uuid not null references auth.users(id) on delete cascade,
 choice text not null,
 created_at timestamptz not null default now(),
 primary key (question_id,user_id)
);
alter table public.questions enable row level security;
alter table public.votes enable row level security;
revoke all on public.questions, public.votes from anon, authenticated;
-- Writes are permitted only through this validated, authenticated RPC.
create or replace function public.cast_vote(p_question text,p_choice text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_choice text; v_inserted boolean;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from public.questions where id=p_question and p_choice=any(choices)) then
  raise exception 'Invalid question or choice';
 end if;
 insert into public.votes(question_id,user_id,choice) values(p_question,auth.uid(),p_choice)
 on conflict(question_id,user_id) do nothing;
 v_inserted := found;
 select choice into v_choice from public.votes where question_id=p_question and user_id=auth.uid();
 return jsonb_build_object('choice',v_choice,'inserted',v_inserted);
end; $$;
create or replace function public.vote_counts(p_question text)
returns table(choice text,votes bigint) language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from public.votes where question_id=p_question and user_id=auth.uid()) then
  raise exception 'Vote before viewing results';
 end if;
 return query select v.choice,count(*) from public.votes v where v.question_id=p_question group by v.choice;
end; $$;
revoke all on function public.cast_vote(text,text), public.vote_counts(text) from public, anon;
grant execute on function public.cast_vote(text,text), public.vote_counts(text) to authenticated;
