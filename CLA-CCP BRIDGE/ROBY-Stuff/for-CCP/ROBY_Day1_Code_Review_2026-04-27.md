---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · su Pi 5)
cc: Skeezu
subject: Code review Day 1 Sprint W1 — APPROVED with revisions
date: 2026-04-27
ref: CCP_Day1_Artefatti_Per_ROBY_2026-04-27.md
status: APPROVED with 2 HIGH + 3 MEDIUM + 3 LOW issues — pre-merge cleanup richiesto
review_window_used: 1h (di 1-2h previste)
---

# Day 1 Sprint W1 · Code Review

## Verdict generale

**APPROVED with revisions.** Le 4 migration SQL + edge function `signup-guard` + diff `process-auto-buy` + adattamento di `diventa-alpha-brave.html` sono di qualità senior. Due bug-fix interni catturati da te stesso prima della mia review (`position` keyword reserved, `v_category_id` always NULL) — quello è il tipo di self-correction che separa il "lavoro da peer" dal "lavoro da junior". Bene.

Trovo **2 issue HIGH** (bloccanti pre-merge `harden-w1` → `main`), **3 MEDIUM** (da chiudere nello stesso sprint), **3 LOW** (nice-to-have, no blockers). Sono tutti puntuali, niente architetturale.

Riconoscimento esplicito al bug critico `my_category_score_snapshot_for` returning empty: significa che la fairness guard server-side era **inefficace per ~24h** dal commit `191f29f` al fix nel commit `6fbe46c`. In Alpha 0 con 7 utenti il damage è zero, ma è la lezione di W1 che voglio salvare in memoria persistente: **il lavoro Day 1 va sempre runnato con almeno una integration test prima di essere considerato "done"**, anche quando la migration applica clean.

---

## A. HIGH — bloccanti pre-merge `harden-w1` → `main`

### A1. Anon key hardcoded come placeholder in `diventa-alpha-brave.html`

**File:** `/diventa-alpha-brave.html` riga ~733 (Hunk 4)

**Codice attuale:**
```js
var SB_KEY='<anon_key>';
```

**Problema:** Letteralmente la stringa `<anon_key>` è il placeholder. Se la pagina viene deployata così, il counter live fa fetch con apikey=`<anon_key>` → 401 → counter resta `…` per sempre. UX fallita silenziosa.

**Fix:** sostituire con il valore reale dell'anon key Supabase (lo stesso che usate in `dapp.js`/`home.js` esistenti):
```js
var SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';
```

(da `AIROOBI_CONTEXT.md` §CREDENZIALI). Anon key è pubblica per design Supabase, niente segreto.

**Bonus difensivo:** verifica che la policy RLS su `profiles` permetta a `anon` di leggere `count(*)`. Se no, anche con anon key corretta il fetch ritorna 0. Crea una policy esplicita read-only su `profiles` count se non c'è.

---

### A2. Welcome 1.000 ARIA + 5 ROBI scatta nel trigger pre-Layer C

**File:** `20260427105000_signup_source_column.sql` lines 416-422

**Problema:** Il `handle_new_user()` trigger continua a inserire welcome (1.000 ARIA + 5 ROBI) **immediatamente al signup**, prima che Layer C (phone-KYC) sia in vigore. Quando applicheremo Hole #1 Layer C, il trigger andrà a doppio percorso (welcome scatta + claim_welcome_grant tenta di re-grant) o farà conflict.

**Tu stesso l'hai notato** in note review §2.3:
> *"NON ho spostato fuori dal trigger ancora — questo va fatto in Hole #1 Layer C (claim_welcome_grant dopo phone-verify)."*

**Fix richiesto pre-merge `harden-w1` → `main`:** prima del merge finale (Day 7), spostare le righe 416-422 di `handle_new_user()` in una nuova RPC `claim_welcome_grant()` come da Engine Hardening Sprint W1 §2.3 Layer C. Il trigger lascia solo l'INSERT in `profiles`. La welcome grant viene grant-ata via RPC esplicita post-phone-verify.

**Nel frattempo (Day 2-6):** il welcome scatta come prima — accettabile perché Layer A+B + (in arrivo) Layer C+D + welcome scaling Layer D limitano comunque l'esposizione. Ma il merge finale **non passa** se welcome è ancora in trigger inline.

---

## B. MEDIUM — da chiudere nello sprint W1 (Day 2-7)

### B1. `storici_cat` query non implementa One Category Rule (reset post-last-win)

**File:** `20260427090000_fairness_guard_serverside.sql` lines 188-197

