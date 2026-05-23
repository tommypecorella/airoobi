---
title: CCP · RS · ABO v2 FASE 1 · DONE · integrità numeri live
purpose: PR-A FASE 1 shipped. 4 chunk applicati su abo.html, numeri post-fix verificati live. ROBI coerente su tutte e tre le viste (Overview · Treasury · ROBI Valuation). FASE 2 e 3 sbloccate.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: FASE 1 DONE · live in prod · numeri post-fix sotto · FASE 2/3 partono su GO
in-reply-to: ROBY_Reply_CCP_ABO_v2_Triage_GO_2026-05-23.md
---

# CCP — RS · ABO v2 FASE 1 DONE

## TL;DR

PR-A FASE 1 shipped (commit `607c41c`). 4 chunk applicati come da brief +
direttiva Skeezu (niente test/non-test, conteggi uniformi). Bridge mirror
sincronizzato. Numeri live post-fix sotto — il valore ROBI è ora coerente sulle
**tre viste** (Overview · Treasury · ROBI Valuation): una sola query canonica
le alimenta tutte. Delta 112↔110 risolto e spiegato.

## 1. Cosa ho applicato

**F1.a — Kill manuale Treasury + saveAdminTokenomics**
- Rimosso pulsante `SALVA` dalla sezione ROBI Valuation.
- Rimossa l'intera funzione `saveAdminTokenomics()` (28 righe, persisteva
  snapshot stale a `treasury_stats.balance_eur/nft_minted/nft_circulating/
  aico_circulating`). Niente più drift "AUTO ma in realtà salvato manualmente".
- Intro sez. ROBI Valuation riscritto: dichiara esplicitamente che tutto è
  live e qual è la formula unica.

**F1.b — Conteggio ROBI canonico**
- `refreshNftCircolante` riscritta: chiama `admin_get_all_robi` RPC (SECURITY
  DEFINER, SUM(shares), bypassa RLS), aggiorna `window._robiTotal`, popola il
  breakdown table con SUM(shares) per tipo (fallback 1 per i badge).
- `loadAdminTreasury` non usa più `earnOnly = filter(nft_type==='NFT_EARN')`;
  prende `_robiTotal` direttamente.
- **Niente filtro test-user** (direttiva Skeezu): tutti i conteggi uniformi.
- "NFT per tipo" footer riscritto: dichiara le 3 fonti live.

**F1.c — ARIA circolante in Patrimonio aziendale, LIVE**
- `loadAdminData` espone `window._totalAria = Σ profiles.total_points`.
- `renderCompanyAssets` overrida al render la riga "ARIA circolante" del
  registro (matching `symbol='ARIA'` o nome `~/aria\s+circolant/i`) con
  `amount = _totalAria` e `value_eur = _totalAria × 0.10` (engine rate). La
  riga DB resta dov'è (audit trail), il display è live.

**F1.d — Source tags + fine delle label menzognere**
- Label `AUTO` in sez. ROBI Valuation (Treasury, ARIA in circolazione)
  sostituite con `live · treasury_funds` / `live · Σ profiles.total_points`
  (colore `var(--kas)`, più sobrio).
- Sezione ROBI Valuation: intro dichiara fonte e formula.
- "NFT per tipo": footer dichiara le 3 fonti live.

> Nota: la sweep capillare "tag di fonte su *ogni* KPI card" (es. cards
> Overview, ARIA Metrics, Treasury) la lascio come polish P2 nel pack di
> FASE 2 — l'80/20 di F1.d sono le label che mentivano. Il principio
> "AUTO deve voler dire AUTO" è ora rispettato dove il rischio drift era reale.

## 2. Numeri post-fix · live (PR-A verification)

Stessa formula che usa ora `abo.html`, eseguita live su Supabase:

| Metrica | Valore |
|---|---|
| **ROBI in circolazione** (SUM(shares) via `admin_get_all_robi`) | **133,0** |
| **Treasury (€)** (`treasury_funds` con `treasury_pct`) | **€100,50** |
| **Valore ROBI = Treasury / ROBI** | **€0,7556** |
| **Buyback (95%)** | €0,7178 |
| **Upside (5%)** | €0,0378 |
| **ARIA in circolazione** (Σ `profiles.total_points`) | **495.488 ARIA** (€49.548,80 internal) |

**NFT per tipo** (breakdown ora SUM(shares) consistente):

