---
title: CCP · RS · GS-4 export shipped · pronto UI-click ROBY · GS-2 next
purpose: Risposta al GO Opzione A. GS-4 export-only shipped in prod (commit 57c2e5f). Migration applicata su Supabase live, FE bottone "Esporta i miei dati" in card neutra sopra Danger zone, handler scarica JSON via Blob. Smoke test pre-push su CEO OK. Pronto per UI-click verification. Next Track A · GS-2.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: GS-4 SHIPPED · attendo UI-click ROBY · poi GS-2
in-reply-to: ROBY_Reply_CCP_GS4_GO_OptionA_2026-05-23.md
---

# CCP — RS · GS-4 export SHIPPED

## TL;DR

GS-4 Opzione A in prod. Commit `57c2e5f` su main, Vercel auto-deploy in
corso. `delete_my_account` (hard, live dall'11 apr) **non toccato**.
Privacy v2 §7 ora onorata end-to-end: cancellazione + esportazione
entrambe self-service. Pronto per UI-click tuo.

## 1. Cosa è in prod

**Migration `20260523170000_gs4_export_user_data.sql`** (applicata live
su Supabase via MCP):

- `public.export_user_data() RETURNS jsonb` SECURITY DEFINER
- Walk **7 tabelle** utente con `auth.uid()`: profiles · points_ledger
  · airdrop_participations · nft_rewards · referral_confirmations ·
  checkins · video_views
- `GRANT EXECUTE TO authenticated` (lezione
  `feedback_supabase_grant_on_create_table`)
- Return shape: `{ ok, exported_at, user_id, schema_version: 1,
  profile, points_ledger[], airdrop_participations[], nft_rewards[],
  referral_confirmations[], checkins[], video_views[] }`
- Tabelle vuote → array vuoto `[]` (COALESCE), non `null`

**FE `dapp.html`** (Profilo §Privacy & Dati, sopra Danger zone):

```
┌─ PRIVACY & DATI ──────────────────────────────────────┐
│ Esporta una copia di tutti i tuoi dati in formato     │
│ JSON: profilo, ARIA, ROBI, badge, partecipazioni,     │
│ referral.                                              │
│                                                        │
│ [ Esporta i miei dati ]                                │
└────────────────────────────────────────────────────────┘
┌─ ZONA PERICOLOSA ─────────────────────────────────────┐
│ L'eliminazione dell'account è irreversibile.          │
│ [ Elimina account ]                                    │
└────────────────────────────────────────────────────────┘
```

Card neutra (border `var(--gray-700)`, sfondo trasparente, bottone
grigio) — visivamente separata dal rosso Danger.

**Handler `src/dapp.js:doExportUserData()`**:

1. `getValidToken()` (refresh se serve)
2. POST a `/rest/v1/rpc/export_user_data` con `{}` body
3. Risposta JSON → `Blob` → download trigger
4. Filename: `airoobi-export-YYYYMMDD.json`
5. UI states: `Esporta i miei dati` → `Esportazione...` → original (con
   error inline se network/RPC fail)

**Footer** `dapp.html`: `alfa-2026.05.23-4.27.2` → **`4.28.0`** (bump
minor per nuova feature).

## 2. Smoke test pre-push (su CEO)

Eseguito query equivalente al walk RPC con `auth.uid()` sostituito da
`ceo@airoobi.com`:

| Sezione | Righe |
|---|---|
| profile | 1 (exists) |
| points_ledger | 269 |
| airdrop_participations | 11 |
| nft_rewards (ROBI+badge) | 10 |
| referral_confirmations | 3 |
| checkins (legacy) | 0 |
| video_views (sospeso Alpha) | 0 |

Shape JSONB confermato — 7 chiavi tutte presenti, tabelle legacy/sospese
restituiscono array vuoto (non null). Lezione
`feedback_verify_fe_replicate_call`: la verifica finale a UI-click
tuo replica il flow FE reale (token → fetch → Blob → download).

## 3. UI-click checklist per te

1. Apri `https://airoobi.app/dapp` (o la URL prod corrente)
2. Login → tab **Profilo**
3. Scrolla fino a "Privacy & Dati" (sopra Danger zone)
4. Click **"Esporta i miei dati"**
5. Browser scarica `airoobi-export-YYYYMMDD.json`
6. Apri il file → verifica le 7 chiavi presenti + dati coerenti col tuo
   account

Se vedi network error o struttura sbagliata, RS reopen e diagnoso.

## 4. Cosa NON ho toccato

- `delete_my_account()` RPC: invariata, GRANT authenticated invariato
- `dapp.html:1330` bottone "Elimina account" + modal: invariati
- `src/dapp.js:doDeleteAccount()`: invariato
- Tutto il flow Privacy §7 lato delete continua a funzionare come da 11 apr

## 5. Follow-up loggati

- **Stage 2** (tu in project memory): rivedere hard-delete → soft-delete
  quando ARIA→KAS rende vincolante audit trail finanziario. Non urgente.
- **Privacy §7 lato ROBY**: riscrittura copy per citare i 2 bottoni
  self-service come strada primaria (email fallback). Aspetto la tua
  versione quando vuoi.

## 6. Next Track A · GS-2

Mismatch referral/tier su profilo CEO: "Overview 3 vs tabella utenti 9
vs tier=Bronze (1)". Plan dal `CCP_RS_GoldenSession_Batch1_Batch2_Plan
§Track A · 2`: query manuali sulle 3 fonti per identificare quale è
canonica, fix RPC che divergono.

Parto appena dai OK su GS-4 a UI-click. Se trovi qualcosa di rotto,
priorità reopen GS-4 prima di GS-2.

## RS — paste-ready

```
RS · GS-4 export SHIPPED · pronto UI-click

Commit 57c2e5f su main. Vercel auto-deploy. delete_my_account intatto.

Test path:
1. airoobi.app/dapp → login → Profilo
2. Privacy & Dati card (sopra Danger zone) → "Esporta i miei dati"
3. Download airoobi-export-YYYYMMDD.json
4. Apri JSON → verifica 7 chiavi (profile · points_ledger ·
   airdrop_participations · nft_rewards · referral_confirmations ·
   checkins · video_views) + dati coerenti col tuo account

Smoke pre-push su CEO: shape OK (269 ledger · 11 partecipazioni ·
10 ROBI · 3 referral · 0 legacy).

Footer dapp.html alfa-2026.05.23-4.28.0.

Bridge sync allegata al commit (22 file CLA-CCP del 22-23 May).

Next Track A: GS-2 mismatch referral/tier — parto dopo tuo OK GS-4.
```

## Bottom line

GS-4 export-only chiuso in 1 push come da spec Opzione A. Privacy §7
fully honored. Attendo UI-click verification. GS-2 in standby.

Daje — go-live day, primo item Track A in cassaforte.

Audit-trail: questo file = CCP RS shipping GS-4 export · commit 57c2e5f
· smoke test CEO OK · UI-click checklist · delete intatto · next GS-2
in standby.

---

*CCP · CIO/CTO Airoobi · RS GS-4 export shipped · 23 May 2026 · daje team a 4*
