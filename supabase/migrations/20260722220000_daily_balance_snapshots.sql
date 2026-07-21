-- 📸 BACKUP giornaliero saldi (Skeezu 22 lug 2026): "se ci bucano, amen — l'importante
-- è avere la fotografia dei dati precedenti per ripristinare i saldi". Schema `backup`
-- isolato: nessun grant ad anon/authenticated (un exploit applicativo NON lo tocca).
-- Fotografa in jsonb le tabelle di valore, retention 30 giorni, via pg_cron.

create schema if not exists backup;
revoke all on schema backup from anon, authenticated;

create table if not exists backup.snapshots(
  id bigint generated always as identity primary key,
  taken_at   timestamptz not null default now(),
  snap_date  date        not null default current_date,
  table_name text        not null,
  row_id     text,
  data       jsonb       not null
);
create index if not exists idx_snap_date_table on backup.snapshots(snap_date, table_name);

create or replace function backup.take_snapshot()
returns jsonb language plpgsql security definer set search_path to 'public','backup'
as $$
declare
  v_tables text[] := array['profiles','points_ledger','nft_rewards','transactions',
                           'airdrops','airdrop_participations'];
  t text; v_n bigint; v_total bigint := 0; v_report jsonb := '{}'::jsonb;
begin
  if exists (select 1 from backup.snapshots where snap_date = current_date) then
    return jsonb_build_object('ok', true, 'skipped', 'already_done_today');
  end if;
  foreach t in array v_tables loop
    execute format(
      'insert into backup.snapshots(table_name,row_id,data)
       select %L, (row_to_json(x)->>''id''), to_jsonb(x) from public.%I x',
      t, t);
    get diagnostics v_n = row_count;
    v_total := v_total + v_n;
    v_report := v_report || jsonb_build_object(t, v_n);
  end loop;
  delete from backup.snapshots where snap_date < current_date - interval '30 days';
  return jsonb_build_object('ok', true, 'date', current_date, 'rows', v_total, 'per_table', v_report);
end $$;

-- schedula ogni giorno alle 03:15 UTC (idempotente: unschedule se già presente)
select cron.unschedule('daily-balance-snapshot')
  where exists (select 1 from cron.job where jobname='daily-balance-snapshot');
select cron.schedule('daily-balance-snapshot', '15 3 * * *', $$select backup.take_snapshot();$$);
