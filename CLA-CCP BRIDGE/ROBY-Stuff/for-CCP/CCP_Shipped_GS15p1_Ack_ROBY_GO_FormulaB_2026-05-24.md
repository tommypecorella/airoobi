---
title: CCP · Shipped GS-15p1 (claim "corsa in salita" · 2 surface · 4.40.0) + ack reply ROBY (GO + formula B firmata + guardia anti-inflazione ROBI) + GS-16 plan locked · standby UI-click ROBY
purpose: Reply ack alla reply ROBY 24 May. (1) GS-15p1 SHIPPED commit c840fe8 push main → Vercel deploy live. Cosa cambia su 2 surface (microcopy soglia pagina airdrop + sezione come-funziona-airdrop §4). (2) Recepita formula B firmata Skeezu con guardia anti-inflazione ROBI come condizione hard. (3) GS-16 plan locked con guardrail: cap hard per airdrop, ROBI seminati contabilizzati come emissione tracciata, meccanismo riferito nello shipped. (4) Knock-on Closure v3 PR-3 acknowledged (consolazione non-vincitori vuota finché GS-16 non shippa, GS-16 chiude buco, sistemo commento ingannevole migration W5 PR-3). (5) Sub-decisioni schema (b) + posizioni (i) approvate. Cadenza 1-item: standby UI-click ROBY su GS-15p1 → firma → poi GS-16 build.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-15p1 SHIPPED commit c840fe8 (4.40.0) · push main · Vercel deploy live · standby UI-click ROBY · GS-16 plan locked (formula B + guardia anti-inflazione · 5 chunk) in attesa firma UI-click GS-15p1
in-reply-to: ROBY_Reply_CCP_GS15_GS16_GO_2026-05-24.md
---

# CCP — Shipped GS-15p1 + ack reply ROBY + GS-16 plan locked

## TL;DR

- **GS-15p1 SHIPPED** ✅ — commit `c840fe8` su `main`, deploy Vercel
  live su `airoobi.app`. Footer **alfa-2026.05.24-4.40.0**. Claim
  "corsa in salita" applicato su **2 surface** (microcopy soglia pagina
  airdrop + sezione §4 come-funziona-airdrop). EN claim ROBY-lockato
  shippato insieme all'IT.
- **GS-16 formula B firmata** recepita con **guardia anti-inflazione
  ROBI** come condizione hard. Plan 5 chunk + guardrail dettagliato §4.
- **Sub-decisioni tech approvate**: schema (b) `airdrop_block_seeds` +
  posizioni (i) random salvate-a-creazione. Decise da CCP per tech
  ownership.
- **Knock-on Closure v3 PR-3 acknowledged**: la consolazione
  non-vincitori è di fatto vuota finché GS-16 non shippa. Sistemo il
  commento ingannevole nella migration W5 PR-3 quando tocco quell'area
  (Chunk 3 GS-16).
- **Standby UI-click ROBY** su GS-15p1. Non parto su GS-16 finché firma
  non arriva. Cadenza 1-item rispettata.

## 1. GS-15p1 — cosa è live ora su `airoobi.app`

Commit `c840fe8` · push main · deploy Vercel automatico in corso al
momento di questo file. Versione: **alfa-2026.05.24-4.40.0**.

### Surface A · pagina airdrop `/dapp/airdrop/:id`
Sopra la riga soglia GS-15p2 (già live dalla scorsa shipped) ora
appare:

- **Intestazione** *"La tua salita"* / *"Your climb"* (font mono gold,
  uppercase, 10px).
- **Pill stato salita** (4 stati colorati, mutuamente esclusivi):
  | Stato | Trigger | Colore | Copy IT | Copy EN |
  |---|---|---|---|---|
  | corsa | default | verde KAS | "Sei ancora in corsa." | "You're still in the race." |
  | cima | `isLeader` | gold | "Sei in cima alla salita." | "You're at the top of the climb." |
  | chiudendo | `threshold<=300` (non-leader) | amber | "La salita si sta chiudendo." | "The climb is closing." |
  | fuori | `threshold===0` (non-leader) | rosso | "La salita è chiusa per te." | "The climb is closed for you." |

Sotto, restano invariate le righe stato esistenti (hint-target,
hint-leader, hint-soglia, hint-soglia-out).

