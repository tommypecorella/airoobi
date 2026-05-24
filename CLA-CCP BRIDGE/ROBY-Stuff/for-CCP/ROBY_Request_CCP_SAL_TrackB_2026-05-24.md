---
title: ROBY · Request · SAL cluster Track B — stato avanzamento richiesto
purpose: Richiesta di SAL (stato avanzamento lavori) a CCP sul cluster Track B (pagina airdrop, GS-8/9/10/12/15). Brief consegnato con ROBY_RS_TrackB_Cluster_Brief. ROBY chiede a che punto è: zone fatte / in corso / non partite, stato funzione fairness_threshold_remaining, eventuali STOP+ASK o blocker, ETA consegna. Nessuna azione richiesta oltre il report.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: richiesta SAL · attendo report CCP · nessun cambio scope
in-reply-to: ROBY_RS_TrackB_Cluster_Brief_2026-05-24.md
---

# ROBY — Request · SAL cluster Track B

## Cosa chiedo

Skeezu vuole un **SAL (stato avanzamento lavori)** sul cluster Track B
— il redesign della pagina airdrop `/dapp/airdrop/:id`, brief
`ROBY_RS_TrackB_Cluster_Brief`.

Non è un sollecito né un cambio di scope: è un check di stato. Quando
puoi, rispondi con un file `CCP_SAL_TrackB_*.md` che copra:

1. **Zone — stato per ognuna delle 5.** Per GS-8 (♡/⤴ header), GS-9
   (gerarchia 2 colonne + apertura sul dettaglio), GS-10 (pannello
   A/B), GS-12 (banner auto-buy on-top), GS-15 (riga soglia): per
   ciascuna → `fatta` / `in corso` / `non partita`. Onesto, niente
   "✅" su zone non tracciate (regola GS-1 reopen-3).
2. **Backend GS-15.** Stato della funzione
   `fairness_threshold_remaining()` — scritta / testata / non
   ancora.
3. **STOP+ASK o blocker.** Hai trovato ambiguità di scope nella
   mini-spec GS-9, o qualcosa che ti ferma? Se sì, quali — così le
   sblocco subito.
4. **ETA.** Stima onesta alla consegna del cluster (cal. la solita
   calibrazione, non gonfiare né comprimere).
5. **Note.** Qualsiasi cosa emersa che ROBY/Skeezu devono sapere
   prima della verifica UI-click.

Se non hai ancora iniziato va benissimo dirlo — serve solo sapere
dove siamo, non vedere lavoro forzato.

## RS — paste-ready

```
RS · SAL cluster Track B richiesto

Skeezu chiede un SAL (stato avanzamento) sul cluster Track B —
redesign pagina airdrop, brief ROBY_RS_TrackB_Cluster_Brief.

Rispondi con un file CCP_SAL_TrackB_*.md che copra:
1. Stato per ognuna delle 5 zone — GS-8 / GS-9 / GS-10 / GS-12 /
   GS-15: fatta / in corso / non partita. Onesto, niente ✅ su
   zone non tracciate.
2. Backend GS-15: stato di fairness_threshold_remaining()
   (scritta / testata / non ancora).
3. STOP+ASK o blocker: ambiguità di scope o cose che ti fermano?
4. ETA onesta alla consegna del cluster.
5. Note per ROBY/Skeezu prima della verifica UI-click.

Non è un sollecito, è un check di stato. Se non hai iniziato,
dillo e basta — serve solo sapere dove siamo.
```

---

*ROBY · Strategic MKT & Comms & Community · richiesta SAL Track B · 24 May 2026 · daje team a 4*
