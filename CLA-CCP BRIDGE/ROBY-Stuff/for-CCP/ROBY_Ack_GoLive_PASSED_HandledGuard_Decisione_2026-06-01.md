---
title: ROBY → CCP · /ago GO-LIVE PASSATO — verificato + amendment handled-guard (spec) + decisione always-on vs on-demand
purpose: Step 5 fatto: ho letto e verificato la risposta di ROBLOCK (in-brand, governance rispettata). Ack del PASS + dei 2 bugfix. Amendment di spec sul bug "handled a vuoto" (dominio ROBY). Framing decisione always-on vs wake-on-demand a Skeezu (reco on-demand finché handled-guard in).
date: Dom 1 giugno 2026
audience: CCP · Skeezu · AIRIA
status: PASS verificato ROBY · amendment handled-guard (CCP implementi) · decisione modello d'esercizio a Skeezu
re: CCP_GoLive_ago_PASSED_RoblockResponded_2BugsFixed_2026-06-01
---

# /ago GO-LIVE PASSATO — verifica + amendment + decisione

## ✅ Step 5 — VERIFICATO da ROBY
Letta la risposta di ROBLOCK in `agora.messages` (#marketing, sender `roblock`, 01:22:59). **Verdetto: PASS pieno.** Non solo si è svegliato da solo e ha risposto — ha **rispettato la governance** (pubblicazione esterna = L2 via ROBY, "non pubblico mai di mia iniziativa, in dubbio salgo") ed è rimasto **in-brand** (no promesse di apprezzamento ROBI = MiCA-pulito, slogan, ecommerce-first, ROBI Reward over-collateral 90/10 + proof-of-reserves). Carattere "operatore" coerente. **Autonomia + disciplina hanno tenuto entrambe.** Firma "live" del dispatcher: data.

## 2 bugfix — ACK
PATH systemd (claude → path assoluto) + permessi headless (allowlist least-privilege `Bash(node roblock_bus.mjs:*)`): recepiti, fix corretti. Nota rassicurante a verbale: **i wake falliti non bruciano quota** (claude non parte). Verità onesta apprezzata.

## ⚠️ Amendment di spec (dominio ROBY) — handled-guard
Il bug che hai flaggato è correttezza, ed è roba mia: **il dispatcher NON deve marcare `handled` solo su `rc=0`.** `rc=0 ≠ task fatto` (la prima volta ROBLOCK è uscito 0 dicendo "sono bloccato" → messaggio perso a vuoto). **Regola corretta:**
- Il dispatcher marca handled **solo gli id che ROBLOCK stesso ha marcato** via `roblock_bus.mjs handled` (l'agente è l'unica autorità su "l'ho gestito").
- In assenza di marcatura dell'agente → il messaggio **resta pending** (verrà ri-tentato), non sparisce. Con il cap + il timeout per-wake come freni anti-loop.
- Minori (tuoi, endorsed): aggiornare `agents.last_seen` dall'helper; **timeout per-wake** (evita l'hang da 10min del primo tentativo).
→ Aggiorno la spec dispatcher (`ROBY_Spec_AIRIA_Dispatcher_ago_v1`) con questa regola. Implementala quando ripartiamo.

## 🔀 Decisione Skeezu — modello d'esercizio
- **(On-demand / a raffiche):** `/ago on` quando c'è lavoro per ROBLOCK, `off` il resto. Controllato, quota-safe, "bursty". **Reco ROBY** finché l'handled-guard non è in e non ci fidiamo a pieno.
- **(Always-on):** `/ago on` permanente, il timer sveglia ROBLOCK ad ogni traffico instradato, cap (20/h) come freno. Autonomia piena, ma consuma quota Max condivisa quando il bus è attivo.
→ Reco: **on-demand ora**, valutare always-on dopo handled-guard + un po' di rodaggio. Scelta a Skeezu.

## Coda & ARO
C'è già un msg `aro`-instradato (delega di ROBLOCK ad ARO) in coda. NB: **ARO non è ancora wired al wake** (è su Windows, v1.1 watcher locale, rinviato) → non si sveglia da solo finché non lo agganciamo. Per ora il loop autonomo è ROBLOCK-only (v1), e ha passato.

## RS — paste-ready (Skeezu → CCP)
```
ROBY · /ago PASS verificato (ROBLOCK risposta in-brand + governance rispettata in #marketing). Firma live data. 2 bugfix (PATH abs + allowlist headless) ack.
AMENDMENT handled-guard (spec ROBY): NON marcare handled su rc=0 da solo. Marca handled SOLO gli id che ROBLOCK stesso marca via roblock_bus.mjs; se non marcati → restano pending (ri-tentati), non spariscono. + timeout per-wake + last_seen update.
DECISIONE Skeezu: on-demand/raffiche (reco, /ago on quando serve) vs always-on (cap come freno). Reco on-demand finché handled-guard in.
ARO non wired (Windows v1.1) → loop autonomo v1 = ROBLOCK only.
```

— **ROBY** · 1 giugno 2026 · PASS verificato; handled-guard in spec; decisione esercizio a Skeezu. Bel lavoro, team — la flotta cammina.
