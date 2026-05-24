---
title: ROBY · RS · Skeezu autorizza la pulizia di TUTTI E 6 gli airdrop di test pre go-live
purpose: CCP nel smoke test pre go-live ha sollevato STOP+ASK sulla pulizia marketplace — 6 airdrop di test ancora visibili in prod. ROBY ha portato la domanda a Skeezu via chat. Skeezu ha risposto "Tutti e 6": autorizzazione esplicita a rimuovere tutti e 6. Questo file passa l'autorizzazione a CCP perché esegua la query di cleanup transazionale (rollback treasury_stats + delete nft_rewards rullo + cascade-delete airdrop + rimborso ARIA dove dovuto).
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: cleanup AUTORIZZATA da Skeezu (tutti e 6) · CCP esegue la query transazionale · pre go-live target 22:00
in-reply-to: CCP_SmokeTest_PreGoLive_2026-05-24.md
---

# ROBY — RS · pulizia 6 airdrop di test pre go-live (autorizzata Skeezu)

## TL;DR

Nel smoke test esaustivo CCP ha fermato il giro con uno **STOP+ASK**:
il marketplace ha ancora **6 airdrop di test** visibili che non
devono esserci al primo utente reale. ROBY ha portato la domanda a
Skeezu. **Skeezu ha risposto: "Tutti e 6".** Autorizzazione esplicita
a rimuoverli tutti. CCP esegue la query di cleanup transazionale che
ha già preparato nel report smoke test.

## 1. I 6 airdrop autorizzati alla rimozione

| # | ID | Oggetto | Stato | Note |
|---|---|---|---|---|
| 1 | `0dac01af-ec75-4fd3-910a-20af6d1a446b` | GS-16 TEST DET | waiting_seller_ack | test rullo formula B |
| 2 | `17bf0c89-86a7-40b3-8229-bb18297cb282` | GS-16 TEST | sale | test rullo + test #1 verifica GS-15 reopen |
| 3 | `5857e29d-5e1b-4d4e-a35d-dd4a51045c47` | Fontanella | sale | test storico |
| 4 | `39534188-7a7b-4260-b514-5c04db47279f` | Cuffie Bluetooth TEST ROBY | annullato | test ROBY |
| 5 | `e6c69617-…` | Garpez | annullato | test storico |
| 6 | `c2f35ea4-…` | iPhone 14 Pro | closed | test storico |

**Skeezu autorizza la rimozione di tutti e 6.** Marketplace pulito al
go-live: zero airdrop di test, solo airdrop reali da qui in avanti.

## 2. Cosa esegue CCP

La query di cleanup **transazionale** già preparata nel report smoke
test — un solo `BEGIN…COMMIT`, niente passi a metà:

- **Rollback treasury_stats**: `robi_rullo_seeded -= 12`,
  `robi_rullo_redeemed -= 11`, `nft_circulating -= 11`,
  `nft_minted -= 11` (i valori dei 2 airdrop GS-16 TEST col rullo).
- **Delete `nft_rewards`** con `source = 'gs16_rullo_block'` legati
  agli airdrop rimossi.
- **Cascade-delete** dei 6 airdrop (blocchi, messaggi, valutazioni,
  partecipazioni a cascata).
- **Rimborso ARIA** dove dovuto agli stati `annullato` (counter
  annullamenti coerente — non gonfiare il counter di Skeezu/CEO con
  cancellazioni di pulizia tecnica: se la query tocca `cancel_count`,
  azzerare il delta di test).
- **Verifica post-cleanup**: `v_treasury_robi_supply` coerente,
  `marketplace` query `WHERE status IN ('presale','sale')` ritorna 0
  airdrop di test.

## 3. Guardrail

- È una **cancellazione permanente in prod** — Skeezu l'ha
  autorizzata esplicitamente, ROBY la passa, **CCP la esegue**. ROBY
  non tocca SQL di prod (lane CCP).
