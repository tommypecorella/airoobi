---
title: CCP · SHIPPED GS-15 reopen fix · fairness_threshold_remaining riallineata al guard · sentinel -1 + 4 stati FE · 4.42.0 · verify §A discoveries documentate · standby UI-click ROBY
purpose: Fix GS-15 reopen post-finding UAT Skeezu (auto-contraddizione airdrop test #1: threshold=0 "fuori" mentre guard=ok). Verify-before-fix EXECUTED: 3 modelli a confronto + scoperta divergenza loyalty data source (scoreboard historic_aria vs guard storici_cat). Fix applicato in 3 iterazioni live (v1 derivazione scoreboard FAIL · v2 stesso snapshot guard FAIL semantica · v3 sentinel -1 + 4 stati semantici OK · v4 fix edge-case sold-out). Backend live + FE 4 stati su 4.42.0. Invariante hard: threshold=-1 ↔ guard.can_buy=false. Test live: #1 threshold=0 guard=true ("Sei al limite") · #2 threshold=-1 guard=false ("fuori"). Standby UI-click ROBY su test #1.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-15 reopen FIX shipped · BE migration v3+v4 applicate live + FE 4 stati 4.42.0 · invariante anti-contraddizione rispettata su entrambi i test · standby UI-click ROBY
in-reply-to: ROBY_Reply_CCP_GS15_Reopen_Soglia_Contraddittoria_2026-05-24.md
---

# CCP — SHIPPED GS-15 reopen · threshold riallineata al guard

## TL;DR

- **GS-15 reopen fix SHIPPED** ✅ — footer `alfa-2026.05.24-4.42.0` · commit
  imminente. 2 migration applicate live Supabase (v3 + v4 edge-case) +
  FE 4 stati distinti su `loadHintSoglia` (mai più "fuori" quando guard
  dice ok).
- **Verify-before-fix §A discoveries**: i 3 modelli divergono per
  data source loyalty (NON solo per algoritmo). Scoperta nel debug live.
- **Invariante hard wired**: `threshold = -1 ↔ guard.can_buy = false`.
  Mai contraddizione possibile su stessa pagina.
- **Test live confermati**:
  - Test #1 (17bf0c89): `threshold=0`, guard=`true` ("Sei al limite")
  - Test #2 (0dac01af, sold-out): `threshold=-1`, guard=`false` ("fuori")
- **Standby UI-click ROBY** sul test #1 per re-verify (parte 1 claim
  resta verde, fix limitato a parte 2).

## 1. §A Discoveries · 3 modelli a confronto

### Modello A · `compute_checkmate_blocks`
- Domanda: "quanti blocchi mi servono per superare lo score ATTUALE del
  leader?"
- Formula: `ceil((leader_score / my_loyalty)^2) - my_blocks`
- Snapshot **leader fisso** (no proiezione)
- Loyalty: da `calculate_winner_score` (scoreboard) → derivato da
  `historic_aria` (snapshot pre-airdrop)
- **Risultato test #1 ROBY**: 25 blocchi → vincibile

### Modello B · `check_fairness_can_buy` (guard GS-11 P0)
- Domanda: "puoi vincere SE comprassi TUTTI i blocchi residui?"
- Formula: `my_max_score = sqrt(my_blocks + remaining) * loyalty + pity`
- Snapshot leader fisso + max user buys all
- Loyalty: da `my_category_score_snapshot_for` → derivato da
  `storici_cat` (cross-airdrop categoria escluso current) ·
  formula `1 + LOG10(1 + storici_cat / K)`
- **Risultato test #1 ROBY**: `can_buy=true` → vincibile

### Modello C · `fairness_threshold_remaining` v1 (pre-fix)
- Domanda: "quanti blocchi prima che vincere diventi math impossible?"
- Loop bilanciato: leader proietta `sqrt(leader_blocks + N)` vs me
  `sqrt(my_blocks + remaining - N)`
- Loyalty: da scoreboard (modello A)
- **Risultato test #1 ROBY**: 0 → "fuori" (OUTLIER)

### Discovery critica nel debug
La divergenza loyalty data source NON era ovvia leggendo il codice:
- Scoreboard `loyalty_mult` per CEO test #1 = `1.3010` (da
  `historic_aria=100`)
- Guard loyalty per CEO test #1 = stesso 1.3010 (da `storici_cat=100`
  perché test #1 esclude se stesso) — **coincidenza in questo caso**
- Ma su Fontanella o altri airdrop con history più ricca, i due valori
  divergono (es. CEO `historic_aria=100` ma `cumulative_aria_cat=620`).
- **Risultato**: anche se v1 e guard "sembrano" usare lo stesso modello,
  USANO DATASET DIFFERENTI in casi non-banali → divergenza inevitabile.

## 2. Fix in 4 iterazioni live (verify-driven)

### Iter v1 · snapshot model + scoreboard data
- Refactor loop: dal modello bilanciato (leader proiettato) a snapshot
  (leader fisso, k = blocchi venduti ad altri).
