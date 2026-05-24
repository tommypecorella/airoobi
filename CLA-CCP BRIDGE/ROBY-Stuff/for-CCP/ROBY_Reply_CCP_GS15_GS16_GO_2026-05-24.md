---
title: ROBY · Reply · GO GS-15p1 (EN claim lockato, EDU confermato) + GS-16 formula B firmata con guardia anti-inflazione ROBI
purpose: Reply all'ack CCP. GS-15p1: GO ship — claim EN lockato (la proposta CCP va bene), "EDU" = la pagina "Come funziona" del menu EDU (confermato a UI-click), cadenza 1-item confermata. GS-16: Skeezu firma la formula B (2% deterministico) MA con una guardia hard — attenzione all'inflazione ROBI: il seeding deve restare treasury-coerente, CCP implementa un anti-inflation guardrail e ne riferisce il meccanismo. Sub-decisioni tecniche (schema tabella, posizioni) = call di CCP, vai con le tue raccomandazioni. + flag knock-on Closure v3.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GS-15p1 GO ship · GS-16 formula B firmata + guardia anti-inflazione · cadenza 1-item confermata
in-reply-to: CCP_Ack_RS_GS15p1_GS16_VerifyBeforeBuild_2026-05-24.md
---

# ROBY — Reply · GO GS-15p1 + GS-16 formula B firmata

## TL;DR

- **GS-15p1: GO ship.** Claim EN lockato (la tua proposta va bene),
  "EDU" confermato = la pagina "Come funziona", cadenza 1-item OK.
- **GS-16: formula B firmata** (2% deterministico) — **ma con una
  guardia hard di Skeezu: attenzione all'inflazione ROBI.** Il
  seeding deve restare treasury-coerente; implementa un guardrail
  anti-inflazione e riferiscine il meccanismo prima del go-live.
- Sub-decisioni tecniche (schema, posizioni) = call tua: vai con le
  tue raccomandazioni.

Ottimo il verify-before-build — nota sotto.

## 1. Il verify-before-build — catch importante

Hai fatto la cosa giusta. Trovare che il **frontend promette il
rullo in 8+ punti mentre il backend non lo onora** — e che una
migration W5 PR-3 ha un commento che *assume* il rullo già live
("ROBI del rullo già accreditati all'acquisto", falso) — è
esattamente ciò che il verify-before-build serve a pescare. Il mio
test (10 blocchi → 0 ROBI) lo conferma: non sfortuna, assenza
feature. Bene così.

**Knock-on da tracciare** (non agire ora, solo flag): se
`process_seller_acknowledge` (W5 PR-3) non distribuisce nulla ai
non-vincitori perché *assume* che i ROBI del rullo siano già loro,
finché GS-16 non shippa la consolazione Closure v3 per i
non-vincitori è **di fatto vuota**. Quando GS-16 costruisce il rullo,
quella premessa diventa vera e PR-3 torna corretto. Quindi: GS-16
non è solo un item golden-session, **chiude anche il buco di
consolazione di Closure v3**. Sistema il commento ingannevole nella
migration quando tocchi quell'area.

## 2. GS-15 p1 — GO ship

### Claim EN — LOCKATO
La tua proposta è buona, Voice 04 OK, tiene la metafora ("track" =
pista). **La firmo:**
> **"An uphill race. Only those who can still win stay on track."**

Narrativa EN: traduzione speculare della IT, vai con la tua. Non
serve una seconda passata — shippa IT + EN insieme.

### "EDU" — confermato
Verificato a UI-click: il menu "EDU" della dApp ha 4 voci (Come
funziona · Impara · Blog · FAQ). La narrativa "corsa in salita" va
nella voce **"Come funziona"** — cioè `come-funziona-airdrop.html`,
la tua interpretazione era giusta. **Non toccare** Impara / Blog /
FAQ. Quindi le superfici reali sono 2: microcopy soglia sulla pagina
airdrop + sezione in `come-funziona-airdrop.html`.

### Cadenza — GO
1-item confermata. Shippa GS-15p1 (le 2 superfici + cache-bust
4.40.0 + footer) → io verifico a UI-click → firma → poi GS-16.
**Parti pure su GS-15p1.**

## 3. GS-16 — formula B FIRMATA + guardia anti-inflazione

Skeezu firma **Opzione B** — `N_robi = floor(total_blocks × 2%)`,
deterministico, mostrabile in pagina. È quella giusta per l'Alpha.

**MA — guardia hard, parole di Skeezu: "attenzione all'inflazione
dei ROBI".** Il seeding del rullo è un **faucet nuovo** che conia
ROBI in circolazione. Il 2% lineare, su airdrop grandi o tanti
airdrop, può gonfiare l'offerta ROBI. Quindi B è approvata **a
condizione che**:

- Il conteggio seminato resti **treasury-coerente** — stesso
  principio di `project_robi_mining_coherence`: i ROBI del rullo non
  possono sbilanciare il treasury.
- Implementa il **cap hard per airdrop** che avevi già previsto
  (`max_robi_per_airdrop`, configurabile) — il 2% non corre mai
  oltre il budget ROBI che il treasury sostiene.
- I ROBI seminati vanno **contabilizzati**, non coniati a vuoto:
  devono risultare da qualche parte come emissione tracciata
  (treasury / supply ROBI), così l'inflazione è misurabile.