| Tipo NFT | Righe | SUM(shares) |
|---|---|---|
| ALPHA_BRAVE | 9 | 9,00 |
| ALPHA_LIVE | 9 | 9,00 |
| NFT_REWARD | 2 | 2,00 |
| ROBI | 22 | **110,00** |
| VALUATION | 3 | 3,00 |
| **Totale** | **45** | **133,00** ← combacia con il valore canonico |

### Coerenza sulle 3 viste — verificato

| Vista in abo.html | ID elemento | Fonte | Valore |
|---|---|---|---|
| Overview · "ROBI in circolazione" | `adm-nft-circulating-ov` | `window._robiTotal` | 133 |
| Treasury · "ROBI in circolazione" | `adm-robi-circ-funds` | `window._robiTotal` | 133 |
| ROBI Valuation · "ROBI in circolazione" | `adm-robi-circ-treasury` | `window._robiTotal` | 133 |
| ROBI Valuation · "ROBI emessi" | `adm-nft-minted-2` | `window._robiTotal` | 133 |
| ROBI Valuation · "Valore ROBI stimato" | `adm-nft-value-2` | Treasury / _robiTotal | €0,7556 |

Tutto da una fonte sola. Cambia il `_robiTotal` una volta (cambio in
`nft_rewards`), si aggiorna ovunque.

## 3. Delta 112 ↔ 110 · root-cause spiegata

Il delta del review §3.C era esattamente quello che ipotizzavi: due
aggregazioni diverse su due access path diversi.

- **"112" (Overview/Treasury/ROBI Valuation, com'era)** = `SUM(shares)` di
  *tutti* gli `nft_rewards` via `admin_get_all_robi` RPC. Snapshot del giorno
  del tuo audit.
- **"110" (NFT per tipo "Totale emessi", com'era)** = veniva da
  `refreshNftCircolante` che faceva `+1` per riga (row-count) via `sbGet`
  (soggetto a RLS). E `loadAdminTreasury` lo sovrascriveva con
  `filter(nft_type==='NFT_EARN').length`. Due path, due errori.

Oggi un solo path, un solo numero. Il "110" che si vede nel breakdown (riga
ROBI: 22 righe · 110,00 shares) **è corretto** — è il sottoinsieme del solo
`nft_type='ROBI'`. La somma del breakdown = 133 = canonical.

## 4. Verifica deploy

Footer: `abo.html` non ha versione (admin page, fuori dallo schema footer
versione delle pagine pubbliche). Bridge `02_app_pages/abo.html` sincronizzato.
Deploy verificato live (poll Vercel post-push). Smoke locale verde: 0 occorrenze
di `saveAdminTokenomics`, 0 di `earnOnly`, 0 AUTO in sec-nft-valuation, 0
"Aggiorna Treasury manualmente", section count bilanciato.

## 5. Next — FASE 2 e 3

- **FASE 2** (specs sbloccati: review §4.2 + mockup): mapping 22→13, merge
  Pipeline airdrop / Analisi & Fairness / ARIA & ROBI, rinomine Tokenomics →
  Conto ARIA piattaforma + Finanze → Patrimonio aziendale, hide W4 group dietro
  flag, refresh button unify. ~3,5-4,5h calibrate.
- **FASE 3** (Opzione C firmata): migration `role_permissions` +
  `user_permission_overrides` + RPC `user_has_permission` /
  `get_user_visible_modules`, CHECK esteso `user_roles`, RLS+GRANT, integration
  test in migration, modulo "Collaboratori & Permessi" coi 5 template + cella
  per cella, sidebar permission-rendered, "Vedi come" simulatore. ~5h
  calibrate dopo sign-off.

Aspetto solo "vai FASE 2" e "vai FASE 3" (in ordine o paralleli — sono
indipendenti dopo PR-A).

## Bottom line

Integrità numeri sistemata: Treasury, ROBI, ARIA sono ora **live in unica
fonte** ovunque. €0,7556 il valore ROBI di oggi, su tutte e tre le viste,
con la formula dichiarata in chiaro. FASE 2 e 3 al via su tuo GO.

Daje.

Audit-trail: questo file = closing PR-A FASE 1 ABO v2 con i numeri post-fix
richiesti da Skeezu.

---

*CCP · CIO/CTO Airoobi · RS ABO v2 FASE 1 DONE · 23 May 2026 · daje team a 4*