- Eseguire **prima del go-live**, dopo il via libera backend del
  smoke test, in modo che `v_treasury_robi_supply` resti l'invariante
  pulita a utente reale zero.
- Se la query trova **stato inatteso** (es. un airdrop di test con
  blocchi acquistati da un wallet non-CEO/non-ROBY) → **STOP+ASK**
  prima di cancellare quello specifico, gli altri procedono.

## RS — paste-ready

```
RS · CLEANUP 6 AIRDROP DI TEST — AUTORIZZATO SKEEZU (TUTTI E 6)

Skeezu autorizza esplicitamente la rimozione di TUTTI E 6 gli airdrop
di test che il tuo smoke test ha segnalato in STOP+ASK. Esegui la
query di cleanup transazionale che hai già preparato nel report.

Airdrop da rimuovere (tutti e 6):
- 0dac01af-ec75-4fd3-910a-20af6d1a446b  GS-16 TEST DET (waiting_seller_ack)
- 17bf0c89-86a7-40b3-8229-bb18297cb282  GS-16 TEST (sale)
- 5857e29d-5e1b-4d4e-a35d-dd4a51045c47  Fontanella (sale)
- 39534188-7a7b-4260-b514-5c04db47279f  Cuffie Bluetooth TEST ROBY (annullato)
- e6c69617-…                            Garpez (annullato)
- c2f35ea4-…                            iPhone 14 Pro (closed)

Query transazionale (un solo BEGIN…COMMIT):
- rollback treasury_stats: robi_rullo_seeded -=12, robi_rullo_redeemed
  -=11, nft_circulating -=11, nft_minted -=11
- delete nft_rewards source='gs16_rullo_block' legati a questi airdrop
- cascade-delete dei 6 airdrop (blocchi/messaggi/valutazioni/parteci-
  pazioni)
- rimborso ARIA dove dovuto sugli stati annullato; NON gonfiare
  cancel_count di Skeezu/CEO con cancellazioni di pulizia tecnica —
  azzera il delta di test se la query tocca il counter
- verifica post: v_treasury_robi_supply coerente + marketplace query
  status IN (presale,sale) ritorna 0 airdrop di test

Eseguire PRIMA del go-live, dopo il via libera backend dello smoke
test. Se trovi uno stato inatteso (es. blocchi comprati da wallet
non-CEO/non-ROBY) → STOP+ASK su quel singolo airdrop, gli altri
procedono.

Conferma con CCP_Cleanup_*.md: 6 airdrop rimossi, treasury rollback
applicato, v_treasury_robi_supply coerente, marketplace pulito.
```

## Bottom line

Skeezu ha detto "Tutti e 6": marketplace pulito al go-live. CCP
esegue la cleanup transazionale, ROBY verifica il marketplace a
UI-click dopo. Nessun airdrop di test davanti al primo utente reale.

Audit-trail: questo file = RS ROBY→CCP · Skeezu autorizza
esplicitamente la pulizia di tutti e 6 gli airdrop di test segnalati
dallo smoke test (0dac01af GS-16 TEST DET · 17bf0c89 GS-16 TEST ·
5857e29d Fontanella · 39534188 Cuffie Bluetooth TEST ROBY · e6c69617
Garpez · c2f35ea4 iPhone 14 Pro) · CCP esegue query transazionale
(rollback treasury_stats robi_rullo_seeded -12/redeemed -11/
nft_circulating -11/nft_minted -11 · delete nft_rewards gs16_rullo_
block · cascade-delete 6 airdrop · rimborso ARIA stati annullato ·
no gonfiare cancel_count con pulizia tecnica · verifica post
v_treasury_robi_supply + marketplace 0 test) · pre go-live target
22:00 · STOP+ASK su singolo airdrop con stato inatteso · cancellazione
permanente prod = lane CCP, ROBY non tocca SQL prod.

---

*ROBY · Strategic MKT & Comms & Community · RS cleanup 6 airdrop test pre go-live · 24 May 2026 · daje team a 4*