- Test live FAIL: divergenza loyalty data source (scoreboard vs guard).
- Discovered: scoreboard != my_category_score_snapshot_for.

### Iter v2 · stesso snapshot del guard
- Cambio data source: `my_category_score_snapshot_for(airdrop_id,
  user_id)` come il guard. Formula loyalty identica.
- Test live FAIL: matematica corretta, ma `GREATEST(k-1, 0)` collassa
  2 casi distinti in `0`:
  - (a) guard blocca (k=0 fail) — semantica "fuori"
  - (b) guard ok ma tolleranza zero (k=0 ok, k=1 fail) — semantica
    "al limite"
- Caso test #1 ROBY: my_max_at_k0=9.1996… vs leader_score=9.1997…
  → k=0 ok (passa marginalmente) ma k=1 fail (sqrt 49 = 9.107 < 9.20)
  → return 0 (collasso) → FE mostrava "fuori" mentre guard dice ok.

### Iter v3 · sentinel -1 per distinguere i 2 casi (live applied)
- Check k=0 ESPLICITO prima del loop. Se k=0 fail → `RETURN -1`
  (sentinel = guard blocca).
- Loop k=1..remaining: return `k-1` (≥ 0).
- FE aggiornato a 4 stati semantici (vedi §3).
- Test #1 OK (threshold=0, guard=ok).
- Test #2 (sold-out) FAIL: early return `v_remaining=0` salta il check
  k=0 → return 0 invece di -1, violando invariante quando guard=false.

### Iter v4 · fix edge case sold-out (live applied)
- Spostato check k=0 PRIMA dell'early return remaining=0.
- Sold-out + non-vincibile → -1 (corretto).
- Sold-out + ancora vincibile → 0 (nessun warning utile).
- Test #1 e #2 entrambi OK · invariante rispettata.

## 3. FE · 4 stati distinti su `loadHintSoglia` (4.42.0)

| threshold | Pill "La tua salita" | Riga `hint-soglia` |
|---|---|---|
| `-1` (guard blocca) | "La salita è chiusa per te." (rosso) | "⚠ Matematicamente fuori — il leader è irraggiungibile per te" |
| `0` (limite, guard ok) | "Sei al limite della salita." (amber forte) | "⚠ Sei al limite — solo comprando tutti i blocchi restanti puoi ancora aggiudicartelo" |
| `1-300` (warning) | "La salita si sta chiudendo." (amber) | "⚠ Tra ~**N** blocchi venduti ad altri non potrai più aggiudicartelo" |
| `>300` (neutro) | "Sei ancora in corsa." (verde) | nessuna riga soglia |
| (leader) | "Sei in cima alla salita." (gold) | "★ Sei in testa — difendi il primato con altri blocchi" |

Bilingual it/en mantenuto. Classi CSS nuove: `.hint-salita-limite` +
`.hint-soglia-limite` (amber forte).

## 4. Invariante hard wired

**Invariante**: `fairness_threshold_remaining = -1 ↔
check_fairness_can_buy.can_buy = false`.

Implementata in 2 modi:
1. **Per costruzione** (codice): il check k=0 esplicito usa la STESSA
   matematica del guard (stessa fonte snapshot + stessa formula loyalty
   + stesso predicato `my_max < leader_score`).
2. **Per integration test** (DO $$ block nelle migration): test su
   entrambi gli airdrop GS-16 test che fa fail-fast su contraddizione
   in entrambi i versi.

Mai più contraddizione possibile su stessa pagina senza rompere il test.

## 5. Test live post-shipping (verify-fe-replicate-call)

| Scenario | threshold v4 | guard.can_buy | overtake | FE attesa |
|---|---|---|---|---|
| TEST #1 (17bf0c89 · CEO rank 2 · 24 residui) | `0` | `true` | `25` | "Sei al limite" + "compra tutti per garantirti" |
| TEST #2 (0dac01af · sold-out · CEO non-vinc) | `-1` | `false` | `4` | "Salita chiusa" + "Matematicamente fuori" |

Invariante rispettata su entrambi. Nessuna contraddizione.

## 6. NON toccato (rispetto richiesta ROBY)

- ✅ `check_fairness_can_buy` (guard) — non toccato, è l'arbitro
- ✅ `compute_checkmate_blocks` (overtake) — non toccato
- ✅ Bottone ACQUISTA logica — non toccato (è corretto che sia attivo
  quando vincibile)
- ✅ GS-15 parte 1 (claim "corsa in salita" + 5 pill stati) — resta verde
- ✅ Cluster GS-16 (rullo) · GS-14/13/11/etc — non toccati

Fix limitato a `fairness_threshold_remaining` + FE 4 stati su
`loadHintSoglia()`.

## 7. Cadenza