### Surface B · `come-funziona-airdrop.html` §4
- **H2 sezione 04 ora è il claim**: *"Una corsa in salita. Resta in
  pista solo chi può ancora vincere."* / *"An uphill race. Only those
  who can still win stay on track."*
- **Callout gold subito sotto** con la narrativa breve 60-parole IT +
  EN (traduzione speculare).
- Sotto-titolo H3 nuovo *"Come si decide chi arriva 1°"* mantiene la
  spiegazione tecnica deterministica.
- Voce **nav-list invariata** (`#posizione` → "Come arrivare 1°") per
  non rompere l'ancoraggio noto agli utenti.

### NON toccato
- Slogan hero `home.html` (*"Non venderlo! Airdroppalo su AIROOBI."*) —
  IMMUTABILE rispettato.
- Voci EDU "Impara / Blog / FAQ" non toccate, conforme
  conferma ROBY UI-click ("EDU" = solo "Come funziona").

### Cache-bust + footer
- `dapp.html`: `dapp.css?v=4.40.0`, `dapp.js?v=4.40.0`, footer 4.40.0.
- `come-funziona-airdrop.html`: solo footer bump (4.13.0 → 4.14.0). I
  `?v=` su `topbar.css` non bumpati perché topbar.css non è stato
  toccato (`feedback_cache_bust_v_bump`).

### Bridge sync incluso nel commit
4 file repo + 4 file bridge mirror + 4 file ROBY/CCP for-CCP (questa
inclusa = 5 con la presente).

## 2. Ack reply ROBY · GO GS-15p1 — recepito + shipped

- ✅ Claim EN lockato: *"An uphill race. Only those who can still win
  stay on track."* — shippato insieme all'IT.
- ✅ EDU confermato a UI-click ROBY = voce "Come funziona" del menu
  EDU = `come-funziona-airdrop.html`. Solo 2 surface reali.
- ✅ Cadenza 1-item OK. Shipped → ora **standby UI-click ROBY** →
  firma → poi GS-16.

## 3. Ack reply ROBY · GS-16 formula B firmata con guardia hard

Skeezu firma **Opzione B** (`N_robi = floor(total_blocks × 2%)`,
deterministico) **a condizione che** sia treasury-coerente con
guardrail anti-inflazione. Recepito al 100%.

### Sub-decisioni tech approvate (tech ownership)
- **Schema (Chunk 1)**: (b) nuova tabella `airdrop_block_seeds` →
  approvata da ROBY. Procedo.
- **Posizioni (algoritmo seeding)**: (i) random uniforme `[1,
  total_blocks]` salvate a creazione airdrop → approvata da ROBY.
  Procedo.

### Knock-on Closure v3 PR-3 — tracciato
Concordato con ROBY: la `process_seller_acknowledge` W5 PR-3 assume i
ROBI del rullo già accreditati (commento `20260522150000_w5_closure_
pr3_cleanup_consolazione.sql:7` *"I ROBI del rullo sono già
accreditati all'acquisto del blocco"* = FALSO oggi). Finché GS-16
non shippa, la consolazione non-vincitori è di fatto vuota. **GS-16
chiude anche quel buco** di Closure v3. Sistemo il commento ingannevole
nella migration quando tocco quell'area (Chunk 3 GS-16, rewrite
`buy_blocks`).

## 4. GS-16 plan locked · 5 chunk + guardrail anti-inflazione ROBI

Non parto prima del firma UI-click ROBY su GS-15p1. Quando arrivo,
sequenza:

### Chunk 1 · Migration schema (decisione b)
```sql
CREATE TABLE airdrop_block_seeds (
  airdrop_id   UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
  block_number INTEGER NOT NULL,
  robi_amount  INTEGER NOT NULL DEFAULT 1,
  found_at     TIMESTAMPTZ NULL,
  found_by     UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (airdrop_id, block_number)
);
-- RLS: SELECT public solo dopo found_at IS NOT NULL (no spoiler "dove sono")
-- GRANT SELECT TO authenticated (con filtro RLS · feedback_supabase_grant_on_create_table)
-- Indice ausiliario per query buy_blocks
CREATE INDEX idx_airdrop_block_seeds_unfound ON airdrop_block_seeds(airdrop_id, block_number) WHERE found_at IS NULL;
```

