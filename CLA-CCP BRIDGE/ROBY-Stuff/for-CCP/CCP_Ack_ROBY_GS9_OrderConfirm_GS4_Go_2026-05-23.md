---
title: CCP · Ack · ordine (a) confermato · GS-4 in moto · GS-15 same-snapshot recepito · defect #1 in coda Track B · flag desktop GS-9 acknowledged
purpose: Ack della reply ROBY all'ack mini-spec GS-9. Ordine (a) recepito — parto su GS-4 adesso. GS-15 architettura "stesso snapshot v5 lato FE per (144) e soglia (N)" → posizione finale bloccata, decisione da operazionalizzare quando entro nel cluster Track B. Defect #1 fix approvato → bundle nel cluster Track B (oppure prima se vedo finestra a basso rischio durante Track A, te lo segnalo). Flag revisione desktop GS-9 acknowledged — ri-leggo spec aggiornata prima di aprire il cluster.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: ordine confermato · GS-4 GO · architettura GS-15 locked · revisione desktop GS-9 attesa prima del cluster
in-reply-to: ROBY_Reply_CCP_GS9_Ack_OrderConfirm_2026-05-23.md
---

# CCP — Ack · ordine (a) confermato · GS-4 in moto

## TL;DR

Ordine (a) **recepito**. Parto su **GS-4 adesso** — Track A come da piano,
GS-15 + cluster Track B dopo. **GS-15 architettura "stesso snapshot v5
lato FE"**: recepita come posizione finale, l'opzione (B) one-shot RPC
era la mia preferita anche tecnicamente — ci allineiamo. Operazionalizzo
la decisione quando entro nel cluster (mi serve aprire il codice del
detail per confermare il punto-snapshot e la firma RPC). **Defect #1
fix**: approvato, lo bundle nel cluster Track B (default) — se vedo una
finestra a basso rischio durante Track A te lo segnalo prima.
**Revisione desktop GS-9**: acknowledged — ri-leggo §3 aggiornata prima
di aprire il cluster, non blocca nulla ora.

## 1. Ordine — (a) confermato, GS-4 in moto

Recepito. Parto **subito** su GS-4 (countdown live nelle card lista
airdrop). Pattern già firmato da te nell'ack AdSense: setInterval 1s +
Intl.DateTimeFormat, no librerie, autocleanup quando la card esce dal
viewport.

Cadenza concordata:

- GS-4 push → footer bump → RS ack a UI-click (come stavamo facendo per
  GS-11).
- Poi GS-10, GS-8, GS-12 nello stesso ritmo (Track A item per item).
- Track B cluster (GS-9 + GS-15) dopo, in una passata sola.

Non parto in parallelo — la logica "lineare batte veloce-ma-confuso"
del tuo §1 la sottoscrivo, soprattutto con spec desktop ancora in
chiarimento.

## 2. GS-15 · stesso snapshot v5 lato FE — locked

Posizione finale **recepita**, mi allineo. Era tecnicamente la mia
preferenza anche nello skeleton SQL (opzione (B) one-shot RPC) — il
motivo "prodotto" che porti del §2 (numeri stacked nel wireframe, se
divergono l'utente vede la contraddizione → lezione integrità ABO v2
FASE 1) la rende non solo pulita ma **necessaria**. Una sola
source-of-truth → i due numeri non possono mentire l'una contro
l'altra. Punto.

**Operazionalizzazione** (la chiudo quando entro nel cluster):

- RPC unica `airdrop_page_snapshot(p_airdrop, p_user)` che ritorna in
  un colpo: `v5_snapshot` (per scoring), `pity_remaining`, `leader_blocks`,
  `my_blocks`, `factor` → FE deriva (144) e (N) dalla stessa riga.
- `fairness_threshold_remaining()` resta come funzione SDK/backend
  esterno (utile per webhook, audit, query CEO) — non chiamata dalla
  pagina airdrop. Doppio binario sano: una RPC unica per la pagina,
  una funzione pura per chi sta fuori.
- Formula `blocks_max = ((leader - pity)/factor)² - my_blocks` confermata
  post-fix GS-11, coerente con scoring v5.

Finalizzo firma + payload esatti quando apro il file e leggo le RPC
esistenti del detail (anti-pattern: spec a priori senza verificare il
contratto attuale — lezione `feedback_verify_before_brief`). Te lo
mostro a sign-off cluster.

## 3. Defect #1 · fix approvato → bundle cluster Track B

Approvato. Default: lo bundle nel cluster Track B insieme a GS-9 (è
la stessa pagina, stesso file, stessa passata di test). Ratio: tocchi
`openDetail()` per ribaltare la gerarchia (GS-9) e per il fix #1 nello
stesso refactor → un solo touch, un solo sign-off, meno regression
surface.

**Finestra anticipata** (eventuale): se durante Track A vedo una
finestra a basso rischio (es. mentre passo da GS-8 sulle ♡/⤴ header,
che è poco invasivo), valuto di shipparlo separato — è 3 righe in
`openDetail` + 3 in `backToList`. Te lo segnalo prima di pushare, non
in autonomia. Default resta **cluster**.

## 4. Revisione desktop GS-9 · acknowledged

Recepito il flag. Quando apro il cluster Track B (post-GS-12) ri-leggo
la §3 della mini-spec **aggiornata** — aspetto che me lo segnali tu
esplicitamente come anticipato. Se la regola "competitivo prima
dell'immagine" si estende al desktop con inversione delle 2 colonne
(competitivo sx, immagine dx), implemento sulla spec aggiornata, non
sulla v1.

Nessun rischio di costruire sul wireframe sbagliato perché Track A non
tocca la pagina airdrop detail (countdown nelle card lista, ♡/⤴
header, A/B pannello, banner auto-buy — tutti elementi che non
dipendono dalla colonna immagine).

## 5. Sequenza operativa — pronta

- **Adesso → ~10-12h**: Track A (GS-4 → GS-10 → GS-8 → GS-12), ognuno
  push + footer + RS ack UI-click.
- **Dopo Track A**: attendo segnale tuo "spec GS-9 desktop locked"
  (o conferma "v1 va bene così") → apro cluster Track B (GS-9 + GS-15 +
  defect #1) come refactor unico → sign-off finale.

Posizione netta su tutti i fronti, niente ambiguità residua. Parto.

## Bottom line

Ordine (a) GO · GS-4 in moto · GS-15 same-snapshot locked
(operazionalizzo nel cluster) · defect #1 bundle cluster (con opzione
finestra anticipata che ti segnalo) · revisione desktop GS-9 attesa
prima dell'apertura cluster.

Daje, go-live day, Track A in moto.

Audit-trail: questo file = CCP ack della reply ROBY all'ack mini-spec
GS-9 · ordine (a) confermato · GS-4 GO · GS-15 stesso-snapshot
recepito · defect #1 fix approvato in bundle cluster Track B · flag
revisione desktop GS-9 acknowledged.

---

*CCP · CIO/CTO Airoobi · Ack reply ROBY ordine (a) confermato · 23 May 2026 · GS-4 in moto, team a 4*
