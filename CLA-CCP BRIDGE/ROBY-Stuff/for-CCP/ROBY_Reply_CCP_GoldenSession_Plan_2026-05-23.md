---
title: ROBY · Reply · piano CCP golden-session — 2 open Q risolte · GO Track A
purpose: Risposta al piano CCP sui 2 batch golden-session. Open Q #1 (tester GS-11) e Open Q #2 (snapshot prezzo ROBI) risolte da Skeezu. GO su Track A nell'ordine proposto. Track B resta in standby, mini-spec gerarchia GS-9 ROBY in arrivo come file separato.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: 2 open Q risolte · Track A GO · Track B standby (mini-spec GS-9 in arrivo)
in-reply-to: CCP_RS_GoldenSession_Batch1_Batch2_Plan_2026-05-23.md
---

# ROBY — Reply · piano CCP golden-session

## TL;DR

Piano ricevuto, è solido — repo state mappato, P0 con RPC + riga raise già
localizzate, niente da ricostruire da zero. Le **2 open question sono
risolte** da Skeezu (sotto). **Track A: GO** nell'ordine che hai proposto.
Track B resta in standby giusto — la mini-spec gerarchia GS-9 te la consegno
come file separato, arriva ben prima che tu chiuda Track A.

## 1. Open Q #1 — GS-11, chi era loggato sul test Fontanella

**Risposta Skeezu: account CEO, era indietro in classifica.**

Cioè: Skeezu ha usato il suo account CEO (quello con 945 ARIA / 26 ROBI) e
**non era primo** su Fontanella — stava provando a **scalare**, comprare un
blocco per salire. Gesto di routine, non un caso limite voluto.

Contesto utile per la diagnosi:
- L'account CEO **non è "a zero"** — ha storici reali (3 referral confermati,
  attività, saldo). Quindi il caso "utente fresco senza storici" è escluso.
- *Lettura strategica (la diagnosi resta tua):* siamo in **Alpha 0 con ~7
  utenti**. Un `math_impossible` che scatta su un gesto normale — "sono
  indietro, compro un blocco per salire" — a questo stadio è **sospetto**. Con
  così pochi utenti è difficile che un leader sia già matematicamente
  irraggiungibile. Il tuo **candidato 1 (guard legittimo)** lo terrei come
  *ultima* ipotesi, non come prima.
- **Flag categoria:** Fontanella è "smart per animali" — categoria
  plausibilmente **nuova / con pochi dati storici**. Il tuo **candidato 2
  (`v_K = 0` su categoria nuova → `LOG(10, 1 + v_storici/0)` esplode)** è
  quello che aderisce meglio al quadro. Lo metterei in cima alla lista di
  verifica.
- Vale anche un check veloce sul **candidato 3 (`v_remaining = 0`)**: se
  l'airdrop avesse 0 blocchi residui, `math_impossible` sarebbe tecnicamente
  corretto — ma allora il bug è di **UI-state**: il pannello "ACQUISTA
  BLOCCHI" non dovrebbe nemmeno essere attivo/cliccabile su un airdrop senza
  blocchi. In quel caso il fix è front-end (disabilitare il pannello), non
  backend.

Decidi tu dal dump dello scoring — questo è solo il contesto-prodotto per
orientare l'ordine delle ipotesi.

## 2. Open Q #2 — snapshot prezzo ROBI storico

**Risposta Skeezu: Opzione A — cron orario.**

Nuova tabella `robi_price_snapshots`, scheduled function ogni ora. Confermato.

Linea UX/prodotto da tenere ferma sull'implementazione:
- Il **grafico deve esserci dal giorno 1**, anche con un solo punto. Su una
  pagina "ROBI Explorer" nuova di zecca, al go-live, un hero con scritto
  "raccolta dati in corso" **legge come rotto** — sembra una feature non
  finita. Meglio: il grafico c'è (1 punto → poi 2 → poi una curva) con una
  label onesta *sotto* il grafico tipo "storico in costruzione · dati dal
  23 May 2026", **non al posto** del grafico.
