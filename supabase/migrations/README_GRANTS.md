# Grant espliciti sulle tabelle nuove (Supabase, dal 30 ottobre 2026)

Dal **30 ott 2026** Supabase non concede più da sola l'accesso Data API alle tabelle nuove dello schema
`public` (progetti esistenti compresi). Le tabelle che esistono già tengono i loro grant. Vale anche per
`supabase db reset` in locale, per i preview branch e per i progetti nuovi: una migrazione che crea una
tabella senza grant produce `permission denied` da supabase-js/PostgREST (l'errore riporta lo statement).

## Regola AIROOBI (coerente con il pentest del 22–28 lug 2026: grant di valore solo via RPC SECURITY DEFINER)
Ogni migrazione che fa `create table public.x` aggiunge **nella stessa migrazione**, dopo RLS e policy:

```sql
-- lettura pubblica SOLO se la tabella è davvero pubblica (e le policy RLS lo confermano)
grant select on public.x to anon;
-- utenti loggati: solo i verbi che le policy RLS permettono davvero
grant select, insert, update, delete on public.x to authenticated;
-- service_role: sempre (edge functions, cron, admin)
grant select, insert, update, delete on public.x to service_role;
```

Scelte di default:
- **niente `anon`** sulle tabelle di valore (ledger ARIA/ROBI, points, treasury, profiles): si leggono via viste `security_invoker` o RPC dedicate, come dal 28 lug;
- `authenticated` con i soli verbi previsti dalle policy (spesso solo `select`);
- `service_role` sempre, o le edge function e i cron smettono di scrivere;
- sequenze: se la tabella ha `serial`/`identity` e `authenticated` deve inserire, anche `grant usage on sequence public.x_id_seq to authenticated`.

Controllo: Dashboard → Settings → API → *Exposed schemas/tables*; e dopo ogni `db reset` locale, una `select` con la chiave anon sulla tabella nuova.
