---
title: ROBY → CCP · Organigramma fleet + build AIgorà Alpha + ordine file system + offerta tecnica
purpose: Brief multiplo da Skeezu (30 May 2026). 1) spiega a CCP il nuovo organigramma/architettura della fleet. 2) chiede a CCP di realizzare la versione ALFA di AIgorà (il "chat place tra AI"). 3) chiede a CCP di fare ordine sul file system con una proposta di folder tree. 4) chiede a CCP di scrivere l'offerta tecnica di AIgorà. Vincolo duro: NIENTE budget/spese. Sync file ancora via Skeezu.
date: Sab 30 maggio 2026
audience: CCP · Skeezu (visibility)
status: brief · attendo da CCP: comprensione org + proposta folder tree + offerta tecnica AIgorà → poi ROBY+Skeezu approvano → poi build alfa → poi test
---

# Brief · Organigramma + AIgorà Alpha + ordine file system + offerta tecnica

CCP — quattro richieste collegate, da Skeezu. Le prime due sono contesto/comprensione, le altre due ti chiedono di produrre e rimandare (siamo ancora con Skeezu che ci sincronizza i file: quando hai pronto, scrivi qui in `for-CCP/` e lui me lo gira).

**Vincolo che vale su tutto: NIENTE budget, niente API a pagamento, niente spese.** Tutto dentro Max20 + i 2 Raspberry Pi + software/connettori free. Se una scelta costa, si ferma e sale a Skeezu.

## 1. L'organigramma della fleet (per capirci)
Abbiamo formalizzato l'architettura della fleet di agenti. Documento completo: `ROBY-Stuff/agent-architecture/AIROOBI_Agent_Fleet_Architecture_v1_2026-05-30.html` (HTML, leggdadatelo). In sintesi:
- **4 agenti + founder.** ROBY (Strategy/MKT/Comms · Cowork) · **TU = CCP** (CIO/CTO · Claude Code Pi) · AIRIA (Guardian/sync/observer · OpenClaw Pi) · **ARO (NUOVO)** = Community & Social Media Manager, runtime Claude Code su Windows, che **riporta a ROBY** (non a Skeezu). Skeezu = Founder/CEO, ultima firma.
- **Governance a 3 livelli:** L0 auto (basso rischio/reversibile) · L1 peer-approval (validazione dell'agente competente: tu firmi il tech, ROBY firma brand/compliance) · L2 Skeezu (blacklist, alto rischio, o disaccordo tra agenti). In dubbio si sale.
- **Blacklist (sempre Skeezu)** 10 voci: deploy prod · migrazioni DB finanziarie/audit/utenti · spese/API a costo · pubblicazione esterna · 3 invarianti legali + copy MiCA · brand LOCKED · tokenomics · cancellazioni massive/reset Mainnet · comms a terzi · modifica permessi agenti.
- **Canale della fleet:** Supabase (agent-bus, realtime). Front-end = **AIgorà**.
Conferma che il quadro ti torna; se vedi incoerenze con la realtà tecnica, segnalale (tech-ownership tua).

## 2. Realizza la versione ALFA di AIgorà
**AIgorà** (si scrive così: "Agorà" con la "i" di AI infilata graficamente — Skeezu 30 May) è la console/chat della fleet: il "primo chat place tra AI", con ambizione **prodotto vendibile**. Io ho già consegnato il prototipo + lo schema (in `ROBY-Stuff/fleet-console/`):
- `AGORA_Fleet_Console_v1.html` — web-app single-file, demo mode (localStorage) + modalità Supabase realtime (supabase-js v2). 4 superfici: chat multi-canale, board Squadra/stato, inbox Approvazioni (L0/L1/L2 + blacklist), board Task/handoff. (Rinominalo AIgorà nel tuo riordino.)
- `agent_bus_schema_v1.sql` — DDL agents/channels/messages/approvals/tasks + realtime + RLS + seed.
**Cosa ti chiedo per l'alfa:** scegli il progetto Supabase (vedi brief separato `ROBY_Brief_Supabase_AgentBus_Provisioning_2026-05-30.md`), applica lo schema, collega l'app al realtime, indurisci il minimo per renderla un'alfa usabile dai noi 4. NON è prodotto multi-tenant ancora (auth/workspace per-tenant li valutiamo dopo). Zero spese.

## 3. Ordine sul file system → proponi un folder tree
Il file system è diventato caotico (centinaia di file flat in `for-CCP/`, deliverable sparsi, naming non uniforme). **Proponi un folder tree** pulito per `CLA-CCP BRIDGE/AIROOBI/` (repo + ROBY-Stuff + for-CCP + asset + migrations) e per l'archiviazione dei round chiusi. Proposta, non esecuzione: lo spostamento massivo è blacklist #8 → prima la firma di Skeezu. Tieni conto che i tuoi watcher/script potrebbero assumere path flat: dillo nella proposta.

## 4. Scrivi l'offerta tecnica di AIgorà
Visto che AIgorà può diventare prodotto, **scrivi tu l'offerta tecnica**: scope, stack (dentro Max20 + Pi + free, niente API a pagamento), schema dati, architettura realtime, milestone dell'alfa, stima di effort (con la tua calibrazione, non gonfiata), rischi, e cosa servirebbe per il salto a multi-tenant vendibile. Quando è pronta, scrivila qui in `for-CCP/` e Skeezu me la gira: **io la rivedo e la approvo con lui** prima che parta lo sviluppo dell'alfa.

## Sequenza concordata con Skeezu
1–4 = adesso (ARO onboarding lato ROBY già fatto; questo brief a te). Poi: **5)** ROBY+Skeezu approvano la tua offerta + folder tree → **6)** sviluppo alfa AIgorà → **7)** test di funzionamento → **8)** si riprende AIROOBI da dove eravamo (triage Tokenomics, T0, LB-7, ecc.).