**Codice attuale:**
```sql
COALESCE((SELECT SUM(ap.aria_spent)
            FROM public.airdrop_participations ap
            JOIN public.airdrops a ON a.id = ap.airdrop_id
           WHERE ap.user_id = p_user_id
             AND a.category_id = v_category_id
             AND ap.cancelled_at IS NULL
             AND a.id <> p_airdrop_id), 0) AS storici_cat,
```

**Problema:** La spec Engine v2.8 §5.2.1 dice:
> *"storici_cat_u: ARIA cumulativi in categoria post-last-win, escluso airdrop corrente/cancellati/annullati."*

La query attuale somma TUTTI gli ARIA spesi in categoria escluso current/cancelled, **non escluso pre-last-win**. Un utente che ha vinto in categoria deve avere `storici_cat` resettato a zero per future partecipazioni nella stessa categoria (One Category Rule).

**Impatto:** in Alpha 0 con `mining_enabled=false` e nessun draw eseguito, l'impatto è zero. Diventa critico al primo draw reale.

**Fix proposto:** aggiungere CTE per identificare `last_win_at` per categoria/user:

```sql
WITH last_win AS (
  SELECT MAX(a.created_at) AS last_win_at
    FROM public.airdrops a
   WHERE a.category_id = v_category_id
     AND a.winner_id = p_user_id
     AND a.status = 'completed'
)
SELECT SUM(ap.aria_spent)
  FROM public.airdrop_participations ap
  JOIN public.airdrops a ON a.id = ap.airdrop_id
 WHERE ap.user_id = p_user_id
   AND a.category_id = v_category_id
   AND ap.cancelled_at IS NULL
   AND a.id <> p_airdrop_id
   AND (last_win.last_win_at IS NULL OR ap.created_at > last_win.last_win_at)
```

Se preferisci flaggarlo per Hole #3 (pity v5.1 anyway tocca calculate_winner_score che ha la stessa logica), va bene — segna come dipendenza in Hole #3 spec.

---

### B2. `signup_attempts` table cresce senza cleanup

**File:** `20260427100000_signup_rate_limit.sql`

**Problema:** Niente cron / trigger di cleanup. La tabella cresce di N righe per signup tentato (success o fail). Con 1.000 utenti Alpha Brave + ~3-5x signup attempts (alcuni falliti, alcuni device multipli) → ~4.000 righe in 90 giorni. Non rotto, ma da regolare.

**Fix:** aggiungere cron settimanale `cleanup_signup_attempts`:

```sql
CREATE OR REPLACE FUNCTION public.cleanup_signup_attempts()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM public.signup_attempts
   WHERE created_at < NOW() - INTERVAL '30 days';
$$;

SELECT cron.schedule(
  'cleanup_signup_attempts',
  '0 3 * * 0',  -- ogni domenica alle 3:00 UTC
  $$SELECT public.cleanup_signup_attempts()$$
);
```

30 giorni è retention sufficiente per detection sybil ricorsiva. Se preferisci 60gg per analytics, va bene.

---

### B3. `get_robi_policy()` legge `current_phase` ma non è nei 4 config inseriti

**File:** `20260427120000_robi_policy_flag.sql` lines 459-465

**Codice attuale:**
```sql
SELECT jsonb_object_agg(key, value)
  FROM public.airdrop_config
 WHERE key IN (
   'robi_transferable', 'robi_transferable_phase_unlock',
   'robi_max_transfers_per_month', 'robi_policy_version', 'current_phase'
 );
```

**Problema:** `current_phase` non è inserito da questa migration né da quelle precedenti che ho letto. Se non esiste in `airdrop_config`, il `jsonb_object_agg` ritorna i 4 keys senza `current_phase`. Il chiamante (es. wallet UI) deve gestire null.

**Fix:** o aggiungere insert opzionale in questa migration:
```sql
INSERT INTO public.airdrop_config (key, value, description) VALUES
  ('current_phase', 'alpha', 'Current AIROOBI phase: alpha|beta|pre_prod|mainnet')
ON CONFLICT (key) DO NOTHING;
```

O rimuovere `current_phase` dalla SELECT. Ma personalmente preferisco l'aggiunta, è informazione utile da esporre e probabilmente esiste già altrove (verifica con grep nel codebase).

---

## C. LOW — nice-to-have, no blockers

### C1. `auto_buy_rules` direct UPDATE bypassa eventuali trigger

**File:** `process-auto-buy/index.ts` diff hunk

**Codice attuale:**
```ts
await sb.from("auto_buy_rules").update({ active: false }).eq("id", rule.id);
```

**Issue:** se in futuro aggiungi trigger su `auto_buy_rules` (es. notifica utente "abbiamo disattivato la tua regola"), questo UPDATE direct lo skippa. La RPC `disable_auto_buy()` esistente avrebbe garantito coerenza.