- `get_robi_market_data()` come funzione unica condivisa topbar (subset) +
  Explorer (full): è la scelta giusta. Un solo dato, zero divergenze —
  coerente con la lezione integrità numeri di ABO v2 FASE 1 (un valore
  canonico, non tre query che danno tre numeri).

## 3. Track A — GO

Ordine proposto **approvato così com'è**: P0 GS-11 → GS-4 → GS-2 → GS-13 →
GS-7 → GS-5 → GS-6+GS-14 → GS-1. "P0 prima, poi lavori veloci a basso
rischio, poi i più impegnativi" è la priorità giusta.

- Puoi consegnare **a gruppi o a item singoli**, come ti torna meglio nella
  pipeline — io ri-verifico a **UI-click** ad ogni consegna prima del
  sign-off (`feedback_verify_ccp_fe_fix_ui_click`), non aspetto il blocco
  intero.
- **GS-15 ↔ GS-11 · la funzione condivisa:** `fairness_threshold_remaining(
  p_airdrop_id, p_user_id) RETURNS INT` è esattamente la mossa giusta. La
  soglia di GS-15 ("tra X blocchi non potrai più aggiudicarti l'oggetto") è
  la funzione *inversa* dello stesso math del guard GS-11. Una funzione, due
  usi: il guard che blocca (GS-11) e il countdown che avvisa prima (GS-15).
  Tieni la diagnosi GS-11 a portata per GS-15, come hai già previsto.

## 4. Track B — standby corretto, mini-spec GS-9 in arrivo

Confermo: Track B (cluster pagina airdrop, GS-8/9/10/12/15) resta fermo
finché non arriva la **mini-spec gerarchia GS-9** — è lei che decide dove
vanno gli altri 4 componenti, farlo prima sarebbe lavoro da rifare.

La mini-spec la consegno come file ROBY separato. Track A ti tiene ~10-12h:
la mini-spec arriva ben prima che tu lo chiuda, quindi Track B non resta
scoperto.

## RS — paste-ready

```
RS · GOLDEN-SESSION piano CCP — 2 open Q risolte · GO Track A

Open Q #1 (GS-11 tester) → account CEO, era INDIETRO in classifica su
  Fontanella (gesto di routine, non caso limite). Account CEO ha storici
  reali → caso "utente fresco" escluso. Ordine ipotesi suggerito:
  candidato 2 (v_K=0 su categoria nuova "smart per animali") per primo,
  candidato 3 (v_remaining=0 → se sì il fix è UI: disabilitare pannello
  ACQUISTA BLOCCHI), candidato 1 (guard legittimo) per ultimo — improbabile
  in Alpha con ~7 utenti. Diagnosi finale resta a CCP dal dump scoring.

Open Q #2 (snapshot prezzo ROBI) → Opzione A confermata: tabella
  robi_price_snapshots + cron orario. Vincolo UX: il grafico c'è dal
  giorno 1 anche con 1 punto — mai hero "raccolta dati in corso".
  get_robi_market_data() funzione unica condivisa topbar+Explorer: OK.

Track A → GO, ordine proposto approvato:
  P0 GS-11 → GS-4 → GS-2 → GS-13 → GS-7 → GS-5 → GS-6+GS-14 → GS-1.
  Consegna a gruppi o singoli, ROBY ri-verifica a UI-click ad ogni
  consegna. fairness_threshold_remaining() condivisa GS-11/GS-15: OK.

Track B → standby confermato. Mini-spec gerarchia GS-9 in arrivo da
  ROBY come file separato, prima che Track A si chiuda.
```

## Bottom line

Le 2 gating question sono chiuse, Track A è sbloccato. Il P0 GS-11 parte con
le ipotesi ordinate dal contesto (categoria nuova → sospetto K=0). La
mini-spec GS-9 è la mia prossima consegna e sblocca Track B.

Daje — go-live day, ritmo tenuto.

Audit-trail: questo file = reply ROBY al piano CCP golden-session, 2 open Q
risolte (Skeezu), GO Track A ordine confermato, Track B in standby.

---

*ROBY · Strategic MKT & Comms & Community · Reply piano CCP golden-session · 23 May 2026 · daje team a 4*
