---
title: CCP · Closure v3 · migration APPLICATE su Supabase Alpha · ROBY parte con l'UAT
purpose: Conferma che le 6 migration (F5 fixpack + PR-2/1/3/4/5) sono applicate sull'ambiente Alpha. Sblocca il giro UAT live di ROBY. Una nota su un bug intercettato in apply.
date: Ven 22 maggio 2026
audience: ROBY · Skeezu
status: APPLIED · 6/6 migration verde sul remoto · UAT ROBY sbloccato · merge sprint-w4 ancora NO
in-reply-to: ROBY_SignOff_CCP_Closure_v3_PR1to5_2026-05-22.md
---

# CCP — Closure v3 · migration applicate

## TL;DR

Skeezu ha dato il via. Le **6 migration sono applicate** sull'ambiente Alpha
(`vuvlmlpuhovipfwtquux`) via MCP `apply_migration`, in ordine, ognuna con il suo
mini-test che ha verificato lo schema. **ROBY può partire col giro UAT.** Il
merge `sprint-w4 → main` resta NO finché l'UAT non è verde — il backend v3 è
live, la FE (pannello esito) no.

## 1. Applicate, in ordine

| # | Migration | Esito |
|---|---|---|
| 1 | F5 fixpack · `publish_airdrop_listing` honor deadline | ✅ |
| 2 | PR-2 · counter/ban annullamenti | ✅ (vedi §3) |
| 3 | PR-1 · SLA 72h + Caso B + flip timeout | ✅ |
| 4 | PR-3 · cleanup consolazione | ✅ |
| 5 | PR-4 · gate fee upfront (dormiente) | ✅ |
| 6 | PR-5 BE · disinnesco sold-out | ✅ |

Verifica post-apply sul remoto: tabella `seller_cancellation_counter` presente ·
`cron_seller_acknowledge_timeout` schedulato (job `w5_seller_acknowledge_timeout`)
· vecchio `cron_auto_accept_silent_seller` + job `w4_*` rimossi · `enforce_launch_fee_gate=false`
(gate dormiente) · `register_seller_cancellation` con **0 grant a ruoli pubblici**.

## 2. Cosa ho trovato prima di applicare (e perché non ho fatto `db push`)

Le history migration locale e remota erano **divergenti**: 20 file locali
risultavano non applicati, perché tutto il W4 era stato applicato al remoto via
un canale parallelo (timestamp diversi). Un `supabase db push` avrebbe tentato
tutti e 20 i file — anche ~8 vecchi di fine aprile — col rischio di fallire a
metà. Verificato con query diretta che il backend W4 era già sul remoto, quindi
ho applicato **solo** i 6 file closure via MCP `apply_migration` (la scelta di
Skeezu). I 6 file restano «local-only» in `supabase migration list` — divergenza
cosmetica nota, da riconciliare a parte con `migration repair` quando volete.

## 3. Nota · bug intercettato in apply (PR-2)

Il primo apply di PR-2 è **fallito sul mini-test** — e ha fatto bene. Il
`REVOKE ... FROM PUBLIC` su `register_seller_cancellation` non bastava: Supabase
concede `EXECUTE` di default anche ad `anon`+`authenticated` via `ALTER DEFAULT
PRIVILEGES`. Il test ha bloccato la migration (rollback pulito, niente applicato).
Corretto in `REVOKE FROM PUBLIC, anon, authenticated` e ri-applicato: verde.
Esattamente il motivo per cui ogni PR porta il suo integration test.

## 4. UAT — palla a ROBY

Backend v3 live sull'Alpha. Giro UAT (7 step del closing report, §5):

- **Step 1–5, 7** (counter/ban, Caso A/B, timeout, consolazione, sold-out) →
  **testabili ora** via dApp/API sull'Alpha.
- **Step 6** (pannello esito FE su pagina dettaglio) → la FE è su `sprint-w4`,
  **non deployata** (merge dopo UAT). Da testare dopo il merge, o in locale.

Per il timeout 72h (step 4): se serve accelerare, si può abbassare a mano la
`seller_acknowledge_sla_deadline` di un airdrop in `waiting_seller_acknowledge`
e far girare il cron `w5_seller_acknowledge_timeout` (ogni 5 min).

## 5. Cosa resta

- **Merge `sprint-w4 → main`** — solo dopo UAT verde ROBY. Porta live la FE
  (pannello esito F7/F8) + i file migration nel repo.
- **Copy** `come-funziona-airdrop.html` (sezione chiusura obsoleta) — lane ROBY,
  insieme al go-live.
- **`AIROOBI_CONTEXT.md`** + engine doc — lane CCP, a v3 live.
- **Stage 2**: flip `enforce_launch_fee_gate=true` con il rail KAS.

## 6. Bottom line

6/6 migration verdi sull'Alpha, bug PR-2 intercettato e chiuso, backend Closure
v3 operativo. ROBY: via libera all'UAT. Skeezu: il merge resta in tua mano,
dopo l'UAT.

Daje — F8 chiuso, ora è anche live sul backend.

Audit-trail: questo file = conferma CCP apply migration Closure v3, in risposta
a `ROBY_SignOff_CCP_Closure_v3_PR1to5_2026-05-22.md` e all'istruzione di Skeezu.

---

*CCP · CIO/CTO Airoobi · Closure v3 Migration Applied · 22 May 2026 · daje team a 4*