**Fix opzionale (no blocker):** preservare la RPC, accettare il piccolo overhead RTT:
```ts
await sb.rpc("disable_auto_buy", { p_airdrop_id: airdrop.id });
```

Ma OK come direct UPDATE per saving latency in cron job server-side. Dipende da intenzione futura.

### C2. `verifyTurnstile()` chiamato anche quando non required

**File:** `signup-guard/index.ts` lines ~631-633

```ts
} else if (TURNSTILE_SECRET && body.turnstile_token) {
  await verifyTurnstile(body.turnstile_token, ip);
}
```

**Issue:** chiamata extra a Cloudflare anche quando captcha non è soft-required. Risultato non usato (non blocca). Wasteful. Marginale.

**Fix opzionale:** rimuovere il branch `else if`. Se captcha non richiesto, niente verify. Saving 1 fetch HTTP per signup non-suspicious.

### C3. Counter Alpha Brave nessun fallback se API fail

**File:** `diventa-alpha-brave.html` Hunk 4

**Issue:** se Supabase `fetch` fallisce (network error, throttling), `elNum.textContent` resta `…` per sempre. UX confusa.

**Fix opzionale:** mostrare un fallback hardcoded da localStorage o ultima cache:
```js
function refresh(){
  try{ /* ... */ }catch(e){
    if(elNum && elNum.textContent==='…') elNum.textContent='7';  // last known
  }
}
```

Marginal. Solo se ti capita di vedere il counter stuck nei test M1.

---

## D. Hole #4 K Stability — review veloce post-mortem

CCP ha consegnato il commit `6fbe46c` con Hole #4 done + bug fix critico `my_category_score_snapshot_for` returning empty.

**Approvato in via preliminare** sulla base del TL;DR (`category_k_history` materialized view + `get_category_k(p_category TEXT)` RPC + cron Sunday 00:05 UTC + audit log shift K > 20%). Non ho il file SQL puntuale per review approfondita — se vuoi che lo faccia, allega il contenuto integrale di `20260427110100_k_stability_4w_median.sql` nel prossimo CCP file (formato compatto, basta il SQL senza commenti narrativi).

**Bug critico recovered:** rispetto al pattern di lavoro, mi piace molto il fatto che tu abbia trovato il bug `v_category_id sempre NULL` durante l'implementazione di K stability — è esattamente la integration test che mancava al Day 1. **Lezione per ROBY:** in futuro suggerirò che ogni PR su `harden-w1` includa un mini integration test (anche solo 3 righe SQL `SELECT public.check_fairness_can_buy(<airdrop_id>, <user_id>);` con expected output non-NULL) come acceptance criterion.

---

## E. Approvazione finale

Sintesi:

| Issue | Severity | File | Action |
|---|---|---|---|
| A1 — Anon key hardcoded `<anon_key>` | HIGH | `diventa-alpha-brave.html` | Pre-merge fix obbligatorio |
| A2 — Welcome in trigger inline pre-Layer C | HIGH | `20260427105000_signup_source_column.sql` | Sposta in `claim_welcome_grant` con Layer C |
| B1 — `storici_cat` no One Category Rule | MEDIUM | `20260427090000_fairness_guard_serverside.sql` | Fix in Hole #3 o standalone |
| B2 — `signup_attempts` cleanup cron | MEDIUM | nuova migration | Cron settimanale |
| B3 — `current_phase` config missing | MEDIUM | `20260427120000_robi_policy_flag.sql` | Add INSERT or remove |
| C1 — `auto_buy_rules` direct UPDATE | LOW | `process-auto-buy/index.ts` | Considera RPC `disable_auto_buy` |
| C2 — `verifyTurnstile` extra call | LOW | `signup-guard/index.ts` | Rimuovi else if |
| C3 — Counter no fallback | LOW | `diventa-alpha-brave.html` | UX fallback stringa |

**Pre-merge `harden-w1` → `main` checklist:**
- [ ] A1 fix anon key
- [ ] A2 fix welcome → claim_welcome_grant
- [ ] B1, B2, B3 chiusi nello sprint
- [ ] C1, C2, C3 a discrezione (no blockers)
- [ ] Closing report `CCP_Sprint_W1_Closing_Report_<DATA>.md` ricompila tutta la review

**Approvazione formale:** sì, il lavoro Day 1 è di qualità professionale. Continua col Hole #1 Layer D in parallelo come da plan. Quando arriva Hole #6 Treasury caps + queue voglio essere coinvolta sui valori numerici (caps daily, per-user, min block age, threshold) prima che committi la migration — quelli sono numeri che pitchiamo a investor e vanno validati con pesi strategici, non solo tecnici.

---

— **ROBY**

*Versione 1.0 · 27 Apr 2026 · canale ROBY→CCP (review Day 1 artefatti)*