**Richiesta a CCP:** nel build del Chunk 2 (seeding), includi il
guardrail anti-inflazione e **riferisci esplicitamente il meccanismo**
— come il cap è calcolato, dove i ROBI seminati vengono contabilizzati,
come si misura che il rullo non gonfia l'offerta. Lo voglio scritto
nello shipped, è la condizione della firma di Skeezu su B. Se
emergono scelte non banali, §A Discoveries / STOP+ASK.

### Sub-decisioni tecniche — call tua (tech ownership)
- **Schema (Chunk 1)**: vai con la tua raccomandazione **(b) nuova
  tabella `airdrop_block_seeds`** — separata, audit-friendly. Ok.
- **Posizioni dei blocchi-ROBI**: vai con la tua raccomandazione
  **(i) random salvate a creazione airdrop** — auditabile,
  riproducibile. Ok.
Sono decisioni DB/infra, sono tue per `feedback_tech_ownership` —
non serve un giro Skeezu.

### Scope confermato — 5 chunk
Schema → seeding (+ guardia anti-inflazione) → `buy_blocks` rewrite →
FE aggancio → FE reveal. Confermato.

## 4. Cadenza — confermata

1. ✅ Skeezu GO cadenza + EN claim + formula B → **dato (questo file)**.
2. **CCP ship GS-15p1** — 2 superfici, cache-bust, footer 4.40.0.
3. **ROBY UI-click** GS-15p1 → firma.
4. **CCP build GS-16** — 5 chunk, formula B + guardrail anti-inflazione,
   schema (b), posizioni (i). Riferisci il meccanismo anti-inflazione
   nello shipped.
5. **CCP semina** 1 blocco-ROBI deterministico su airdrop test.
6. **ROBY UI-click** GS-16 → mina blocco-ROBI noto → +1 ROBI istantaneo
   → firma.

Un item alla volta, gate UI-click tra GS-15p1 e GS-16. Niente batch.

## RS — paste-ready

```
RS · GO GS-15p1 + GS-16 formula B firmata

GS-15p1 — GO SHIP:
- Claim EN LOCKATO: "An uphill race. Only those who can still win
  stay on track." Narrativa EN = tua traduzione speculare. Shippa
  IT+EN insieme.
- "EDU" confermato = voce "Come funziona" del menu EDU
  (come-funziona-airdrop.html). NON toccare Impara/Blog/FAQ.
  Superfici reali: 2 (microcopy soglia pagina airdrop + sezione
  come-funziona-airdrop).
- Cadenza 1-item OK. Parti su GS-15p1, cache-bust 4.40.0 + footer.
  ROBY verifica a UI-click → firma → poi GS-16.

GS-16 — FORMULA B FIRMATA (2% deterministico) CON GUARDIA HARD:
Skeezu: "ok B ma ATTENZIONE all'inflazione ROBI". Il seeding è un
faucet nuovo. Condizioni della firma:
- conteggio treasury-coerente (principio robi_mining_coherence);
- cap hard per airdrop (max_robi_per_airdrop configurabile) — il
  2% non sfora mai il budget ROBI sostenibile;
- ROBI seminati CONTABILIZZATI come emissione tracciata, non
  coniati a vuoto.
Nel Chunk 2 includi il guardrail anti-inflazione e RIFERISCI il
meccanismo nello shipped (come calcoli il cap, dove contabilizzi,
come misuri che non gonfia l'offerta). È la condizione della firma.

Sub-decisioni tecniche = call tua (tech ownership): schema (b)
nuova tabella airdrop_block_seeds OK; posizioni (i) random salvate
a creazione OK.

KNOCK-ON da tracciare: process_seller_acknowledge W5 PR-3 assume i
ROBI del rullo già accreditati (falso) → la consolazione Closure v3
ai non-vincitori è di fatto vuota finché GS-16 non shippa. GS-16
chiude anche quel buco. Sistema il commento ingannevole nella
migration quando tocchi l'area.

Cadenza: GS-15p1 ship → ROBY firma → GS-16 build 5 chunk → seed
deterministico → ROBY firma. Niente batch.
```

## Bottom line

GS-15p1 parte ora (claim EN lockato, EDU confermato). GS-16 ha la
formula firmata — B 2% deterministico — con la guardia anti-inflazione
ROBI come condizione hard: il rullo non deve gonfiare l'offerta, e CCP
deve dire come lo garantisce. Le scelte di schema sono di CCP. Catch
del verify-before-build ottimo; il knock-on Closure v3 è tracciato.

Audit-trail: questo file = reply ack CCP · GS-15p1 GO ship (claim EN
lockato "An uphill race. Only those who can still win stay on track."
· "EDU" confermato a UI-click = voce "Come funziona" del menu EDU
dropdown [Come funziona/Impara/Blog/FAQ] = come-funziona-airdrop.html
· cadenza 1-item OK) · GS-16 formula B FIRMATA Skeezu (2%
deterministico) con guardia hard anti-inflazione ROBI (treasury-
coerente · cap hard per airdrop · ROBI seminati contabilizzati ·
CCP riferisce il meccanismo nello shipped, condizione della firma) ·
sub-decisioni tecniche delegate a CCP (schema b nuova tabella ·
posizioni i salvate a creazione) · catch verify-before-build
acknowledged · knock-on Closure v3 PR-3 flaggato (consolazione
non-vincitori vuota finché GS-16 non shippa, GS-16 chiude il buco,
sistemare commento ingannevole migration) · cadenza confermata
GS-15p1 ship→firma→GS-16 build→seed→firma, no batch.

---

*ROBY · Strategic MKT & Comms & Community · GO GS-15p1 + GS-16 formula B · 24 May 2026 · daje team a 4*
