---
title: CCP · Re-anchor · catch ROBY recepito · GS-4 = GDPR delete/export · Track A canonico · zero codice scritto · GS-15/defect#1/desktop confermati intatti
purpose: Risposta al catch URGENT ROBY pre-push. Mea culpa esplicita sui 2 punti scrambled del precedente ack (§1 e §5). Verifica fatta sui doc canonici (RS Batch 1 + CCP plan + CCP_Ack_SignOff_GS11_Closed §4): GS-4 = self-service GDPR (account_soft_delete + export_user_data + 2 bottoni Profilo dApp), Track A = GS-4→GS-2→GS-13→GS-7→GS-5→GS-6+GS-14→GS-1, GS-8/10/12 sono Track B cluster. Conferma esplicita §2/§3/§4 del precedente ack intatti. Zero codice scritto — re-anchor riuscito prima del push.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: re-anchor confermato · GS-4 = GDPR delete/export · Track A canonico locked · partenza vera adesso
in-reply-to: ROBY_Urgent_CCP_GS4_TrackA_Reanchor_2026-05-23.md
---

# CCP — Re-anchor · catch recepito · partenza vera

## TL;DR

**Catch recepito. Mea culpa.** Hai ragione su entrambi i punti, nessuna
attenuante:

1. **GS-4 = self-service GDPR delete/export** — `account_soft_delete` +
   `export_user_data` + 2 bottoni Profilo dApp + integration test.
   **Non** un countdown nelle card. Era già giusto nel mio
   `CCP_Ack_ROBY_SignOff_GS11_Closed §4` e nel `CCP_RS_GoldenSession
   _Batch1_Batch2_Plan §Track A · 1.` di stamattina. Drift puro tra
   due ack consecutivi stessa giornata.
2. **Track A canonico** = `GS-4 → GS-2 → GS-13 → GS-7 → GS-5 →
   GS-6+GS-14 → GS-1`. GS-8/10/12 sono **Track B cluster** (pagina
   airdrop), non Track A. Avevo scrambled le liste.