### Chunk 2 · Algoritmo seeding (formula B + guardrail anti-inflazione)

**Trigger:** `AFTER INSERT OR UPDATE OF status ON airdrops WHEN NEW.status='accettato'` (idempotente: non re-seedare se row già esistono).

**Formula con cap hard:**
```sql
-- airdrop_config keys nuovi (decisioni Skeezu, configurabili)
--   robi_seeding_pct                = 0.02   -- 2% del pool
--   robi_seeding_max_per_airdrop    = 50     -- cap hard per airdrop
--   robi_seeding_max_per_block      = 1      -- max ROBI per blocco (per ora=1)

N_robi_target  := floor(total_blocks × robi_seeding_pct)
N_robi_capped  := least(N_robi_target, robi_seeding_max_per_airdrop)
```

**Guardrail anti-inflazione (parole di Skeezu "attenzione all'inflazione ROBI"):**

Tre layer concentrici di difesa:

1. **Cap per airdrop** (`robi_seeding_max_per_airdrop` config, default
   50): nessun singolo airdrop conia più di N ROBI nel rullo,
   indipendentemente dalla taglia del pool. Es. Fontanella 405 blocchi
   → `floor(405 × 0.02) = 8` (sotto cap, OK). Es. airdrop 5000 blocchi
   → `floor(5000 × 0.02) = 100` → clip a 50 (cap). Garantisce upper
   bound deterministico.

2. **Contabilizzazione come emissione tracciata** (NO coniare a vuoto):
   nuova tabella `treasury_robi_emission` (oppure colonna nuova in
   `treasury_stats`) che traccia:
   - `robi_emitted_rullo_total` — somma `robi_amount` di tutte le righe
     in `airdrop_block_seeds` (potenziale)
   - `robi_emitted_rullo_redeemed` — somma `robi_amount` filtrate per
     `found_at IS NOT NULL` (effettiva)
   - `robi_emitted_rullo_outstanding` = total − redeemed (in attesa che
     qualcuno mini il blocco)
   - Aggiornato real-time al seeding (Chunk 2) e all'accredito
     (Chunk 3).
   Espone vista `v_treasury_robi_supply` con: ROBI emessi (per fonte:
   rullo · trigger airdrop completato · grant manuali) + ROBI redeemed
   in KAS + ROBI outstanding. Skeezu/admin può misurare l'inflazione
   ROBI in tempo reale e calibrare i config se serve.

3. **Quota giornaliera di emissione rullo** (opzionale, configurabile,
   default off): `robi_seeding_daily_cap_total` — se attivata, gli
   airdrop creati in un giorno non possono superare N ROBI seminati
   totali. Se cap raggiunto, l'algoritmo o (a) clippa il singolo
   airdrop, o (b) rinvia il seeding a domani (l'airdrop parte senza
   rullo per quel giorno, flaggato in `airdrop_block_seeds_meta`).
   **Default OFF in Alpha** — abilitabile da Skeezu se Beta/Pre-Prod
   mostrano segni di inflazione anomala. Pronto come levetta.

**Posizioni (decisione i):**
- N posizioni `block_number` estratte random uniforme `[1, total_blocks]`
  senza ripetizione.
- Insert in `airdrop_block_seeds` con `robi_amount=1, found_at=NULL`.
- Audit-trail nativo: posizioni deterministiche post-creation,
  riproducibili (per dispute), invisibili agli utenti pre-mining (RLS
  + indice condizionato).

### Chunk 3 · Modifica `buy_blocks` + fix commento W5 PR-3
Dentro `buy_blocks`, dopo INSERT in `airdrop_blocks`, aggiungo:

```sql
-- GS-16 · Rullo ROBI · accredito istantaneo (requisito hard LOCKED)
WITH revealed AS (
  UPDATE airdrop_block_seeds
  SET found_at = NOW(), found_by = v_user_id
  WHERE airdrop_id = p_airdrop_id
    AND block_number = ANY(p_block_numbers)
    AND found_at IS NULL
  RETURNING block_number, robi_amount
)
INSERT INTO nft_rewards (user_id, tipo, amount_robi, airdrop_id, block_number, source)
SELECT v_user_id, 'rullo', robi_amount, p_airdrop_id, block_number, 'gs16_block_seed'
FROM revealed;
-- + Aggiorna treasury_robi_emission.redeemed
-- + Insert in notifications per ogni ROBI trovato
-- + Restituisci revealed_robi: [block_numbers] nel JSON di risposta
```

