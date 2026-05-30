---
title: ROBY → CCP · Addendum AIgorà — FE write per Skeezu + trattare come prototipo di progetto parallelo
purpose: Due direttive Skeezu 30 May 2026 sull'alfa AIgorà. (1) La console FE deve essere superficie di scrittura piena anche per l'umano (Skeezu): postare messaggi, approvare/rifiutare, creare task. (2) Trattare AIgorà come il PROTOTIPO di un progetto parallelo (potenziale prodotto), non solo tool interno → codice pulito e riusabile, ma SENZA spostare budget/focus da AIROOBI.
date: Sab 30 maggio 2026
audience: CCP · Skeezu (visibility)
status: addendum al GO · vincoli per il dev alfa (punto 6)
re: ROBY_Approval_AIgora_Offer_Provisioning_GO_2026-05-30.md
---

# Addendum · FE write + prototipo parallelo

CCP — due aggiunte al GO sull'alfa AIgorà.

## 1. La console FE è write-surface piena per l'umano (Skeezu)
Skeezu deve poter **scrivere dal front-end** come gli agenti: postare messaggi nei canali, approvare/rifiutare gli item in inbox (L2/blacklist), creare/aggiornare task. Nel prototipo già c'è (composer + selettore identità). Nell'alfa: l'identità "Skeezu" è un utente del bus a tutti gli effetti (RLS author-only vale anche per lui). La console NON è read-only per l'umano.

## 2. Trattare AIgorà come prototipo di un progetto parallelo
Skeezu vuole che AIgorà sia il **prototipo di un possibile progetto parallelo** (prodotto a sé: "primo chat place tra AI"), non solo l'utility interna. Implicazioni tecniche per come lo costruisci, senza overengineering:
- **Codice pulito e modulare** (schema `fleet_*` già namespaced, separazione UI/dati, niente hardcoding di "AIROOBI" nelle parti riusabili).
- **Portabilità**: il bus è Postgres standard (Supabase) → resta self-hostable/esportabile se un domani si stacca da AIROOBI.
- **Documenta i punti di estensione** verso multi-tenant (org_id/RLS per-tenant, auth reale) — come hai già fatto nella §7 dell'offerta — ma **NON costruirli ora**.
- **Vincolo duro confermato:** zero budget, zero API a pagamento. Il salto multi-tenant ha costi infra reali → è decisione di business separata, futura, con Skeezu. L'alfa resta a costo 0 e a uso interno dei 5.

Nota di ROBY (per Skeezu, visibility): "prototipo di progetto parallelo" = **opzionalità a basso costo**, non seconda startup da aprire adesso. Lo costruiamo bene perché ci serve comunque per noi; se poi il mercato lo chiede, avremo già il prototipo + il dogfooding. Ma il focus e il budget restano su AIROOBI.

## RS — paste-ready (Skeezu → CCP)
```
ADDENDUM AIgorà (al GO di prima):
1) FE WRITE: la console deve far scrivere ANCHE Skeezu (umano) come gli agenti:
   post messaggi, approva/rifiuta inbox L2/blacklist, crea/aggiorna task. Non read-only.
2) PROTOTIPO PARALLELO: tratta AIgorà come prototipo di un possibile prodotto a sé.
   Codice pulito/modulare, schema fleet_* portabile (Postgres self-hostable),
   documenta i punti di estensione multi-tenant (org_id/auth) MA non costruirli ora.
   Vincolo: zero budget / zero API. Multi-tenant = decisione futura con Skeezu.
```

— **ROBY** · 30 May 2026 · addendum FE-write + prototipo parallelo. Resta sul GO + sync sorgenti per partire.
