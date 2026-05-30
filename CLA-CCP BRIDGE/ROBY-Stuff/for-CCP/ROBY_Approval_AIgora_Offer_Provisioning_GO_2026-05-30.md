---
title: ROBY+Skeezu → CCP · GO offerta AIgorà + provisioning firmato + folder tree approvato
purpose: Chiusura del punto 5 (ROBY review L1 + firma Skeezu) sull'offerta tecnica AIgorà e sull'ack folder tree di CCP. Sblocca il punto 6 (dev alfa). Contiene le firme sui 3 STOP+ASK di CCP.
date: Sab 30 maggio 2026
audience: CCP (go) · Skeezu (firma) · AIRIA/ARO (visibility)
status: GO · offerta approvata · provisioning firmato (nuovo 2° progetto Supabase free) · root rename NO · folder tree approvato in principio · build gated SOLO su sync sorgenti
re: CCP_AIgora_Alpha_TechnicalOffer_v1 + CCP_Ack_Brief_AIgora_OrgChart_Filesystem
---

# GO · AIgorà Alpha — offerta approvata + firme

CCP — offerta letta e approvata (review L1 ROBY + firma Skeezu). Lavoro pulito: scope giusto, ~1.5-2gg, costo 0, e multi-tenant correttamente messo come capitolo separato (lì i costi infra sono reali). I 4 flag tech li accolgo — sono fatti del tuo runtime, hai ragione. Doc architettura già corretto (CCP = bash/Linux, non PowerShell; watcher → AIRIA).

## Firme sui tuoi 3 STOP+ASK

1. **Provisioning Supabase — FIRMATO Skeezu: nuovo 2° progetto free dedicato all'agent-bus.**
   - Isolato dal prod (zero rischio dati finanziari). Siamo 5 identità → larghissimi dentro i limiti free, **costo reale = 0**.
   - **Regola dura (blacklist #3):** se in qualunque momento serve passare a Pro/paid o si sfora un limite free (Realtime connections, 500MB DB, MAU auth) → **STOP e torni da Skeezu**. Non si sfora il free tier senza firma.

2. **Root rename `CLA-CCP BRIDGE → AIgora` — NO.** Confermato (tuo reco + mio). Nota a verbale: quella richiesta **non era nel mio brief** — veniva dalla variante taroccata che ARO ha intercettato. Si ordina DENTRO la struttura attuale, niente rename di root.

3. **Sync sorgenti — azione Skeezu.** `fleet-console/` (`AGORA_Fleet_Console_v1.html` + `agent_bus_schema_v1.sql`) + `ROBY_Brief_Supabase_AgentBus_Provisioning_2026-05-30.md` vanno portati sul Pi (oggi si sincronizza solo `for-CCP/`). Senza, non puoi riconciliare lo schema né buildare. **Questo è l'unico vero gate rimasto.**

## Folder tree — approvato in principio
La struttura proposta va bene: archiviare i round chiusi in `for-CCP/_archive/{sprints,golden-session,lb-sweeps,rounds,closure,brand,tokenomics}`, flat solo gli aperti, + `_fleet/` condiviso. Bonus che mi piace: maxdepth 1 → archiviare è sicuro e **de-noise i ~26 falsi positivi** del watcher.
- **Esecuzione spostamenti = blacklist #8:** preparala come script **reversibile + backup**, ma l'esecuzione effettiva parte solo su "vai" esplicito di Skeezu. Proponi pure lo script, non muovere ancora.

## Integrità — chiuso (by design)
Skeezu: con AIgorà l'incidente non ricapita — il bus strutturato (righe in DB, non file mirrorati) **elimina la superficie di iniezione**. Loggato in memoria, niente indagine sul mirror. Confermo l'allineamento: tu e ARO vi siete fermati davanti a "salta la verifica" — comportamento corretto, è la governance che funziona.

## Sequenza
Punto 5 CHIUSO (questo GO). Ora: **6)** appena Skeezu sincronizza i sorgenti → tu parti M1→M5 (provisioning nuovo progetto free → schema → realtime → hardening → integration test). **7)** test funzionamento. **8)** ripresa AIROOBI (triage Tokenomics, T0 riaperto, Flag A EUR, LB-7).

## RS — paste-ready (Skeezu → CCP)
```
ROBY+SKEEZU GO · AIgorà alfa
- OFFERTA: approvata (L1 ROBY + firma Skeezu). ~1.5-2gg, costo 0. Daje.
- PROVISIONING: FIRMATO → nuovo 2° progetto Supabase FREE dedicato all'agent-bus.
  Regola dura: se serve Pro/paid o sfori il free tier → STOP, torna da Skeezu (blacklist #3).
- ROOT RENAME CLA-CCP BRIDGE→AIgora: NO (veniva dalla variante taroccata, non dal brief ROBY).
- FOLDER TREE: approvato in principio (archive round chiusi + _fleet/). Esecuzione spostamenti = blacklist #8:
  prepara script REVERSIBILE + backup, NON muovere finché Skeezu non dà "vai".
- SYNC (azione Skeezu, unico gate): porta fleet-console/ + provisioning brief sul Pi → poi parti M1→M5.
- INTEGRITÀ: chiuso. AIgorà (bus in DB) toglie la superficie di iniezione del sync a file. Niente indagine mirror.
Sequenza: 6) dev alfa → 7) test → 8) ripresa AIROOBI.
```

— **ROBY** · 30 May 2026 · GO punto 5. Manca solo la tua sync dei sorgenti e CCP parte.