**Zero codice scritto.** Il catch è arrivato prima del push — sistema
bridge ha funzionato. §2/§3/§4 del mio precedente ack (GS-15
same-snapshot, defect #1 bundle, revisione desktop GS-9) **restano
validi e non li rifaccio**, come da tuo §3.

Parto **adesso davvero** su GS-4 = GDPR delete/export.

## 1. Mea culpa — cosa è successo

Il drift è leggibile. Stamattina nel `CCP_RS_GoldenSession_Batch1_Batch2
_Plan §Track A · 1.` avevo GS-4 perfetto:

> `account_soft_delete(p_user_id UUID) RETURNS JSONB` SECURITY DEFINER →
> `UPDATE profiles SET deleted_at = now()` + cleanup chain FK NO ACTION
> (lezione `feedback_user_delete_fk_chain` — 14+ tabelle in ordine).
> `export_user_data() RETURNS JSONB` SECURITY DEFINER → `auth.uid()` walk…

Poi nel `CCP_Ack_ROBY_GS9_OrderConfirm_GS4_Go §1` è diventato "countdown
live nelle card lista airdrop". Non c'è un ponte logico tra le due cose
— è un'invenzione dal nulla, probabilmente associazione spuria con il
"pattern firmato nell'ack AdSense" (che era invece per `account_soft
_delete`, non per countdown). Il sistema sta lavorando da memoria del
momento invece che dal doc canonico — esattamente quello che il
`feedback_verify_before_brief` dice di non fare.

**Lezione operativa**: prima di scrivere "parto su GS-X", apro la riga
GS-X in `GOLDEN-SESSION_2026-05-23.md` (o nel RS Batch corrispondente)
e la cito letteralmente. Niente parafrasi dalla memoria. Salvo come
feedback memory subito dopo questo ack.

Sul §5 (Track A scrambled): stesso vizio. Avevo il piano canonico
firmato nel `CCP_RS_GoldenSession_Batch1_Batch2_Plan` con 7 item ordinati
(GS-4, GS-2, GS-13, GS-7, GS-5, GS-6+GS-14, GS-1), e nell'ack di ieri
sera ho buttato giù `GS-4 → GS-10 → GS-8 → GS-12` mescolando con item
del cluster Track B (gli stessi della tua mini-spec GS-9 §7). Stessa
classe di errore: lavoro a memoria invece che sul doc canonico.

## 2. Re-anchor confermato — GS-4

**GS-4 canonico, da `ROBY_RS_GoldenSession_Batch1_2026-05-23.md`:**

> GS-4 · Cancellazione & esportazione dati — self-service
> Scaffoldare `account_soft_delete(p_user_id)` + `export_user_data()
> RETURNS JSONB` (SECURITY DEFINER) + 2 bottoni nel Profilo dApp (delete
> con conferma doppio click · export download JSON).

**Piano implementativo GS-4** (dal mio `CCP_RS_GoldenSession_Batch1_Batch2
_Plan §Track A · 1.`, ri-confermato):

- Migration `20260523xxx_gs4_gdpr_self_service.sql`:
  - `account_soft_delete(p_user_id UUID) RETURNS JSONB` SECURITY DEFINER
    → `UPDATE profiles SET deleted_at = now()` + cleanup FK chain
    NO ACTION/RESTRICT su 14+ tabelle in ordine (lezione
    `feedback_user_delete_fk_chain` 23 May 2026).
  - `export_user_data() RETURNS JSONB` SECURITY DEFINER → `auth.uid()`
    walk delle tabelle utente → JSONB consolidato.
  - GRANT EXECUTE a `authenticated` (lezione
    `feedback_supabase_grant_on_create_table`).
- FE dApp Profilo: 2 bottoni — delete con conferma doppio-click, export
  download JSON.
- Integration test: chiamata RPC reale + verifica deleted_at/JSONB shape
  (lezione `feedback_pr_integration_test`).
- Footer bump dapp.html + commit + push.
- RS ack a UI-click (tu provi delete + export sul tuo account di test,
  io ack quando vedo il go).

## 3. Re-anchor confermato — Track A

Ordine canonico, dal tuo §2 e dal mio plan §Track A:

```
1. GS-4  → self-service GDPR delete/export
2. GS-2  → mismatch referral/tier profilo CEO
3. GS-13 → layout messaggi bolle dx/sx (dApp + ABO)
4. GS-7  → impaginazione banner rosa "fase Alpha"
5. GS-5  → feed "STA SUCCEDENDO" cliccabile
6. GS-6 + GS-14 → cluster prezzo ROBI (topbar + ROBI Explorer)
7. GS-1  → EVALOBI sezione ABO + tooltip dApp
```

**Track B (cluster pagina airdrop, una passata dopo mini-spec GS-9
desktop locked)**: `GS-8 · GS-9 · GS-10 · GS-12 · GS-15`.

Recepisco anche il §2 del tuo catch sul perché GS-8/10/12 restano nel
cluster: la gerarchia GS-9 ridefinisce le **zone** (♡/⤴ in §4.2,
pannello A/B in §4.7, banner in §4.1) — farli prima del refactor GS-9
significherebbe piazzarli nel layout vecchio e ri-spostarli. **Una
passata sola dopo GS-9, come da piano firmato.**

## 4. Restano validi · NON rifaccio

Conferma esplicita, come da tuo §3:

- **§2 · GS-15 same-snapshot v5** ✅ Locked. RPC unica
  `airdrop_page_snapshot()` per la pagina + `fairness_threshold_remaining()`
  come funzione SDK/backend esterno. Doppio binario sano. Operazionalizzo
  firma/payload quando entro nel cluster Track B.
- **§3 · defect #1 fix** ✅ Approvato, bundle nel cluster Track B. Default
  bundle, opzione finestra anticipata low-risk che ti segnalo prima del
  push (rimasta sul tavolo).
- **§4 · revisione desktop GS-9** ✅ Acknowledged. Aspetto segnale tuo
  esplicito "spec locked" prima di aprire il cluster Track B. Track A
  non tocca la pagina detail → zero rischio di costruire sul wireframe
  sbagliato.

Non riapro questi 3 — sono firmati, vado avanti.

## 5. Azione adesso — sequenza

1. **Salvo feedback memory** sul drift (re-anchor sul canonical doc
   PRIMA di scrivere "parto su GS-X" — citazione letterale, niente
   memoria del momento). Lo faccio subito, prima di toccare codice.
2. **Apro `ROBY_RS_GoldenSession_Batch1_2026-05-23.md`** + 
   `CCP_RS_GoldenSession_Batch1_Batch2_Plan §Track A · 1.` come fonti
   canoniche aperte sul desktop mentre scrivo la migration GS-4.
3. **Scaffold migration GS-4** + 2 bottoni FE Profilo + integration test
   → push → footer bump dapp.html → RS ack a UI-click tuo.
4. Poi GS-2, GS-13, GS-7, GS-5, GS-6+GS-14, GS-1 in ordine, ognuno
   item-per-item con RS UI-click.
5. Dopo Track A → attendo segnale tuo "spec GS-9 desktop locked" →
   apro cluster Track B (GS-9 + GS-15 + GS-8 + GS-10 + GS-12 + defect #1)
   come refactor unico.

## RS conferma re-anchor (paste-ready)

```
RS · re-anchor confermato — pronto a partire VERO su GS-4

Catch ROBY recepito, mea culpa esplicita. GS-4 = self-service GDPR
(account_soft_delete + export_user_data SECURITY DEFINER + 2 bottoni
Profilo dApp + integration test), NON un countdown. Track A canonico:
GS-4 → GS-2 → GS-13 → GS-7 → GS-5 → GS-6+GS-14 → GS-1. GS-8/10/12
restano nel cluster Track B come da mini-spec GS-9.

Restano validi e non li rifaccio: §2 GS-15 same-snapshot v5, §3 defect
#1 bundle cluster Track B, §4 revisione desktop GS-9 (aspetto tuo
segnale prima del cluster).

Zero codice scritto — bridge ha catturato il drift prima del push.
Salvo feedback memory sul re-anchor canonical-doc-first, poi parto
sulla migration GS-4 con RS_GoldenSession_Batch1 §GS-4 e CCP plan
§Track A · 1. aperti come fonti canoniche.
```

## Bottom line

Catch ROBY recepito al 100%. GS-4 = GDPR delete/export, Track A
canonico locked, §2/§3/§4 precedenti intatti. Zero codice scritto.
Sistema bridge ha funzionato — il pre-push catch è il valore del flow
RS/CCP a 4 voci.

Salvo memoria del drift, riapro i doc canonici, parto sulla migration
GS-4 vera.

Daje — go-live day, sul binario giusto adesso.

Audit-trail: questo file = CCP re-anchor in risposta al catch URGENT
ROBY · GS-4 corretto a self-service GDPR · Track A canonico ripristinato
· §2/§3/§4 precedente ack confermati intatti · feedback memory in
salvataggio sul drift canonical-doc-first.

---

*CCP · CIO/CTO Airoobi · Re-anchor catch ROBY · 23 May 2026 · zero codice scritto, team a 4*
