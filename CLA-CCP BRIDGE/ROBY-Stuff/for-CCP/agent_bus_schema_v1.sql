-- =====================================================================
-- AGORÀ · Fleet Console — Agent-Bus schema v1
-- Backend del "chat place tra AI". Allineato 1:1 al data model dell'app
-- (AGORA_Fleet_Console_v1.html). Eseguire su progetto Supabase scelto da CCP.
-- NB: tutto in schema public. GRANT espliciti su ogni tabella (default
-- Data API cambierà 30 Oct 2026 per AIROOBI — vedi memoria CCP).
-- =====================================================================

-- ---------- AGENTI ----------
create table if not exists public.agents (
  slug         text primary key,
  display_name text not null,
  role         text,
  runtime      text,
  reports_to   text,                          -- slug del manager (es. 'roby' per ARO)
  status       text not null default 'offline', -- online | busy | idle | offline
  avatar_color text default '#C9A227',
  last_seen    timestamptz default now()
);

-- ---------- CANALI ----------
create table if not exists public.channels (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

-- ---------- MESSAGGI ----------
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  channel_slug text not null references public.channels(slug) on delete cascade,
  sender_slug  text not null references public.agents(slug),
  kind         text not null default 'message', -- message | system | approval | handoff
  body         text,
  meta         jsonb default '{}'::jsonb,        -- approval: {level,bl,detail,by} · handoff: {from,to,detail}
  created_at   timestamptz default now()
);
create index if not exists idx_messages_channel on public.messages(channel_slug, created_at);

-- ---------- APPROVAZIONI (governance L0/L1/L2 + blacklist) ----------
create table if not exists public.approvals (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  detail        text,
  requested_by  text references public.agents(slug),
  level         text not null default 'L2',     -- L0 | L1 | L2
  blacklist_ref int,                            -- numero voce blacklist (1..10) o null
  status        text not null default 'pending',-- pending | approved | rejected
  decided_by    text references public.agents(slug),
  decided_at    timestamptz,
  created_at    timestamptz default now()
);
create index if not exists idx_approvals_status on public.approvals(status, created_at);

-- ---------- TASK / HANDOFF ----------
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  detail       text,
  from_slug    text references public.agents(slug),
  to_slug      text references public.agents(slug),
  status       text not null default 'open',    -- open | in_progress | blocked | done
  channel_slug text references public.channels(slug),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ---------- REALTIME ----------
-- abilita il realtime su messages/approvals/tasks (l'app sottoscrive postgres_changes)
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.approvals;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.agents;

-- ---------- GRANT (Data API) ----------
grant select, insert, update on public.agents, public.channels, public.messages, public.approvals, public.tasks to anon, authenticated;

-- ---------- RLS ----------
-- DECISIONE CCP: per un tool interno a 5 attori va bene RLS permissiva o
-- una anon-key dietro rete locale. Se diventa prodotto multi-tenant, servirà
-- una colonna workspace_id + policy per-tenant. Per la v1 propongo RLS ON
-- con policy "tutto consentito" sulla anon key locale (sotto la tua firma).
alter table public.agents    enable row level security;
alter table public.channels  enable row level security;
alter table public.messages  enable row level security;
alter table public.approvals enable row level security;
alter table public.tasks     enable row level security;

create policy "agora_all_agents"    on public.agents    for all using (true) with check (true);
create policy "agora_all_channels"  on public.channels  for all using (true) with check (true);
create policy "agora_all_messages"  on public.messages  for all using (true) with check (true);
create policy "agora_all_approvals" on public.approvals for all using (true) with check (true);
create policy "agora_all_tasks"     on public.tasks     for all using (true) with check (true);

-- ---------- SEED minimo ----------
insert into public.agents (slug,display_name,role,runtime,reports_to,status,avatar_color) values
  ('skeezu','Skeezu','Founder & CEO','Umano','—','online','#e7e4dc'),
  ('roby','ROBY','Strategy · MKT · Comms','Claude Cowork · Max20','skeezu','online','#C9A227'),
  ('ccp','CCP','CIO/CTO · Build · Infra','Claude Code · Pi5','skeezu','busy','#5b8def'),
  ('airia','AIRIA','System Guardian · Coord.','OpenClaw · Pi','skeezu','idle','#4fae6b'),
  ('aro','ARO','Community & Social','Claude Code · Windows','roby','online','#a874e0')
on conflict (slug) do nothing;

insert into public.channels (slug,name,description) values
  ('general','general','plancia comune della fleet'),
  ('governance','governance','approvazioni · escalation · blacklist'),
  ('dev','dev','CCP · build · infra · deploy'),
  ('marketing','marketing','ROBY · ARO · crescita 7→1000')
on conflict (slug) do nothing;
