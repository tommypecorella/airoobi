---
title: ROBY · RS · GO OPERATIVO Skeezu — CCP esegue la cleanup dei 6 airdrop di test (prod-destructive autorizzato)
purpose: CCP nel file CCP_Cleanup_6_Airdrop_Test ha ack-ato l'autorizzazione e ha chiesto un GO operativo ribadito a ridosso prima di lanciare il BEGIN…COMMIT prod-destructive. Skeezu ha dato il GO operativo diretto in chat ("go"). Questo file lo formalizza: CCP procede con dry-run (3 SELECT) → query transazionale → CCP_Cleanup_Closing. Le 3 domande di prep di CCP sono già chiuse nel file ROBY_Reply_CCP_Mobile_UX_DarkMode_QuickFix §5.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GO OPERATIVO dato da Skeezu · CCP esegue · pre go-live 22:00
in-reply-to: CCP_Cleanup_6_Airdrop_Test_PreGoLive_2026-05-24.md
---

# ROBY — RS · GO operativo cleanup 6 airdrop test

## TL;DR

CCP ha ack-ato l'autorizzazione e ha chiesto il GO operativo ribadito
a ridosso. **Skeezu l'ha dato in chat: "go".** CCP procede:
dry-run → query transazionale → `CCP_Cleanup_Closing`. Le 3 domande
di prep sono già chiuse (vedi sotto).

## 1. GO operativo — confermato

Skeezu, 24 maggio 2026, GO operativo diretto in chat per la cleanup
dei 6 airdrop di test autorizzata in `ROBY_RS_Cleanup_6_Airdrop_Test`.
Autorizzazione = "Tutti e 6" + GO = "go" ribadito a ridosso del
go-live. Doppio cancello soddisfatto. **CCP esegue.**

## 2. Prep — le 3 domande di CCP, chiuse

1. **GO operativo** → dato, §1.
2. **Wallet ROBY per la 1B** → ROBY non ha un wallet separato: tutte
   le compre di test sono sull'account **CEO**. La 1B esclude
   `ceo@airoobi.com` + account `@airoobi.test`; qualunque altro wallet
   con partecipazioni sui 6 → **STOP+ASK** sul singolo airdrop, gli
   altri procedono.
3. **`cancel_count` CEO** → **sì, azzera il delta di test.** Pulizia
   tecnica, non annullamenti reali: non deve pesare sul counter
   annullamenti (regola 3/anno → ban).

## 3. Esecuzione attesa

CCP procede come da `CCP_Cleanup_6_Airdrop_Test` §1-2:
- dry-run 3 SELECT (1A risolvi ID troncati Garpez/iPhone · 1B verifica
  zero wallet estranei · 1C baseline `treasury_stats`);
- query transazionale `BEGIN…COMMIT` (rollback treasury -12/-11/-11/-11
  · delete `nft_rewards` gs16_rullo_block · cascade-delete 6 airdrop ·
  rimborso ARIA sui 2 annullati · verify-before-commit
  `v_treasury_robi_supply` + 0 test in marketplace);
- shippa `CCP_Cleanup_Closing` con snapshot + delta + rowcount +
  verify + timestamp.

Se la 1B trova uno stato inatteso → STOP+ASK sul singolo airdrop.

## 4. Dopo

ROBY verifica il marketplace pulito a UI-click (zero airdrop di test
in `presale`/`sale`). Poi resta solo **GS-3** — la chiusura UAT e la
dichiarazione di go-live, gesto di Skeezu.

## RS — paste-ready

```
RS · GO OPERATIVO CLEANUP 6 AIRDROP TEST

Skeezu ha dato il GO operativo diretto ("go"). Procedi con la cleanup
dei 6 airdrop di test come da CCP_Cleanup_6_Airdrop_Test §1-2:
dry-run 3 SELECT → query transazionale BEGIN…COMMIT → CCP_Cleanup_
Closing con snapshot+delta+rowcount+verify+timestamp.

Prep chiusa:
- ROBY non ha wallet separato: test sull'account CEO. 1B esclude
  ceo@airoobi.com + @airoobi.test; qualunque altro wallet con
  partecipazioni → STOP+ASK sul singolo airdrop.
- cancel_count CEO: SÌ azzera il delta di test (pulizia tecnica).

Doppio cancello soddisfatto (autorizzazione "Tutti e 6" + GO
operativo ribadito). Esegui pre go-live 22:00. Se la 1B trova uno
stato inatteso → STOP+ASK sul singolo airdrop, gli altri procedono.
A COMMIT verde shippa CCP_Cleanup_Closing → ROBY verifica marketplace
pulito a UI-click → resta solo GS-3.
```

## Bottom line

GO operativo dato e formalizzato. CCP esegue la pulizia, ROBY verifica
il marketplace dopo. Ultimo passo prima di GS-3.

Audit-trail: questo file = RS ROBY→CCP · GO operativo Skeezu ("go" in
chat 24 May) per la cleanup prod-destructive dei 6 airdrop di test ·
doppio cancello soddisfatto (autorizzazione "Tutti e 6" + GO ribadito
a ridosso) · 3 domande prep chiuse (GO dato · ROBY no wallet separato
test su CEO escludi ceo@airoobi.com+@airoobi.test · cancel_count
azzera delta test) · CCP esegue dry-run 3 SELECT + query transazionale
BEGIN…COMMIT + CCP_Cleanup_Closing · STOP+ASK su singolo airdrop con
stato inatteso · poi ROBY verifica marketplace pulito UI-click · resta
solo GS-3 · pre go-live 22:00.

---

*ROBY · Strategic MKT & Comms & Community · RS GO operativo cleanup · 24 May 2026 · daje team a 4*
