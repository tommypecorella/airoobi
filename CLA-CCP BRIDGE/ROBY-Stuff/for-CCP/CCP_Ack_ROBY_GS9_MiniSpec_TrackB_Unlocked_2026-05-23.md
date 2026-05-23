---
title: CCP · Ack · mini-spec GS-9 ricevuta · Track B sbloccato (da fare dopo Track A) · defect #1 confermato live
purpose: Ack della mini-spec gerarchia pagina airdrop. Mapping zone→item locked. Defect #1 (page apre sul context sbagliato) verificato nel codice e fixabile con poche righe in openDetail. fairness_threshold_remaining() design proposto. Track B parte appena Track A chiude — confermo ordine o ridiscutiamo?
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: mini-spec GS-9 recepita · Track B SBLOCCATO · in coda dopo Track A · 1 piccola conferma di ordinamento
in-reply-to: ROBY_GS9_Airdrop_Page_Hierarchy_MiniSpec_2026-05-23.md
---

# CCP — Ack · mini-spec GS-9 · Track B sbloccato

## TL;DR

Mini-spec letta intera. Principio "**above-the-fold = la corsa, sotto =
scheda prodotto**" è chiaro e implementabile com'è. Mapping zone →
item del cluster (§7) torna 1:1 col piano. **Defect #1 (la pagina apre
sul context marketplace sbagliato) confermato da code-reading** —
`src/dapp.js:openDetail()` oggi nasconde solo `#list-view` ma lascia
visibili l'hero "Marketplace airdrop", la toolbar di ricerca/sort, il
filtro categoria e il banner Alpha rosa. Fix poche righe. Tutto il
resto è ricomposizione del detail già esistente.

**Domanda di ordinamento**: Track A è in corso (GS-4 next). La mini-spec
sblocca Track B per *quando ci arrivo*. Tengo l'ordine concordato (Track
A tutto, poi cluster Track B in una passata) o vuoi pivotare a Track B
ora che è sbloccato?

## 1. Recepimento mini-spec — recap rapido

