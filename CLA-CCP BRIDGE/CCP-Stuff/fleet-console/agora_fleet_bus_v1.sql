-- =====================================================================
-- AGORÀ · Fleet agent-bus — schema dedicato `agora.*`  (applicato 30 May 2026)
-- Progetto Supabase dedicato free: airoobi-agora (ref tktuwboayqqimdhsrnap, eu-west-1).
-- Derivato da ROBY agent_bus_schema_v1.sql → namespacing `agora.*` (Addendum: prototipo
-- prodotto parallelo, portabilità/self-host). Console: createClient(url,key,{db:{schema:'agora'}}).
-- RLS permissiva = alpha LAN/team a 5 (anon key = bearer secret, NON pubblica).
-- author-only / multi-tenant (auth reale, org_id, policy per-identità) = estensione futura, NON qui.
-- Esposizione schema alla Data API (eseguita a parte, NON in migration):
--   alter role authenticator set pgrst.db_schemas = 'public, graphql_public, agora';
--   notify pgrst, 'reload config'; notify pgrst, 'reload schema';
-- (durevole: aggiungere `agora` in Dashboard → Settings → API → Exposed schemas)
-- =====================================================================
create schema if not exists agora;

create table if not exists agora.agents (
  slug         text primary key,
  display_name text not null,
  role         text,
  runtime      text,
  reports_to   text,
  status       text not null default 'offline',
  avatar_color text default '#C9A227',
  last_seen    timestamptz default now()
);

create table if not exists agora.channels (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

create table if not exists agora.messages (
  id           uuid primary key default gen_random_uuid(),
  channel_slug text not null references agora.channels(slug) on delete cascade,
  sender_slug  text not null references agora.agents(slug),
  kind         text not null default 'message',
  body         text,
  meta         jsonb default '{}'::jsonb,
  created_at   timestamptz default now()
);
create index if not exists idx_agora_messages_channel on agora.messages(channel_slug, created_at);

create table if not exists agora.approvals (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  detail        text,
  requested_by  text references agora.agents(slug),
  level         text not null default 'L2',
  blacklist_ref int,
  status        text not null default 'pending',
  decided_by    text references agora.agents(slug),
  decided_at    timestamptz,
  created_at    timestamptz default now()
);
create index if not exists idx_agora_approvals_status on agora.approvals(status, created_at);

create table if not exists agora.tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  detail       text,
  from_slug    text references agora.agents(slug),
  to_slug      text references agora.agents(slug),
  status       text not null default 'open',
  channel_slug text references agora.channels(slug),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter publication supabase_realtime add table agora.messages;
alter publication supabase_realtime add table agora.approvals;
alter publication supabase_realtime add table agora.tasks;
alter publication supabase_realtime add table agora.agents;

grant usage on schema agora to anon, authenticated;
grant select, insert, update on agora.agents, agora.channels, agora.messages, agora.approvals, agora.tasks to anon, authenticated;

alter table agora.agents    enable row level security;
alter table agora.channels  enable row level security;
alter table agora.messages  enable row level security;
alter table agora.approvals enable row level security;
alter table agora.tasks     enable row level security;

create policy "agora_all_agents"    on agora.agents    for all using (true) with check (true);
create policy "agora_all_channels"  on agora.channels  for all using (true) with check (true);
create policy "agora_all_messages"  on agora.messages  for all using (true) with check (true);
create policy "agora_all_approvals" on agora.approvals for all using (true) with check (true);
create policy "agora_all_tasks"     on agora.tasks     for all using (true) with check (true);

insert into agora.agents (slug,display_name,role,runtime,reports_to,status,avatar_color) values
  ('skeezu','Skeezu','Founder & CEO','Umano','—','online','#e7e4dc'),
  ('roby','ROBY','Strategy · MKT · Comms','Claude Cowork · Max20','skeezu','online','#C9A227'),
  ('ccp','CCP','CIO/CTO · Build · Infra','Claude Code · Pi5','skeezu','busy','#5b8def'),
  ('airia','AIRIA','System Guardian · Coord.','OpenClaw · Pi','skeezu','idle','#4fae6b'),
  ('aro','ARO','Community & Social','Claude Code · Windows','roby','online','#a874e0')
on conflict (slug) do nothing;

insert into agora.channels (slug,name,description) values
  ('general','general','plancia comune della fleet'),
  ('governance','governance','approvazioni · escalation · blacklist'),
  ('dev','dev','CCP · build · infra · deploy'),
  ('marketing','marketing','ROBY · ARO · crescita 7 to 1000')
on conflict (slug) do nothing;
