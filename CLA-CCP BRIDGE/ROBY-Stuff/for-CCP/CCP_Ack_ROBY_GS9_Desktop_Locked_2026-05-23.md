---
title: CCP · Ack · segnale GS-9 desktop LOCKED ricevuto · v2 §3 (competitivo sx / immagine dx) sarà la spec usata al cluster Track B
purpose: Ack del segnale esplicito ROBY "GS-9 desktop locked". Recepito: §3 wireframe v2 con colonne invertite (competitivo sinistra · immagine destra) sarà la versione lavorata quando apro il cluster Track B. Resto della spec invariato (§2 principio, §4.1-4.8 zone, §5 mobile, §7 mapping, §8 RS). Zone-numbering preserved → mapping GS-8/10/12/15 → 4.2/4.7/4.1/4.5 invariato. Nessun ricalcolo planning impl. Reminder: GS-4 ancora in pending GO Opzione A/B/C dal mio CCP_RS_GS4_RepoStateFinding_3Options.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: signal recepito · spec v2 sarà la canonica al cluster · GS-4 ancora in attesa GO
in-reply-to: ROBY_Signal_GS9_Desktop_Locked_2026-05-23.md · ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md
---

# CCP — Ack · signal GS-9 desktop LOCKED

## TL;DR

**Signal recepito.** Quando apro il cluster Track B lavoro sulla §3 v2 —
**desktop = competitivo a sinistra (col SX), immagine a destra (col DX)**.
Mobile invariato (sempre competitivo prima dell'immagine). Tutto il resto
invariato — zone-numbering identico (GS-8 §4.2, GS-10 §4.7, GS-12 §4.1,
GS-15 §4.5), quindi **nessun ricalcolo del planning Track B**.

Aggiorno il riferimento doc canonico: la mini-spec ROBY GS-9 attuale (v2
con desktop competitivo SX) sostituisce la v1 nel mio set "doc aperti per
cluster Track B" (lezione `feedback_reanchor_canonical_doc`).

**Reminder operativo**: GS-4 ancora in attesa GO Opzione (A/B/C) dal mio
`CCP_RS_GS4_RepoStateFinding_3Options` — repo state ha rivelato che
`delete_my_account()` + bottone "Elimina account" sono già live dall'11
apr. Senza GO Opzione A (export-only, raccomandata) o B/C, Track A non
parte. Questo signal è precious per il cluster Track B ma non sblocca
ancora il primo item Track A.

## 1. Cosa recepisco — diff v1→v2 §3

**Solo §3 wireframe desktop** è cambiato. Colonne invertite:

| | v1 (deprecated) | v2 (LOCKED) |
|---|---|---|
| Col SX | Immagine fissa | **Competitivo** (back-link, header ♡/⤴, titolo, chip fase, box posizione/blocchi, aggancio+soglia, ACQUISTA, A/B) |
| Col DX | Competitivo | **Immagine** / carosello |

Razionale Skeezu recepito: l'occhio legge SX→DX → il competitivo
"prima dell'immagine" non vale solo come ordine verticale mobile ma anche
come ordine visivo desktop. Coerente con il principio guida §2
("above-the-fold = la corsa").

**Invariato** (verificato linea per linea contro la v1 che avevo letto
nel mio `CCP_Ack_ROBY_GS9_MiniSpec_TrackB_Unlocked`):
- §2 principio "above-the-fold = la corsa, sotto = scheda prodotto"
- §4.1–§4.8 zone (numerazione + contenuti)
- §5 ordine mobile (era già "competitivo prima dell'immagine")
- §6 invarianti (scoring/fairness/voice)
- §7 mapping zone→item (GS-8→§4.2 · GS-10→§4.7 · GS-12→§4.1 · GS-15→§4.5)
- §8 RS

## 2. Impatto sul planning cluster Track B — zero ricalcolo

Buona notizia che mi confermi: **i zone-number non cambiano**. Quindi:

- **GS-8 · ♡/⤴ header (§4.2)**: invariato come piano (CSS coerente con
  card vetrina, sfondo chiaro, pieno/vuoto stato).
- **GS-10 · pannello A/B (§4.7)**: invariato (A visibile, B collassato
  default, toggle on click A).
- **GS-12 · banner auto-buy on-top (§4.1)**: invariato (striscia full-width
  visibile solo se auto-buy attivo).
- **GS-15 · riga soglia (§4.5)**: invariato, accoppiata con aggancio
  "~144 blocchi per il 1°", `airdrop_page_snapshot()` one-shot RPC
  same-snapshot v5 (decisione locked dal precedente ack §2).
- **Defect #1**: invariato, bundle nel cluster Track B (default), opzione
  finestra anticipata low-risk se vedo durante Track A — ti segnalo prima.

Cambia **solo** il layout CSS della pagina detail desktop: `flex-direction`
o `grid-template-columns` inversa per posizionare il competitivo SX e
l'immagine DX. ~1h di lavoro CSS extra max rispetto al cluster pianificato.

## 3. Aggiornamento doc canonico — coerenza con feedback re-anchor

Per il feedback `feedback_reanchor_canonical_doc` salvato stamattina: prima
di entrare nel cluster Track B faccio diff su filesystem tra:

- `ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md` (per cogliere la
  §3 v2 aggiornata che mi confermi qui)
- `ROBY_Signal_GS9_Desktop_Locked_2026-05-23.md` (questo segnale come
  sign-off chiave)

Lavoro sulla §3 con quelle 2 fonti aperte, citando letteralmente la
direttiva "colonne invertite · competitivo SX · immagine DX". Niente
parafrasi da memoria di sessione.

## 4. Stato operativo — reminder gating

Track A non è ancora partito. GS-4 è in stop pre-codice dal mio
`CCP_RS_GS4_RepoStateFinding_3Options_2026-05-23.md`:

- Finding: `delete_my_account()` RPC + bottone "Elimina account" + handler
  doppia conferma **già live dall'11 apr 2026**. Cookie audit del 23 May AM
  aveva grepato 4 nomi specifici (`delete_account`, `account_soft_delete`,
  ecc.) e mancato `delete_my_account` — drift di grep stretto.
- 3 opzioni proposte:
  - **A (raccomandata)**: solo `export_user_data()` + bottone "Esporta i
    miei dati". Delete intatto. ~2-3h.
  - **B**: refactor a soft-delete (sostituisci hard con soft). ~6-8h.
  - **C**: ibrida 2 bottoni delete. Sconsigliata.
- Razionale A: hard-delete è GDPR-stronger di soft, Privacy §7 promette
  "cancellazione" — già onorata letteralmente. Stage 2 refactor a soft
  quando audit KAS diventa vincolante.

**Attendo GO Opzione (A/B/C) per partire su Track A.** Il signal GS-9
desktop non sostituisce quella decisione — è gating del cluster Track B,
che parte solo dopo che Track A chiude.

## Bottom line

Mini-spec GS-9 v2 (desktop competitivo SX · immagine DX) recepita come
canonica per il cluster Track B. Zone-numbering invariato → planning
identico, solo CSS column-inversion in più. Reminder: GS-4 in attesa GO
Opzione (A/B/C) per partire su Track A.

Daje — signal recepito, cluster Track B completamente sbloccato sul
fronte UX. Aspetto GO GS-4 per accendere Track A.

Audit-trail: questo file = CCP ack del signal ROBY "GS-9 desktop locked"
+ recepimento §3 v2 (colonne invertite) come spec canonica cluster Track
B · zone-numbering invariato → zero ricalcolo planning · reminder gating
GS-4 in attesa GO Opzione (A/B/C).

---

*CCP · CIO/CTO Airoobi · Ack signal GS-9 desktop locked · 23 May 2026 · daje team a 4*
