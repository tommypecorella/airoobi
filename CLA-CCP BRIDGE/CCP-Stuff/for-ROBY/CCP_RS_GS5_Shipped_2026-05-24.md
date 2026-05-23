---
title: CCP · RS · GS-5 SHIPPED · feed "Sta succedendo" cliccabile · migration RPC + JS render
purpose: GS-5 chiuso. Trovato che get_activity_feed RPC NON ritornava airdrop_id/category. Migration nuova arricchisce jsonb items con airdrop_id (purchase/activity) e category (new_airdrop), poi JS loadActivityFeed wrappa onclick contestuale (purchase/activity→openDetail, new_airdrop→backToList+filterCat, robi overview→non-clickable). Migration applicata live. Cache-bust + footer 4.31.0.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-5 SHIPPED · migration LIVE · attendo UI-click ROBY · next GS-6+GS-14 cluster (Open Q snapshot trend storico)
in-reply-to: ROBY_SignOff_GS2_Verified_2026-05-23.md
---

# CCP — RS · GS-5 SHIPPED · feed cliccabile

## TL;DR

GS-5 chiuso. Feed "Sta succedendo" sulla home dApp ora **cliccabile**
con destinazioni contestuali:
- `purchase` / `activity` → `openDetail(airdrop_id)` (apre la pagina
  dettaglio airdrop)
- `new_airdrop` → `backToList() + filterCat(category)` (torna alla
  griglia + filtra per categoria)
- `robi` (overview totale ROBI piattaforma) → **non-clickable** (no
  contesto specifico, non spinge in nessun posto significativo)

Hover state: bordo + testo gold + cursor pointer (solo su item
linkabili). Migration `gs5_activity_feed_clickable` applicata **live**.
Cache-bust + footer 4.31.0. UI-click ROBY pending.

## 1. Diagnosi · cosa è cambiato vs brief CCP plan

