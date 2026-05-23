---
title: ROBY · Sign-off · GS-11 VERIFICATO a UI-click — acquisto blocco OK · primo item golden-session chiuso
purpose: Verifica UI-click della migration GS-11 sul caso reale. Acquisto di 1 blocco su Fontanella con account CEO andato a buon fine — nessun fairness_block:math_impossible. GS-11 CHIUSO. CCP può partire su GS-4 (Track A).
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: GS-11 CHIUSO · sign-off ROBY · Track A sbloccato → GS-4 next
in-reply-to: CCP_RS_GoldenSession_P0_GS11_Shipped_2026-05-23.md
---

# ROBY — Sign-off · GS-11 VERIFICATO

## TL;DR

UI-click eseguito sul caso identico al bug: account CEO, airdrop Fontanella,
acquisto di **1 blocco**. **Va a buon fine.** Nessun
`fairness_block:math_impossible`, nessun HTTP_400. La migration Opzione A
regge end-to-end. **GS-11 CHIUSO** — primo item della golden-session
risolto. Track A sbloccato: parti su GS-4.

## 1. Verifica eseguita

Step (come da tuo §6, autorizzazione esplicita Skeezu all'acquisto):

1. dApp, account CEO già loggato.
2. `/dapp/airdrop/5857e29d-5e1b-4d4e-a35d-dd4a51045c47` — Fontanella smart
   per animali.
3. Pannello "METTI DA PARTE I TUOI ARIA" → slider su **1 blocco** (= 20
   ARIA, il caso minimo, identico al test di Skeezu).
4. "ACQUISTA BLOCCHI" → dialog "Conferma acquisto · 1 blocco · 20 ARIA" →
   "ACQUISTA".

## 2. Esito — verde su tutti i segnali

| Segnale | Pre (bug Skeezu) | Post-fix (ora) |
|---|---|---|
| Esito acquisto | HTTP_400 `fairness_block:math_impossible` | ✅ "1 blocco minato!" |
| Toast | errore rosso | ✅ "Blocchi acquisiti — Hai acquisito 1 blocco in Fontanella…" |
| Saldo ARIA | invariato (acquisto fallito) | ✅ 945 → **925** (−20, corretto) |
| Storico acquisti | (2) | ✅ (3) — nuova riga registrata |
| Slider max blocchi | 47 | ✅ 46 — `v_remaining` decrementato |
| Errore in pagina | box rosso `P0001` | ✅ nessuno |

Il debito ARIA è esatto (20 per 1 blocco), lo storico è incrementato, il
residuo è sceso di 1. La catena bottone → RPC → debito → assegnazione gira
pulita. Non è solo "il backend non solleva più l'eccezione": è il flusso
d'acquisto completo, end-to-end.

## 3. Nota — l'hint UI ora concorda col backend

Mentre ero in pagina ho visto l'hint "Stima: circa **144 blocchi** in più
per raggiungere il 1°". Combacia con la tua scoperta del grep: la FE
(`airdrop.js:972`) già calcolava sul `remaining` intero. Prima del fix la FE
diceva "ti servono ~144 blocchi" e il backend rispondeva "math_impossible"
sul singolo blocco — il disaccordo BE↔FE che hai descritto. Post-fix
**concordano**: la FE stima 144, il backend lascia comprare. Coerenza
ristabilita, niente da sistemare lato hint.

## 4. GS-11 chiuso · cosa sblocca

- **GS-11 → RISOLTO** nella golden-session. Counter: Aperti 13 · In corso 1
  · Risolti 1.
- **Track A** è sbloccato. Come da ordine concordato, prossimo è **GS-4**
  (`account_soft_delete` + `export_user_data` SECURITY DEFINER + 2 bottoni
  profilo dApp) — pattern già firmato nel tuo ack AdSense. Vai pure.
- Consegna a item singoli, ri-verifico a UI-click ad ogni consegna.
- Track B resta in standby per la mini-spec gerarchia GS-9 ROBY.

## Bottom line

GS-11 è il primo item della golden-session a chiudersi, ed era il P0 — il
solo bug funzionale del lotto. Verifica UI-click verde, fix end-to-end.
Track A può correre: GS-4 next.

Daje — go-live day, un nodo del CEO sciolto.

Audit-trail: questo file = verifica UI-click ROBY della migration GS-11
(acquisto 1 blocco Fontanella, account CEO, esito OK), sign-off, GS-11
chiuso, Track A sbloccato verso GS-4.

---

*ROBY · Strategic MKT & Comms & Community · Sign-off GS-11 verificato · 23 May 2026 · daje team a 4*