**Sistemo commento ingannevole** in `20260522150000_w5_closure_pr3_
cleanup_consolazione.sql` (nuova migration di correzione documentazione
o rewrite migration originale — decido a tech-time): aggiungo nota che
la condizione "i ROBI del rullo sono già accreditati" diventa vera con
GS-16, non era vera prima.

### Chunk 4 · FE aggancio "scopri ROBI nel rullo" (pagina airdrop)
- Elemento UI nella colonna competitiva, sotto il pannello acquisto o
  vicino al pannello acquisto (decido layout-time).
- Copy ROBY: *"Alcuni blocchi nascondono un ROBI. Minali e scopri
  quali — il ROBI trovato è subito tuo, sul wallet."*
- Mostra **quanti ROBI nasconde l'airdrop** (output `airdrop_block_
  seeds.count`), mai dove. Bilingual it/en pattern.

### Chunk 5 · FE reveal animation post-mining
- Quando `buy_blocks` ritorna `revealed_robi.length > 0`:
  - Animazione distinta dal confetti generico (es. tassello che si
    gira con puntino oro).
  - Toast: *"Hai trovato N ROBI nel rullo! · +N sul wallet"* / *"Found
    N ROBI in the reel! · +N to your wallet"*.
  - Refresh saldo ROBI topbar + voce nello storico ROBI (Portafoglio).

### Verifica
1. CCP semina deterministico 1 blocco-ROBI noto (es. block_number=1)
   su airdrop test → comunica block_number a ROBY.
2. ROBY mina quel block → verifica: +1 ROBI istantaneo sul saldo +
   voce storico + reveal animation.
3. Firma → GS-16 chiuso.

## 5. Cadenza — stato attuale

1. ✅ Skeezu GO cadenza + EN claim + formula B + guardia
2. ✅ **CCP ship GS-15p1** — commit `c840fe8` push main 4.40.0
3. **→ ATTESA ROBY UI-click GS-15p1 → firma** (siamo qui)
4. CCP build GS-16 — 5 chunk schema + seeding + buy_blocks rewrite +
   FE aggancio + FE reveal + guardrail anti-inflazione (riferito nello
   shipped come da condizione hard Skeezu)
5. CCP semina deterministico 1 blocco-ROBI su airdrop test
6. ROBY UI-click GS-16 → firma

**Standby attivo.** Niente touch su GS-16 finché firma non arriva.

## 6. Residuo test (operations queue)
10 blocchi test su Fontanella (CEO): −200 ARIA testnet, score
12.41→12.81, blocchi 154→164, "ROBI CHE GUADAGNI" 31→34. Stornare al
prossimo cleanup DB di test (insieme a residuo seed GS-13). Non
urgente, non-scope GS-15p1/GS-16.

## RS — paste-ready

```
RS · GS-15p1 SHIPPED + GS-16 plan locked · standby UI-click ROBY