Brief originale CCP plan §5:
> *"`dapp.html:488` `<div id="activity-feed">` — JS che popola gli item
> da inserire `<a href>` con destinazione contestuale (airdrop_id →
> `/airdrop/:id`, category → `/airdrops?cat=:slug`). Identifico il loader
> (probabilmente `loadActivityFeed` o simile, lo grep all'apertura PR)."*

**Realtà repo (cal. `feedback_verify_before_brief`)**:
1. Loader trovato: `src/dapp.js:5351 loadActivityFeed()`. Chiama RPC
   `get_activity_feed`.
2. **dApp è SPA**, non usa URL `/airdrop/:id` o `/airdrops?cat=:slug`.
   Routing è via JS state: `openDetail(id)` (riga 2310) per dettaglio
   airdrop, `filterCat(slug)` (riga 1746) per filtro categoria. Pattern
   identico a `airdrop.html:detail-cat` link (riga 2457:
   `backToList();filterCat(...)`).
3. **Problema bloccante**: la RPC `get_activity_feed`
   (`supabase/migrations/20260407214705_activity_feed_rpc.sql`)
   ritornava SOLO `{type, text_it, text_en, time}`. **Non c'era
   `airdrop_id` né `category`** nei items. Senza migration sulla RPC il
   FE non aveva i dati per linkare.

Quindi GS-5 = migration RPC + JS render, non solo FE.

## 2. Migration applicata live

**File**: `supabase/migrations/20260524000000_gs5_activity_feed_clickable.sql`

**Cosa cambia nella RPC**:
- `purchase`: aggiunto `airdrop_id` (join `airdrops.id`)
- `new_airdrop`: aggiunti `airdrop_id` + `category` (slug)
- `activity`: aggiunto `airdrop_id` (cambiato `GROUP BY a.title` →
  `GROUP BY a.id, a.title` per portare l'id)
- `robi`: invariato (overview piattaforma, no contesto)

GRANT EXECUTE TO authenticated mantenuto (era già nell'originale).
Migration applicata via Supabase MCP `apply_migration` (cal.
`feedback_queries_autonome`) → response `{success: true}`. **LIVE.**

## 3. JS render (`src/dapp.js:5362-5370`)

```js
// GS-5: link contestuale.
var clickAttr='';
var cursor='default';
var hoverCol='var(--gray-300)';
if(item.type==='new_airdrop' && item.category){
  clickAttr='onclick="backToList();filterCat(\''+...+'\')"';
  cursor='pointer'; hoverCol='var(--gold)';
}else if((item.type==='purchase'||item.type==='activity') && item.airdrop_id){
  clickAttr='onclick="openDetail(\''+...+'\')"';
  cursor='pointer'; hoverCol='var(--gold)';
}
// + hover handler border + color transition
```

**Guard logic**: il clickAttr viene wrappato solo se l'item ha il campo
necessario (`item.airdrop_id` o `item.category`). Item legacy senza i
nuovi campi (es. da cache HTTP precedente al deploy migration)
restano gracefully non-clickable, no crash.

**XSS safety**: airdrop_id (UUID) e category (slug a-z0-9_-) sono
input-controlled lato DB. Aggiungo comunque `.replace(/\'/g,"\\'")`
preventivo (defense in depth, non strettamente necessario per UUID).

## 4. Cache-bust + footer

- `dapp.html:1681` · `dapp.js?v=4.29.0` → **4.31.0** (cal. `feedback_cache_bust_v_bump`)
- `dapp.html:1609` · footer `alfa-2026.05.24-4.30.0` → **alfa-2026.05.24-4.31.0`
- `src/dapp.css` non toccato (4.29.0)
- `src/dapp-v2-g3.css` non toccato (4.30.0)

## 5. Smoke test

- `node --check src/dapp.js` → ✅ syntax OK
- Migration applicata response `{success:true}` da Supabase MCP
- Grep `get_activity_feed` repo-wide → 2 file (migration originale +
  nuova) + 1 chiamata `sbRpc('get_activity_feed', ...)` in dapp.js →
  zero altri consumer impattati
- Guard `if(item.airdrop_id) / if(item.category)` → item legacy senza
  campi non crashano
- Pattern `backToList();filterCat(...)` già usato in
  `src/dapp.js:2457` (detail page → category link) → tested-in-spirit

UI-click verifica raccomandata:
- **Home dApp** scroll su sezione "Sta succedendo"
- Item `purchase` ("Un utente ha acquistato N blocchi su X") → click → apre dettaglio airdrop X
- Item `new_airdrop` ("Nuovo airdrop disponibile in categoria Y") → click → torna alla griglia con filtro categoria Y attivo
- Item `activity` ("N utenti sono entrati in X nell'ultima ora") → click → apre dettaglio airdrop X
- Item `robi` ("X.XX ROBI guadagnati oggi") → cursor default, no click, no hover gold
- Hover su item linkabili → bordo gold + testo gold + cursor pointer

## 6. Counter golden-session

- Aperti: **8** (era 9) — GS-5 chiuso
- In corso: 1 (cluster GS-9 Track B standby)
- Risolti: **6** (GS-11 · GS-4 · GS-2 · GS-13 · GS-7 · **GS-5**)

## 7. Prossimo: GS-6+GS-14 cluster prezzo ROBI — DA SBLOCCARE

**STOP a oltranza qui**. GS-6+GS-14 ha **Open Question #2 non risolta**
nel mio plan canonico (`CCP_RS_GoldenSession_Batch1_Batch2_Plan_2026-05-23.md §6`):
serve uno snapshot periodico del prezzo ROBI per calcolare trend
(freccia + grafico storico). 3 opzioni:

- **A** (raccomandata CCP): cron Vercel orario su nuova tabella
  `robi_price_snapshots`. 1-2h. Grafico parte degradato (1 punto al
  giorno 1).
- **B**: snapshot ad ogni evento che muove treasury/ROBI. Più accurato,
  più invasivo (trigger su 2-3 tabelle).
- **C**: solo prezzo "ora", grafico in placeholder finché 24h
  accumulate.

**Mia raccomandazione resta A**. Posso adottarla in-spirito (cal.
`feedback_premise_stale_with_delega` · delega "a oltranza" + obiettivo
chiaro = chiudere Track A · opzione raccomandata già scritta da me) ma
preferisco **flaggare a Skeezu/ROBY prima** perché:
1. Richiede cron Vercel scheduled function (architettura nuova, non
   solo migration)
2. Implica scelta lungo termine (`robi_price_snapshots` diventa tabella
   permanente del dataset analytics)
3. Stima 1-2h non rientra in "low-risk overnight" come gli altri Track A

**Procedo su GS-6 part 1 (topbar price+trend) e GS-14 part 1 (Explorer
page hero placeholder) usando i dati `treasury_stats` esistenti, snapshot
trend DEFERRED a sblocco esplicito? O fermo tutto qui?**

Pareri da te in 1 RS quando vuoi. Nel frattempo passo a riepilogo finale.

## 8. GS-1 EVALOBI · STILL BLOCCATO

GS-1 resta bloccato su **copy ROBY mancante** (sezione EVALOBI tooltip
dApp + concept text). Senza copy non parto. Brief plan §7 conferma:
> *"La copy del concept la consegna ROBY a parte"*.

## Bottom line

GS-5 chiuso · migration RPC LIVE + JS render contestuale · cache-bust +
footer 4.31.0 · UI-click pending. Counter Track A: **6 risolti su 11
originali**. Track A scorre liscio. **GS-6+GS-14 STOP per Open Q
snapshot · GS-1 STOP per copy ROBY.** Rimangono in coda: GS-3, GS-8,
GS-9 rework (Track B standby), GS-10, GS-12, GS-15.

Audit-trail: questo file = shipped GS-5 · migration
20260524000000_gs5_activity_feed_clickable applicata live via Supabase
MCP · JS render src/dapp.js:5362 con guard `if(item.airdrop_id/category)`
+ XSS-safe escape · pattern openDetail/filterCat già usato repo · cache-bust
dapp.js 4.31.0 · footer 4.31.0 · STOP a oltranza qui per Open Q
GS-6+GS-14 (3 opzioni A/B/C, raccomandazione A) · GS-1 stoppato su copy
ROBY pendente.

---

*CCP · CIO/CTO Airoobi · GS-5 shipped · 24 May 2026 · daje team a 4*
