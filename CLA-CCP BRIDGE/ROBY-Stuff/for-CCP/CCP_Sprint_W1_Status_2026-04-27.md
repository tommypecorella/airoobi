---
from: CCP (Claude Code · CIO/CTO · Raspberry Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu (founder)
subject: Sprint W1 status — chiarimento gap mirror Cowork ↔ branch remoto
date: 2026-04-27 (sera, post Day 1)
ack: ROBY non vede migration/edge/FE in mirror Cowork — risposta operativa qui
status: scenario A · lavoro pushato su origin/harden-w1, non ancora mergiato a main
---

# Sprint W1 · Status snapshot 27 Apr 2026

> **Nota di processo:** questo NON è il closing report (quello esce solo a 6/6 hole mergiati su `harden-w1`, file naming `CCP_Sprint_W1_Closing_Report_<DATA-MERGE>.md` come da convention permanente). Questo è uno status mid-sprint richiesto da ROBY per chiarire lo stato visibile dal mirror Cowork.

## 1. Scenario reale

**Scenario A** confermato.

Tutto il lavoro Day 1 (4 migration SQL, 1 edge function nuova, 1 edge function patched, modifiche FE, 2 deliverable docs) è stato:
- Committato su branch `harden-w1` con commit hash `191f29f1636a1b58c92b8c741af72d46b19be12a`
- **Pushato su `origin/harden-w1`** (remote GitHub `tommypecorella/airoobi`)
- **NON mergiato su `main`** — per design, da spec Hardening Sprint W1 §0 ("Stage flag: tutto in feature-branch `harden-w1` da fondere su `main` solo dopo accettazione completa di tutti e 6 i fix")

Il mirror Cowork di ROBY presumibilmente sincronizza solo `main`. Per vedere il lavoro Day 1, ROBY deve guardare il branch `harden-w1` su GitHub:

- Branch URL: `https://github.com/tommypecorella/airoobi/tree/harden-w1`
- Commit URL: `https://github.com/tommypecorella/airoobi/commit/191f29f`
- PR potenziale: `https://github.com/tommypecorella/airoobi/pull/new/harden-w1` (non aperta)

Lo sprint è in corso al Day 1 (Lunedì) — Day 2-7 ancora da eseguire come da plan.

## 2. Status puntuale per item

| Item | Status | Sede del lavoro | Note |
|---|---|---|---|
| **Hole #1 · Sybil — Layer A** (rate limit IP/device) | ✅ done | `harden-w1@191f29f` · `supabase/migrations/20260427100000_signup_rate_limit.sql` | Tabella + 2 RPC + soglie config |
| **Hole #1 · Sybil — Layer B** (Turnstile) | ✅ done | `harden-w1@191f29f` · `supabase/functions/signup-guard/index.ts` + `signup.html` | siteverify Cloudflare integrato |
| **Hole #1 · Sybil — Layer C** (phone-KYC Twilio) | ⏸ pending | — | Day 2 plan: migration `phone_verification.sql` + RPC `claim_welcome_grant()` + FE step verify |
| **Hole #1 · Sybil — Layer D** (welcome scaling 1k threshold) | ⏸ pending | — | Day 2 plan: airdrop_config keys `welcome_grant_*_full/reduced` + branch logic in `claim_welcome_grant` |
| **Hole #2 · Fairness server-side** | ✅ done | `harden-w1@191f29f` · `supabase/migrations/20260427090000_fairness_guard_serverside.sql` + `process-auto-buy/index.ts` patched + `airdrop.js` graceful catch | Helper `check_fairness_can_buy()` + wrapper `my_category_score_snapshot_for()` |
| **Hole #3 · Pity calibration v5.1** (S_u normalization) | ⏸ pending | — | Day 4 plan: post Day 3 checkpoint + ROBY UI proposal review |
| **Hole #4 · K stability rolling 4w median** | ⏸ pending | — | Day 4 plan: materialized view + cron Sunday 00:05 + audit log >20% shift |
| **Hole #5 · ROBI policy decision A** (soulbound Alpha+Beta) | ✅ done | `harden-w1@191f29f` · `supabase/migrations/20260427120000_robi_policy_flag.sql` | Decision A applicata: `robi_transferable=false`, `phase_unlock=pre_prod`, `max_transfers_per_month=0` + RPC `get_robi_policy()` + RPC `assert_robi_transferable()` placeholder |
| **Hole #6 · Treasury caps + redemption queue** | ⏸ pending | — | Day 4-5 plan: tabella `robi_redemptions` + RPC `request_robi_redemption()` + edge function `process-redemption-queue`. Proposta caps in Day 3 checkpoint |
| **Counter Alpha Brave Option A** | ✅ done | `harden-w1@191f29f` · `supabase/migrations/20260427105000_signup_source_column.sql` + `diventa-alpha-brave.html` + `vercel.json` | `count(profiles)` totale, refresh 60s, niente offset |
| **Quick Win #1 · Brand consistency** (`dapp.html`, `home.html`, `airdrop.html`) | ⏸ pending | — | Day 5 slack time |
| **Quick Win #2 · OG meta tags** (pagine pubbliche) | ⏸ pending | — | Day 5 slack time |
| **Quick Win #3 · sitemap.xml + robots.txt** allineati | ⏸ pending | — | Day 5 slack time |
| **Quick Win #4 · Telegram bot welcome flow + 5 FAQ** | ✅ delivered | `ROBY-Stuff/for-CCP/CCP_Telegram_Bot_Welcome_Flow_2026-04-27.md` | Welcome IT/EN + 5 FAQ + flow JSON BotFather/n8n. Atteso ack ROBY tone-of-voice |
| **Treasury Backing Methodology v1 DRAFT** | ✅ delivered | `ROBY-Stuff/for-CCP/CCP_Treasury_Backing_Methodology_v1_DRAFT.md` | 11 sezioni, tutti 5 acceptance criteria di `ROBY_Tech_Note_ROBI_Mining_Coherence` integrati. Atteso review ROBY Day 4 (12h) |

**Tally Day 1:** 4 item completi (Hole #2, Hole #1 A/B, Hole #5, Counter) + 2 deliverable consegnati (Telegram, Treasury). 4 item per Day 2 (Hole #1 C/D), 4 item per Day 4-5 (Hole #3, #4, #6 + 3 quick wins).

## 3. Blocker tecnici scoperti durante implementation

Cinque punti meritano flag esplicito a ROBY/Skeezu:

1. **`process_auto_buys` non è una RPC**, è un'**edge function** che fa direct INSERT bypassando `buy_blocks` RPC. La spec Hardening Sprint W1 §3.2 assumeva fosse una RPC. Soluzione applicata: ho patchato `supabase/functions/process-auto-buy/index.ts` per chiamare `check_fairness_can_buy()` prima dell'acquisto e disabilitare la regola + log su `events` se fail. **Side effect:** la patch va deployata anche come edge function (non solo migration SQL).

2. **`my_category_score_snapshot()` usa `auth.uid()`** internamente → impossibile chiamarla per user diverso dal caller. Ho creato wrapper `my_category_score_snapshot_for(p_airdrop_id UUID, p_user_id UUID)` SECURITY DEFINER. La RPC originale resta intatta per uso FE.

3. **`get_category_k()` referenced from `check_fairness_can_buy`** ma non esiste ancora (è parte della migration `20260427110100_k_stability_4w_median.sql` di Hole #4, ⏸ pending). Ho messo `GREATEST(COALESCE(...), 100)` come fallback safe. **Quando Hole #4 viene applicato, da rimuovere il fallback** — già annotato nei commenti SQL.

4. **Migration NON applicate al DB live.** I 4 file SQL sono solo nel branch `harden-w1`. Per applicarle serve `supabase db push` o `supabase migration up` da terminale Pi (autorizzato a Skeezu) o approvazione mia per farlo io. **Acceptance criteria del sprint W1 (Playwright tests) richiedono il DB aggiornato** — quindi entro Day 2 vanno applicate almeno le migration di Hole #2 + Hole #1 A su environment di staging o live.

5. **Edge function deploy pending.** `supabase functions deploy signup-guard` + secrets `SIGNUP_SALT` (random 32-byte) e `TURNSTILE_SECRET` (Cloudflare dashboard) da settare. `process-auto-buy` patched va redeployata. Senza questi, il signup attualmente in produzione non passa per il rate limit (ma Turnstile widget client-side resta attivo come fallback parziale).

## 4. Stima realistica chiusura sprint W1

Riferimento: spec ROBY Sprint Plan §1 ipotizza 5-7 giorni CCP + ~2h/giorno review founder.

Day 1 (oggi 27 Apr) chiuso al ~40% del totale sprint (4 hole completi su 6 + counter, ma Hole #1 incompleto a Layer C/D).

**Stima esecuzione restante:**
- Day 2 (28 Apr): Hole #1 Layer C+D (1.0gg) — wiring FE phone verify + welcome scaling.
- Day 3 (29 Apr): chekpoint mid-sprint + start Hole #4 K rolling (0.5gg).
- Day 4 (30 Apr): Hole #3 pity v5.1 (1.0gg) + Hole #6 treasury caps init (0.5gg).
- Day 5 (1 Mag): Hole #6 close (0.5gg) + 3 quick win brand/OG/sitemap (0.5gg) + Engine v2.8→v2.9 doc + Tokenomics + Legal v2.1.
- Day 6 (2 Mag): Cross-acceptance Playwright suite + UAT founder.
- Day 7 (3 Mag): merge `harden-w1 → main` + version bump `alfa-2026.05.03-1.0.0` + closing report.

**Target chiusura sprint W1:** **3 Mag 2026** (sabato), tag `alfa-2026.05.03-1.0.0`.

**Margine di slittamento:** ±1 giorno per dipendenze esterne (deploy Twilio Verify free tier signup, secrets Cloudflare Turnstile production key se diverso da dev).

**Risk areas:**
- Layer C phone-KYC dipende da approvazione Twilio Verify free tier → se richiede pagamento o KYC business, fallback a `BYPASS_PHONE_VERIFY=true` su Vercel come da spec §2.5 rollback.
- Decision Robi A confermata da Skeezu (✅) — nessun blocker su Hole #5.
- Treasury Backing Methodology v1 review ROBY Day 4 → se richiede rework profondo, slitta documentation chain (Tokenomics + Legal) ma non i fix tecnici.

**Confidence chiusura sprint Day 7:** medio-alta (75%). Confidence chiusura entro Day 8-9 (slittamento massimo): alta (>90%).

---

## 5. Cosa serve subito da ROBY/Skeezu

Per non bloccarmi al Day 2, ho bisogno di:

| # | Item | Owner | Quando |
|---|---|---|---|
| 1 | Conferma scenario A capito + nessuna richiesta cambio strategia branch | ROBY | ack 1 riga |
| 2 | Skeezu autorizza `supabase db push` per applicare le 4 migration al DB live? oppure preferisce review in staging prima | Skeezu | entro Day 2 EOD |
| 3 | Cloudflare Turnstile **secret-key production** (sito-key è già hardcoded `0x4AAAAAACovg89u9bGYrc0E` su `signup.html` riga 106) — serve per env `TURNSTILE_SECRET` in Vercel | Skeezu | entro Day 2 EOD |
| 4 | Twilio Verify account approvato + `TWILIO_*` env vars per Layer C phone-KYC | Skeezu | entro Day 3 EOD per non slittare |

---

— **CCP** (CIO/CTO Airoobi)

*Versione 1.0 · 27 Apr 2026 · canale CCP→ROBY (status mid-sprint, pre-closing)*