---

## RS — paste-ready (Skeezu → CCP)
```
RS · BRIEF MULTIPLO (org + AIgorà alfa + ordine FS + offerta tecnica)
Vincolo su tutto: NIENTE budget / niente API a pagamento / niente spese.

1) ORG: leggi ROBY-Stuff/agent-architecture/AIROOBI_Agent_Fleet_Architecture_v1_2026-05-30.html.
   Nuovo organigramma: ROBY/CCP/AIRIA + ARO (Community&Social, Claude Code Windows, riporta a ROBY) + Skeezu.
   Governance L0/L1/L2 + blacklist 10 voci. Canale = Supabase, front-end = AIgorà. Conferma o segnala incoerenze tech.

2) AIgorà ALFA: prendi ROBY-Stuff/fleet-console/ (AGORA_Fleet_Console_v1.html + agent_bus_schema_v1.sql).
   Scegli progetto Supabase (vedi brief provisioning), applica schema, collega realtime, indurisci ad alfa usabile dai 4. Niente spese.

3) FILE SYSTEM: proponi un folder tree pulito per CLA-CCP BRIDGE/AIROOBI/ + archiviazione round chiusi.
   PROPOSTA, non esecuzione (spostamenti massivi = blacklist #8, firma Skeezu). Segnala se i tuoi watcher assumono path flat.

4) OFFERTA TECNICA AIgorà: scrivila tu (scope/stack free/schema/realtime/milestone alfa/effort calibrato/rischi/salto multi-tenant).
   Quando pronta, scrivi in for-CCP/, Skeezu la gira a ROBY → ROBY+Skeezu approvano prima del dev.

Sequenza: 5) ROBY+Skeezu approvano offerta+foldertree → 6) dev alfa → 7) test → 8) ripresa AIROOBI.
```

— **ROBY** · 30 May 2026 · brief org + AIgorà alfa + ordine FS + offerta tecnica. Palla a te per i punti 3 e 4 (proposta + offerta), poi approviamo.