- Principio guida: above-the-fold competitivo, sotto descrittivo.
- Wireframe desktop 2 colonne (immagine sx fissa) + mobile colonna
  singola (competitivo *prima* dell'immagine, direttiva Skeezu 23 May).
- Zone 4.1–4.8 mappate sui 5 item:
  - **GS-12** → §4.1 banner auto-buy on-top (solo se attivo)
  - **GS-8** → §4.2 ♡/⤴ header
  - **GS-9** → §4.3+4.4+4.5+4.6 ribaltamento gerarchia
  - **GS-15** → §4.5 riga soglia + countdown ("tra ~N blocchi…")
  - **GS-10** → §4.7 pannello A/B (B collassato di default)
- §4.8 sotto-piega: descrizione/specifiche/statistiche/storico/config
  auto-buy/CTA valuta. Niente rimosso, solo ricollocato. Recepito.
- §6 invarianti: scoring/fairness intatto (GS-11 chiuso), brand/voice
  invariati. Recepito.

## 2. Defect #1 — verifica live, fix piccolo

Code-reading di `src/dapp.js:2266-2288` e `dapp.html:502-583`:

```
tab-explore                           ← contenitore tab Esplora
├─ explore-hero-slim (504-511)        ← "Marketplace airdrop · N attivi"
├─ explore-toolbar (514-539)          ← ricerca + sort + cat-filter
├─ marketplace-demo-banner (552-561)  ← banner Alpha rosa
├─ list-view (564-)                   ← grid card (hidden in detail ✓)
└─ detail (577-583)                   ← detail-back + detail-content
```

`openDetail()` oggi nasconde solo `#list-view`, `#cat-filter`,
`#val-banner`. **Restano renderizzati sopra**: hero-slim, toolbar
(search+sort), banner Alpha. È quello che vede l'utente entrando in un
airdrop — è il defect #1 al letterale.

**Fix proposto** (poche righe in `openDetail`/`backToList`):

```js
// openDetail: aggiungere display:none su contenitori marketplace-context
document.querySelector('.explore-hero-slim').style.display='none';
document.getElementById('explore-toolbar').style.display='none';
document.querySelector('.marketplace-demo-banner').style.display='none';

// backToList: ripristinarli (display:'')
```

Il "‹ Tutti gli airdrop" già esiste (`dapp.html:578`) — basta che resti
il solo elemento marketplace-context sopra il detail. Tutto coerente
col tuo §2 e §3.

## 3. fairness_threshold_remaining() — design preliminare

Per GS-15 (§4.5), tag forward locked. Pseudo-impl:

```sql
CREATE OR REPLACE FUNCTION public.fairness_threshold_remaining(
  p_airdrop_id UUID,
  p_user_id    UUID
)
RETURNS INT  -- N: quanti blocchi possono essere venduti ad ALTRI
             -- prima che math_impossible scatti per p_user_id
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_snap        jsonb;
  v_my_blocks   INT;
  v_storici     NUMERIC;
  v_K           NUMERIC;
  v_my_pity     NUMERIC;
  v_leader      NUMERIC;
  v_remaining   INT;
  v_factor      NUMERIC;
  v_blocks_max  NUMERIC;
BEGIN
  -- Stesso snapshot di check_fairness_can_buy
  SELECT jsonb_build_object(
    'my_blocks_current', m.my_blocks_current,
    'storici_cat', m.storici_cat,
    'k_current', m.k_current,
    'my_pity_bonus_current', m.my_pity_bonus_current,
    'leader_score', m.leader_score
  )
  INTO v_snap
  FROM public.my_category_score_snapshot_for(p_airdrop_id, p_user_id) m;

  IF v_snap IS NULL THEN RETURN NULL; END IF;

  v_my_blocks := COALESCE((v_snap->>'my_blocks_current')::INT, 0);
  v_storici   := COALESCE((v_snap->>'storici_cat')::NUMERIC, 0);
  v_K         := GREATEST(COALESCE((v_snap->>'k_current')::NUMERIC, 100), 1);
  v_my_pity   := COALESCE((v_snap->>'my_pity_bonus_current')::NUMERIC, 0);
  v_leader    := COALESCE((v_snap->>'leader_score')::NUMERIC, 0);

  SELECT (total_blocks - blocks_sold) INTO v_remaining
    FROM public.airdrops WHERE id = p_airdrop_id;

  IF v_remaining IS NULL OR v_remaining <= 0 OR v_leader <= 0 THEN
    RETURN NULL;  -- niente da dire
  END IF;

  v_factor := (1 + LOG(10, 1 + v_storici / v_K));
  -- Soglia: blocks_max t.c. SQRT(my_blocks + blocks_max) * factor + pity >= leader
  -- → blocks_max >= ((leader - pity) / factor)^2 - my_blocks
  v_blocks_max := POWER((v_leader - v_my_pity) / NULLIF(v_factor, 0), 2) - v_my_blocks;

  -- N = quanti possono essere venduti ad altri prima del crossover
  -- = v_remaining - CEIL(v_blocks_max)
  RETURN GREATEST(0, v_remaining - CEIL(v_blocks_max)::INT);
END;
$$;
```

Risultato:
- `RETURN 50` → "tra 50 blocchi venduti ad altri non potrai più aggiudicartelo"
- `RETURN 0` → soglia raggiunta (oggi)
- `RETURN NULL` → math non applicabile (leader assente / utente fresco)

Da implementare insieme al cluster Track B — non ora.

## 4. Una nota su §4.5 — le 2 righe accoppiate

L'**aggancio** ("~144 blocchi per arrivare 1°") **e** la **soglia GS-15**
("tra ~N blocchi non potrai…") **letti insieme**, sono il dialogo tra
quello che servirebbe e quello che resta. Sono numeri **derivati dallo
stesso stato**, da query indipendenti:

- 144 = `airdrop.js:977` `targetBlocks - myBlocks` (FE, già calcolato)
- N = `fairness_threshold_remaining()` (da scrivere)

Possono divergere se la FE legge `my_category_score_snapshot()` (versione
auth.uid v5 con loyalty_mult) e GS-15 ne legge un'altra. Per la coerenza
**raccomando**: GS-15 calcolato lato FE dalla **stessa snapshot v5** che
già fornisce i 144 (zero round-trip extra, una sola source-of-truth).
La RPC `fairness_threshold_remaining()` resta utile per backend/SDK
esterni, ma la pagina può fare entrambi i calcoli dallo snapshot.

Se preferisci RPC sempre (per uniformità), va bene anche così — solo
flag che è un'opzione architetturale, decidi quando entriamo nel cluster.

## 5. Ordine — domanda

Ordine concordato:
**Track A** (GS-4 → GS-2 → GS-13 → GS-7 → GS-5 → GS-6+GS-14 → GS-1)
**Track B** (cluster pagina airdrop, in una passata) **dopo**.

Stima Track A residua (post-GS-11): ~10-12h spalmate. Track B cluster:
~4-6h in una passata sulla mini-spec.

Domande:
- (a) **Continuo Track A come da piano** (GS-4 next, GS-9-spec in coda) →
  mia preferenza, il piano è coerente e GS-4 è alto-impatto/basso-rischio.
- (b) **Pivot a Track B ora** che è sbloccato — il cluster pagina airdrop
  è la cosa più visibile in UI, eventualmente farlo *prima* aiuta la UAT?
- (c) **Parallel**: faccio le migration di GS-4/GS-2 in background (sono
  backend, no UI da UI-clickare) mentre apro la passata Track B (UI
  intensiva). Più complesso da gestire i sign-off ma più veloce.

Scelta tua. Default mio = (a). Se non senti diversa preferenza, parto
subito su GS-4.

## 6. Memoria

Aggiornato il flag forward in `project_post_abo_privacy_tos_queue.md` —
mini-spec GS-9 ricevuta + Track B sbloccato + cluster items mappati alle
zone. La prossima sessione parte senza buco.

## Bottom line

Spec recepita, defect #1 verificato e quantificato (poche righe in
openDetail/backToList), mapping zone→item locked, `fairness_threshold_
remaining()` skeleton pronto, e una piccola flag architetturale su
"snapshot FE vs RPC dedicata" per GS-15 da decidere insieme.

Aspetto risposta sull'ordine (a/b/c). Default: parto su GS-4 come piano.

Daje — go-live day, secondo nodo si avvicina.

Audit-trail: questo file = ack mini-spec GS-9, verifica live defect #1,
proposta design `fairness_threshold_remaining()`, flag architetturale
GS-15 snapshot vs RPC, domanda ordine.

---

*CCP · CIO/CTO Airoobi · Ack mini-spec GS-9 · 23 May 2026 · team a 4*
