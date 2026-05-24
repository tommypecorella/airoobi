---
title: ROBY · RS · smoke test esaustivo pre go-live — richiesta a CCP
purpose: Skeezu vuole il go-live entro le 22 di oggi. Prima del lancio, CCP esegue uno smoke test esaustivo end-to-end di tutta la dApp + backend: auth, ciclo airdrop completo, buy_blocks + fairness guard, rullo (seeding + accredito), treasury, ROBI, messaggi, ABO RBAC, le migration recenti (GS-16 rullo, GS-15 reopen v4). Output: un report CCP con verde/rosso per area. In parallelo ROBY fa il test UX a viewport mobile.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: RS smoke test esaustivo · pre go-live (target 22:00) · CCP esegue + report
---

# ROBY — RS · smoke test esaustivo pre go-live

## TL;DR

Skeezu: go-live **entro le 22 di oggi**. Prima del lancio CCP fa uno
**smoke test esaustivo** end-to-end — backend + flussi critici — e
riferisce verde/rosso per area. In parallelo ROBY testa la UX a
viewport mobile. Niente sorprese al primo utente reale.

## 1. Aree da coprire — smoke test CCP

**Auth & sessione**
- Registrazione · login · logout · refresh sessione · path anonimo
  (SSR) preservato.

**Ciclo airdrop completo** (l'iter-prodotto centrale)
- FAI VALUTARE: submit oggetto → valutazione → approvazione ABO →
  airdrop pubblicato.
- Presale → sale → acquisto blocchi → chiusura.
- `buy_blocks` v6: acquisto OK · fairness guard `check_fairness_can_buy`
  (no `fairness_block:math_impossible` su casi legittimi, GS-11) ·
  decremento ARIA · score.

**Rullo ROBI (GS-16)**
- `tf_airdrop_seed_rullo`: seeding formula B alla transizione
  `accettato→presale/sale`.
- `buy_blocks` accredito istantaneo ROBI del rullo + voce
  `nft_rewards` + storico.
- Guardrail anti-inflazione: `treasury_stats.robi_rullo_seeded/
  redeemed` aggiornati · `v_treasury_robi_supply` coerente.

**Soglia / fairness (GS-15 reopen v4)**
- `fairness_threshold_remaining` coerente col guard · sentinel `-1` ·
  i 4 stati FE di `loadHintSoglia` (corsa / cima / al limite / fuori).

**Closure v3**
- Chiusura per scadenza naturale + esito (vincitore / consegna /
  consolazione) · `process_seller_acknowledge` · Caso A/B · timeout
  72h · annullamento + rimborso ARIA + counter.

**Treasury & token**
- ARIA daily grant · conversioni KAS↔ARIA↔ROBI · valore nominale ROBI
  · snapshot orario `/explorer-robi`.

**Messaggi**
- `airdrop_messages` invio/lettura · RLS (utente vede i propri, admin
  tutti) · split bolle.

**ABO**
- RBAC `get_user_visible_modules` · gating azioni per ruolo · le 13
  sezioni · EVALOBI Registry.

**Migration recenti applicate**
- GS-16 (3 migration rullo) · GS-15 reopen v4 · verifica nessuna
  migration pendente, schema allineato a prod.

**Console & rete**
- Zero errori JS in console nei flussi sopra · nessuna chiamata 4xx/5xx
  non gestita.

## 2. Output richiesto

Un file `CCP_SmokeTest_PreGoLive_*.md` con, per ogni area, **verde /
rosso** + nota. Se esce un rosso → STOP+ASK prima del go-live. Se
tutto verde → semaforo verde lato backend per il lancio.

## 3. Nota di scope

Lo smoke test è **verifica**, non nuovo sviluppo: niente fix dentro
questo giro salvo rossi critici bloccanti. Il redesign (dark mode,
banner, UX) è ondata separata post-lancio — non entra qui.

## RS — paste-ready

```
RS · SMOKE TEST ESAUSTIVO PRE GO-LIVE (target 22:00)

Skeezu: go-live entro le 22 oggi. Prima del lancio esegui uno smoke
test ESAUSTIVO end-to-end e rispondi con CCP_SmokeTest_PreGoLive_*.md
(verde/rosso per area):

- Auth: registrazione/login/logout/refresh/path anonimo SSR.
- Ciclo airdrop: FAI VALUTARE submit→valutazione→approvazione ABO→
  pubblicato; presale→sale→acquisto→chiusura.
- buy_blocks v6: acquisto OK, fairness guard (no math_impossible su
  casi legittimi), ARIA decrement, score.
- Rullo GS-16: trigger seeding formula B; buy_blocks accredito ROBI
  istantaneo + nft_rewards + storico; guardrail treasury_stats
  robi_rullo_seeded/redeemed + v_treasury_robi_supply.
- Soglia GS-15 v4: fairness_threshold_remaining coerente col guard,
  sentinel -1, 4 stati FE loadHintSoglia.
- Closure v3: chiusura scadenza + esito, process_seller_acknowledge,
  Caso A/B, timeout 72h, annullamento+rimborso+counter.
- Treasury/token: ARIA daily, KAS↔ARIA↔ROBI, valore ROBI, snapshot
  /explorer-robi.
- Messaggi: airdrop_messages invio/lettura, RLS, split bolle.
- ABO: RBAC get_user_visible_modules, gating per ruolo, 13 sezioni,
  EVALOBI Registry.
- Migration: GS-16 + GS-15 reopen v4 applicate, nessuna pendente.
- Console/rete: zero errori JS, nessun 4xx/5xx non gestito.

Se esce un rosso bloccante → STOP+ASK prima del go-live. Se tutto
verde → semaforo verde backend per il lancio. È verifica, non nuovo
sviluppo (niente fix salvo rossi critici). Redesign dark/banner/UX =
ondata separata post-lancio, fuori da questo giro.

In parallelo ROBY testa la UX a viewport mobile.
```

## Bottom line

CCP smoke-testa esaustivamente il backend e i flussi critici prima
delle 22; ROBY testa la UX mobile in parallelo. Doppio controllo, poi
si lancia. Redesign fuori scope di questo giro.

Audit-trail: questo file = RS smoke test esaustivo pre go-live ·
richiesta a CCP report verde/rosso per area (auth · ciclo airdrop ·
buy_blocks+guard · rullo GS-16 · soglia GS-15 v4 · Closure v3 ·
treasury/token · messaggi · ABO RBAC · migration recenti · console/
rete) · output CCP_SmokeTest_PreGoLive · rosso bloccante → STOP+ASK ·
verifica non sviluppo · redesign post-lancio fuori scope · ROBY in
parallelo test UX mobile · target go-live 22:00.

---

*ROBY · Strategic MKT & Comms & Community · RS smoke test esaustivo · 24 May 2026 · daje team a 4*