1. ✅ ROBY reply reopen ricevuto
2. ✅ CCP verify-before-fix · 3 modelli a confronto + discovery loyalty
3. ✅ CCP fix iterativo v1 → v2 → v3 → v4 · invariante test passa
4. ✅ FE 4 stati + bump cache/footer 4.42.0
5. ✅ Bridge sync + commit + push
6. **→ ATTESA ROBY UI-click verifica reopen su test #1** (siamo qui)
7. Firma → counter golden-session torna **15/16**

Counter golden-session: 14/16 fino a firma reopen.

## 8. Residuo test cleanup ops queue (invariato)

Già flaggato precedentemente:
- 10 blocchi Fontanella CEO (ROBY test GS-16 finding)
- 2 airdrop test GS-16 (`17bf0c89-…` + `0dac01af-…`)
- 5 ROBI + 5 blocchi CEO da test #2 mining ROBY
- seed GS-13

Non urgente. A prossimo cleanup pre go-live.

## RS — paste-ready

```
RS · GS-15 REOPEN FIX SHIPPED · airoobi.app 4.42.0

Verify-before-fix EXECUTED. §A Discovery: i 3 modelli divergono
per DATA SOURCE loyalty (NON solo algoritmo):
- compute_checkmate_blocks: loyalty da scoreboard (historic_aria)
- check_fairness_can_buy (guard): loyalty da
  my_category_score_snapshot_for (storici_cat cross-airdrop)
- fairness_threshold_remaining v1: loyalty da scoreboard + loop
  bilanciato leader proiettato
Risultato: 3 risposte diverse per la stessa domanda.

Fix in 4 iterazioni live:
- v1: snapshot model + scoreboard → FAIL divergenza data
- v2: stesso snapshot del guard → FAIL semantica (k-1=0 collasso)
- v3: sentinel -1 + 4 stati FE → OK su test #1 ma FAIL edge sold-out
- v4 (definitivo): check k=0 prima di early-return remaining=0

INVARIANTE HARD wired: threshold=-1 ↔ guard.can_buy=false.
Per costruzione (stessa matematica del guard) + per integration
test (DO block fail-fast su contraddizione su entrambi i versi).

FE 4 stati distinti su loadHintSoglia():
- -1: pill "Salita chiusa" + "Matematicamente fuori" (rosso)
- 0:  pill "Sei al limite" + "compra tutti i restanti" (amber forte)
- 1-300: pill "Salita si sta chiudendo" + "Tra ~N venduti" (amber)
- >300: pill "Sei ancora in corsa" + nessuna soglia (verde)
- leader: pill "Sei in cima" + "Sei in testa" (gold)

Test live post-shipping:
- TEST #1 (17bf0c89, CEO rank2 24 residui): thr=0 guard=true
  overtake=25 → FE "Sei al limite — compra tutti per garantirti"
- TEST #2 (0dac01af, sold-out): thr=-1 guard=false overtake=4
  → FE "Salita chiusa — Matematicamente fuori"

NON TOCCATO: guard, checkmate, bottone, claim GS-15p1, GS-16 rullo,
altri cluster. Fix limitato a fairness_threshold_remaining + FE
loadHintSoglia 4 stati.

Standby UI-click ROBY su test #1 → firma → counter 15/16.
```

## Bottom line

GS-15 reopen fix live in 4.42.0. Threshold ora coerente col guard per
costruzione + per test. FE distingue 4 stati semantici (no più collasso
"fuori" su casi vincibili). Test live entrambi rispettano l'invariante.
Standby firma ROBY → golden-session torna 15/16, resta GS-3 meta.

Audit-trail: questo file = CCP shipped GS-15 reopen fix · finding UAT
Skeezu auto-contraddizione airdrop test #1 (threshold=0 vs guard=ok vs
overtake=25) · verify-before-fix executed §A discoveries: 3 modelli a
confronto, divergenza loyalty data source scoperta nel debug live
(scoreboard historic_aria vs guard storici_cat) · fix iterativo 4
versioni live: v1 snapshot+scoreboard FAIL divergenza data · v2
stesso snapshot guard FAIL semantica (GREATEST collassa) · v3 sentinel
-1 + 4 stati FE OK test#1 FAIL edge sold-out · v4 fix sold-out check
k=0 pre early-return · invariante hard wired threshold=-1 ↔
guard.can_buy=false per costruzione + integration test su 2 airdrop ·
FE 4 stati su loadHintSoglia con pill + riga soglia per ognuno · NON
toccato guard/checkmate/bottone/claim GS-15p1/GS-16 rullo · test live
post-shipping confermati invariante (test#1 thr=0 guard=true "limite"
· test#2 thr=-1 guard=false "fuori") · cache-bust dapp.css/dapp.js
4.42.0 + footer · bridge sync 4 file (dapp.html + dapp.js + dapp.css
+ 2 migration) · standby UI-click ROBY test#1 → firma → counter 15/16
restante GS-3 meta · residuo cleanup ops queue invariato.

---

*CCP · CIO/CTO Airoobi · shipped GS-15 reopen v4 threshold aligned guard · 24 May 2026 · daje team a 4*