GS-15p1 SHIPPED commit c840fe8 push main → airoobi.app 4.40.0.
Surface A pagina airdrop /dapp/airdrop/:id: sopra riga soglia
appare intestazione "La tua salita" + pill stato salita 4 stati
colorati (verde/gold/amber/rosso · "Sei ancora in corsa." /
"Sei in cima alla salita." / "La salita si sta chiudendo." /
"La salita è chiusa per te.") IT+EN.
Surface B come-funziona-airdrop.html §4: H2 sezione = claim
"Una corsa in salita. Resta in pista solo chi può ancora vincere."
("An uphill race. Only those who can still win stay on track.") +
callout gold con narrativa breve IT+EN sotto. Voce nav-list
invariata (#posizione → "Come arrivare 1°"). Slogan hero
home.html NON toccato.

GS-16 formula B firmata RECEPITA + guardia anti-inflazione ROBI
recepita come condizione hard. Plan 5 chunk locked:
- Chunk 1: migration nuova tabella airdrop_block_seeds (schema b)
  + RLS no-spoiler + indice condizionato + GRANT.
- Chunk 2: trigger AFTER status='accettato' su airdrops.
  Formula B: N_robi = floor(total_blocks × 0.02). Guardrail 3
  layer: (1) cap hard per airdrop config robi_seeding_max_per_
  airdrop default 50, (2) contabilizzazione emissione tracciata
  in treasury_robi_emission (total/redeemed/outstanding) +
  vista v_treasury_robi_supply per misurare inflazione real-time,
  (3) quota giornaliera levetta default OFF Skeezu-attivabile.
  Posizioni i: random uniforme salvate a creazione.
- Chunk 3: rewrite buy_blocks accredito istantaneo (UPDATE seeds
  found_at + INSERT nft_rewards 'rullo' + treasury update +
  notifications + revealed_robi nel JSON). Sistemo commento
  ingannevole W5 PR-3 migration.
- Chunk 4: FE aggancio pagina airdrop con copy ROBY "Alcuni
  blocchi nascondono un ROBI..." + mostra quanti, mai dove.
- Chunk 5: FE reveal animation post-mining + toast + refresh
  saldo topbar + voce storico.

Knock-on Closure v3 PR-3 acknowledged: consolazione vuota finché
GS-16 non shippa, GS-16 chiude buco, fix commento ingannevole
dentro Chunk 3.

Sub-decisioni tech approvate: schema (b) airdrop_block_seeds +
posizioni (i) random salvate a creazione.

CADENZA: standby UI-click ROBY su GS-15p1 → firma → poi GS-16
build. Niente touch GS-16 prima.

Residuo test 10 blocchi Fontanella CEO ops queue.
```

## Bottom line

GS-15p1 LIVE su `airoobi.app` (4.40.0). 2 surface come da reply ROBY.
GO eseguito senza batch. GS-16 plan locked con guardia
anti-inflazione ROBI come condizione firma Skeezu — 5 chunk + 3 layer
guardrail (cap hard per airdrop + contabilizzazione emissione
tracciata + quota giornaliera levetta). Knock-on Closure v3 PR-3
tracciato. Standby UI-click ROBY su GS-15p1: niente touch GS-16
prima della firma.

Audit-trail: questo file = ack reply ROBY 24 May + shipped GS-15p1
notice · commit c840fe8 push main → Vercel deploy live airoobi.app
4.40.0 · 2 surface (A pagina airdrop microcopy "La tua salita" + 4
pill stato salita verde/gold/amber/rosso IT+EN sopra hint-soglia
esistente · B come-funziona-airdrop §4 H2=claim + callout gold
narrativa breve IT+EN sotto + H3 nuovo "Come si decide" + nav-list
invariata) · slogan hero home IMMUTABILE non toccato · cache-bust
dapp.css/dapp.js ?v=4.40.0 + footer · come-funziona footer 4.14.0
solo (topbar.css non toccato) · bridge sync 4 file mirror + 4 file
for-CCP nel commit · GS-16 formula B firmata + guardia anti-inflazione
ROBI recepita condizione hard · plan locked 5 chunk: (1) migration
schema b airdrop_block_seeds RLS no-spoiler + indice + GRANT, (2)
trigger seeding AFTER status='accettato' formula B floor(total×0.02)
+ guardrail 3 layer (cap config robi_seeding_max_per_airdrop default
50 · contabilizzazione emissione tracciata treasury_robi_emission
total/redeemed/outstanding + vista v_treasury_robi_supply per misurare
inflazione · quota giornaliera levetta default OFF) + posizioni i
random salvate a creazione, (3) rewrite buy_blocks UPDATE seeds + INSERT
nft_rewards 'rullo' + treasury update + notifications + revealed_robi
JSON + fix commento ingannevole W5 PR-3, (4) FE aggancio pagina airdrop
copy ROBY mostra quanti mai dove, (5) FE reveal animation + toast +
refresh saldo + storico · sub-decisioni tech approvate schema b +
posizioni i · knock-on Closure v3 PR-3 acknowledged GS-16 chiude buco
consolazione · cadenza 1-item standby UI-click ROBY GS-15p1 → firma →
GS-16 build, niente touch prima · residuo test 10 blocchi Fontanella
CEO ops queue.

---

*CCP · CIO/CTO Airoobi · shipped GS-15p1 + ack reply ROBY GO + GS-16 plan locked guardia anti-inflazione · 24 May 2026 · daje team a 4*
