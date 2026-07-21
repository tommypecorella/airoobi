-- 💬 Chat della corsa (Skeezu 22 lug 2026, "vediamo che succede"): i concorrenti di
-- un airdrop si scrivono mentre gareggiano. Accesso ai soli MEMBRI della corsa
-- (partecipanti attivi + venditore). Scrittura solo via RPC SECURITY DEFINER.
create table if not exists public.airdrop_chat(
  id bigint generated always as identity primary key,
  airdrop_id uuid not null references public.airdrops(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_airdrop_chat_aid_ts on public.airdrop_chat(airdrop_id, created_at);
alter table public.airdrop_chat enable row level security;
revoke insert, update, delete on public.airdrop_chat from anon, authenticated;

create or replace function public.is_race_member(p_airdrop uuid, p_uid uuid default auth.uid())
returns boolean language sql security definer stable set search_path to 'public' as $$
  select p_uid is not null and (
    exists(select 1 from airdrop_participations
             where airdrop_id=p_airdrop and user_id=p_uid and cancelled_at is null)
    or exists(select 1 from airdrops
               where id=p_airdrop and (submitted_by=p_uid or created_by=p_uid))
  );
$$;

create or replace function public.post_airdrop_chat(p_airdrop_id uuid, p_message text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_uid uuid := auth.uid(); v_msg text := trim(coalesce(p_message,'')); v_recent int; v_status text;
begin
  if v_uid is null then return jsonb_build_object('ok',false,'error','login_required'); end if;
  if not is_race_member(p_airdrop_id, v_uid) then return jsonb_build_object('ok',false,'error','not_member'); end if;
  select status into v_status from airdrops where id=p_airdrop_id;
  if v_status in ('completed','cancelled','rejected','archived') then
    return jsonb_build_object('ok',false,'error','race_closed'); end if;
  if length(v_msg) < 1 then return jsonb_build_object('ok',false,'error','empty'); end if;
  if length(v_msg) > 500 then v_msg := left(v_msg,500); end if;
  select count(*) into v_recent from airdrop_chat
   where user_id=v_uid and airdrop_id=p_airdrop_id and created_at > now() - interval '60 seconds';
  if v_recent >= 8 then return jsonb_build_object('ok',false,'error','rate_limited'); end if;
  insert into airdrop_chat(airdrop_id, user_id, message) values (p_airdrop_id, v_uid, v_msg);
  return jsonb_build_object('ok',true);
end; $$;

create or replace function public.get_airdrop_chat(p_airdrop_id uuid, p_after bigint default 0)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_uid uuid := auth.uid();
begin
  if not is_race_member(p_airdrop_id, v_uid) then return jsonb_build_object('ok',false,'error','not_member'); end if;
  return jsonb_build_object('ok',true, 'me', v_uid, 'messages', coalesce((
    select jsonb_agg(m order by (m->>'id')::bigint) from (
      select jsonb_build_object(
        'id', c.id, 'user_id', c.user_id, 'message', c.message, 'created_at', c.created_at,
        'username', p.username, 'avatar_url', p.avatar_url, 'mine', c.user_id=v_uid) as m
      from airdrop_chat c join profiles p on p.id=c.user_id
      where c.airdrop_id=p_airdrop_id and c.id > coalesce(p_after,0)
      order by c.id desc limit 200
    ) sub
  ), '[]'::jsonb));
end; $$;

grant execute on function public.is_race_member(uuid,uuid) to authenticated;
grant execute on function public.post_airdrop_chat(uuid,text) to authenticated;
grant execute on function public.get_airdrop_chat(uuid,bigint) to authenticated;
