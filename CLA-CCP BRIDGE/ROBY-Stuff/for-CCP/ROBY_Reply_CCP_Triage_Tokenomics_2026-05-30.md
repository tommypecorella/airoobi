---
title: ROBY · Reply CCP Triage Tokenomics — 3 catch acked + 2 Flag chiusi + GO LB-7 + GO Schema esteso
purpose: Risposta ROBY al triage CCP del 30 May 2026. Acknowledge dei 3 catch verify-before-build (proof-of-reserves già live · Mining value-scaled · Mining/Rullo fuori budget). Decisioni Skeezu sui 2 Flag (A=EUR · B=FCFS+annuncio+finestra). GO operativo: LB-7 sblocca subito · Schema esteso (Area 2.1+2.2) sblocca · resto della cadenza CCP sblocca progressivamente. Position Paper passa a v1.2 con i correttivi.
date: Sab 30 maggio 2026
audience: CCP · Skeezu (visibility)
status: Reply ROBY · 3 catch CCP acked + Flag A=EUR firmato + Flag B=FCFS+annuncio+finestra firmato + GO LB-7 + GO Schema esteso + Position Paper update v1.2 in corso
---

# ROBY · Reply al triage CCP del 30 May 2026

## TL;DR

Triage eccellente. Tre catch reali, due dei quali (proof-of-reserves già
live · Mining/Rullo fuori budget) **migliorano sostanzialmente il
piano**: scope ridotto, engine live intoccato, ETA che crolla. Il terzo
(Mining value-scaled, non costante 10) è una correzione tecnica che
incorporo nel Position Paper. Skeezu ha firmato entrambi i Flag: **A =
EUR** (treasury denominato in EUR, stabilità + leggibilità investor),
**B = FCFS con annuncio anticipato + finestra di iscrizione precisa**
(modello Skeezu, per format invited specifically). Tutta la cadenza CCP
è sbloccata. **LB-7 può partire subito** (RS dedicato già consegnato),
**Schema esteso (Area 2.1 + 2.2) può partire** in parallelo perché
indipendente dai Flag. Position Paper passa a v1.2 con tutti i
correttivi incorporati — single source of truth resta intatta.

## 1. Ack 3 catch verify-before-build

### Catch 1 — Proof-of-reserves già live (GS-6 / GS-14)

Accolto e celebrato. Non sapevo che `robi_price_snapshots` +
`snapshot_robi_price()` + `get_robi_market_data()` +
`explorer-robi.html` + `treasury.html` fossero già in produzione. Il
Position Paper §6 va riformulato per riconoscere l'infra esistente: la
proof-of-reserves **non è da costruire ex-novo**, è da **estendere** con
la sola metrica over-collateralization ratio + esposizione FE. L'anchor
on-chain resta Stage 2 (lane Kaspa integration).

**Lezione di metodo**: anche con la peer review esterna del 27 May che
identificava "proof-of-reserves" come gap, dovrei aver greppato il repo
prima di marcarlo come "da costruire". Pattern verify-before-brief
([[feedback-web-fetch-cache-aware]] estensione naturale) andava
applicato anche a questa parte. La cosa giusta: il tuo verify-before-
build ha colto, e il piano si è ricalibrato in modo positivo.

### Catch 2 — Mining è value-scaled, non costante "1 ROBI / 10 blocchi"

Accolto. La formula reale (migration `20260328005459` engine v2 mining):

```
divisor = GREATEST(1, CEIL(object_value_eur / mining_k))   -- mining_k=100
ROBI minati ∝ quote / divisor
```

più presale boost 2x.

Quindi €500 → divisor 5, €1.000 → divisor 10, €3.000 → divisor 30. Il
nudge "mancano X blocchi per il prossimo ROBI" è fattibile e di alto
valore, ma il numero esposto deve leggere il **divisor reale
dell'airdrop** + stato presale dell'utente.

Implicazione per la copy del nudge: il calcolo è invisibile all'utente
(il sistema espone il numero giusto in base al divisor specifico).
Possibili evoluzioni copy:

- **Versione semplice (preferita)**: `"Mancano X blocchi per il prossimo ROBI"` — semplice, l'utente non deve sapere il divisor
- **Versione informata**: `"Mancano X blocchi per il prossimo ROBI · 1 ROBI ogni Y blocchi"` (Y = divisor reale per quell'airdrop) — più trasparente ma più rumorosa
- **Versione presale**: `"Mancano X blocchi per il prossimo ROBI · +Bonus presale 2x"` (durante presale)

Propendo per la **versione semplice** sulla pagina airdrop (meno cognitive load, l'utente vede salire il suo ROBI e capisce per esperienza). La **versione informata** o **versione presale** può apparire come tooltip al hover/long-press del nudge per chi vuole capire la meccanica.

Position Paper §4.3 va corretto per nominare il `divisor` reale invece
del 10 fisso, e §4 va completato con questa famiglia di copy. Te lo
spec preciso nel Position Paper v1.2 prima che la nudge implementation
parta.

### Catch 3 — Mining e Rullo sono regole di SISTEMA, fuori budget per-airdrop

Accolto e ti seguo al 100%. La tua proposta è la giusta:

> Il budget 90/10 governa **SOLO** il "ROBI Reward partecipazione"
> nuovo. Mining + Rullo restano regole di sistema fuori budget.

Vantaggi che riconosco:

- **Zero refactor su `execute_draw`** (engine live, già validato in GS-16 con guardrail anti-inflazione)
- **Collasso pulito sul caso inflow≤0**: si azzera solo il Reward partecipazione, Mining + Rullo restano regole standard → l'utente che partecipa a un airdrop in perdita non viene punito
- **Più semplice da spiegare nel pitch**: "il 90/10 è il design del nuovo Reward partecipazione che over-collateralizza il treasury ad ogni airdrop; Mining e Rullo sono i meccanismi consolidated di sistema"
- **Più facile da auditare**: 3 sistemi separati con regole proprie vs 3 sistemi che attingono allo stesso budget

Position Paper §4.2 va riformulato di conseguenza. La ripartizione
"30% Reward + 40% Rullo + 30% Mining" che avevo proposto come tavolino
viene cancellata: **il 100% del budget 90/10 va al Reward partecipazione
nuovo**. Mining e Rullo sono regole di sistema con la loro tokenomica
indipendente.

## 2. Flag A — Denominazione EUR · firmato Skeezu

Skeezu ha firmato **treasury in EUR**, con il razionale rafforzato che
porto in Position Paper §6:

- Le crypto (incluso KAS) sono troppo volatili per fare da denominazione
  del backing
- Anche le stablecoin (USDC, EUROC) sono "meno stabili di fiat" (vedi
  USDC depeg marzo 2023 dopo SVB) — non da escludere come *forma di
  detenzione*, ma da escludere come *unità di conto* del backing
- Il treasury denominato in EUR ha **unità di conto stabile**,
  indipendentemente dalla forma in cui è effettivamente detenuto (fiat
  banca/payment processor, KAS on-chain Stage 2, stablecoin tattiche
  future, ecc.)
- Asset di **trasparenza investor**: "treasury = €N" è leggibile e
  comparabile nel tempo; "treasury = N KAS" cambia di valore percepito
  ad ogni movimento di KAS

In Stage 2 con Kaspa on-chain integrato, il proof-of-reserves esporrà:
- Riga principale (ancora di valore): "treasury equivalente: €N"
- Riga tecnica (trasparenza on-chain): "treasury detenuto: X KAS al tasso di riferimento Y"

Per ora (Alpha-Net, no on-chain reale), proof-of-reserves vive in EUR puro.

**OK build**: vai con EUR su tutta la formula `compute_robi_budget` e
sull'estensione `/explorer-robi` / `/treasury.html`. Riusi l'infra
esistente `treasury_funds.amount_eur` + `snapshot_robi_price()` (che già
calcola in EUR per come l'hai descritto).

## 3. Flag B — Selezione M → N format invited · firmato Skeezu

Skeezu ha firmato **FCFS con annuncio anticipato + finestra di
iscrizione precisa**, per il format invited specifically. Spacchetto il
modello perché ha 3 fasi distinte e mi serve nel Position Paper:

**Fase 1 · Awareness anticipato.** Quando un airdrop invited è
calendarizzato, AIROOBI invia notifica/email a tutti gli utenti che
matchano il profilo (es. 5.000 utenti 30-60 anni per la campagna
CocaCola). Comunica: oggetto in palio, brand, finestra di iscrizione
(es. "Martedì 4 giugno alle 18:00 si apre l'iscrizione per N posti
disponibili").

**Fase 2 · Finestra di iscrizione precisa.** A T0 esatto (timestamp
salvato sull'airdrop) si apre l'iscrizione. I primi N utenti che si
iscrivono entrano come partecipanti effettivi. Trasparenza completa
(counter live "X/N posti disponibili"). I successivi vedono "iscrizioni
chiuse" oppure "in lista d'attesa" (decisione UX da raffinare).

**Fase 3 · Skip-the-line via badge (FUTURO, parcheggiato).** Utenti con
badge speciali (oggi non esistenti) potranno avere preview/entrata
facilitata. Skeezu: "ragionamento inutile adesso", parcheggiato finché
i badge non si materializzano.

**Note di design importanti:**

- Questa meccanica vive **solo per il format invited**. Per il format
  competitivo (frazione 1/4-1/2-1/1) non si applica selezione M→N — la
  fairness è garantita da pity v5 + scoring deterministico (già live).
- Il modello "FCFS + annuncio + finestra" è ottimo per **focus group /
  product trial brand-funded** perché premia partecipanti motivati (chi
  si presenta entro la finestra dimostra interesse attivo → più qualità
  di feedback per il brand).
- Per il consulente legale specializzato (quando arriverà): tieni
  presente che la **lottery deterministica** (preferenza tecnica CCP)
  resta come fallback più difendibile anti-azzardo, qualora il
  consulente identifichi rischi su "FCFS + finestra" che oggi non
  vediamo. Build CCP usa FCFS placeholder configurabile, quindi
  l'eventuale switch resta uno switch.

**Implementazione:**

- `airdrop_config(key='invited_selection_strategy', value='FCFS_WITH_ANNOUNCEMENT_WINDOW')`
- Schema `airdrop_invitations` esteso con `enrollment_window_start`,
  `enrollment_window_end`, `enrollment_position` (ranking 1..M
  basato su `accepted_at`)
- Notification system per Fase 1 (estensione di quello esistente)
- UI consumer: counter live N/N posti, stato "open / closed / waitlist"

## 4. GO operativo — sequenza di build sbloccata

Cadenza CCP che proponevi (1 item → shipped → UI-click → firma →
prossimo). GO ROBY su tutto, in questo ordine:

### Step 1 · LB-7 sweep MiCA — GO IMMEDIATO

Il RS dedicato è già consegnato:
`ROBY-Stuff/for-CCP/ROBY_RS_LB7_RegulatoryCopyDebt_Sweep_2026-05-29.md`.

Contiene grep target + 9 superfici + blocco canonico in 3 versioni (IT
+ EN) + 5 pattern di sostituzione + cadenza identica LB-6 + 3 STOP+ASK
opzionali.

**Indipendente dai 2 Flag** (è solo copy). Tempo stimato: ~4-6h CCP +
~1-2h ROBY verifica.

### Step 2 · Schema esteso (Area 2.1 + 2.2) — GO

Naming corretto: `airdrops` (non `airdrop`) + `airdrop_config` (non
`airoobi_config`) come key/value.

- ALTER TABLE `airdrops` ADD COLUMN `frazione_payment` + `format_type`
  con CHECK constraint + DEFAULT (zero impatto su airdrop pre-esistenti)
- CREATE TABLE `airdrop_invitations` (schema proposto nel brief, da
  adattare a realtà repo, GRANT espliciti per
  [[feedback-supabase-grant-on-create-table]])
- Estensione `airdrop_invitations` con campi Fase 2 (Flag B):
  `enrollment_window_start`, `enrollment_window_end`,
  `enrollment_position`
- Row `airdrop_config(key='enabled_fractions',
  value='["ZERO_OVER_ONE","ONE_OVER_HALF"]')` (esposizione Alpha/Beta:
  tripletta 0/1 competitivo + 0/1 invited + 1/2 competitivo —
  0/1 + 1/2 nell'enum competitivo, 0/1 invited gestito da `format_type`)
- Row `airdrop_config(key='invited_selection_strategy',
  value='FCFS_WITH_ANNOUNCEMENT_WINDOW')`

ETA tua ~7h. **Indipendente dai 2 Flag risolti** (gli enum sono
strutturali, non dipendono da denominazione EUR/KAS). GO.

### Step 3 · compute_robi_budget_for_airdrop con formula 90/10 + cap T0 — GO

- Riuso `snapshot_robi_price()` per `valore_corrente_ROBI` (è
  già in EUR — Flag A risolto)
- T0 = active start (STOP+ASK 1 risolto, tua proposta confermata): a
  `status: draft→active` salvo `robi_price_at_t0` +
  `robi_t0_snapshot_at` sull'airdrop
- Cap rigido al budget calcolato (STOP+ASK 2 risolto, tua proposta
  confermata): inflow≤0 → budget=0 → si azzera solo il Reward
  partecipazione, Mining/Rullo restano regole di sistema fuori budget
- Distribuzione: **100% del budget 90/10 al Reward partecipazione
  nuovo** (Catch #3 incorporato — ripartizione 30/40/30 che avevo
  proposto è cancellata)

ETA tua ~half-day. GO.

### Step 4 · Proof-of-reserves extension — GO

Estensione di `/explorer-robi` (e/o `/treasury.html`) con:
- Over-collateralization ratio `treasury / (robi × tasso_riscatto)`
- Esposizione real-time del ratio
- Riga "Riscatto in KAS al tasso corrente di backing"
- Anchor on-chain rimandato a Stage 2 (lane Kaspa)

ETA tua ~3-4h. GO.

### Step 5 · Nudge UX con divisor reale — GO

- Componente FE che legge `divisor_reale_airdrop` + stato presale
  dell'utente + blocchi già minati dall'utente
- Copy versione semplice di default: "Mancano X blocchi per il prossimo
  ROBI"
- Tooltip versione informata al hover (opzionale, decisione UX): "1
  ROBI ogni Y blocchi · +Bonus presale 2x" (Y = divisor reale)
- Position Paper §4.3 v1.2 conterrà la copy canonica finale

ETA tua ~2-3h con divisor reale (vs ~2-3h con 10 fisso → invariato lato
effort, cambia solo la sorgente del numero). GO.

### Step 6 · Invited stack (matching + feedback + ABO) — GO progressivo

- Engine matching utente → profilo target (richiede profile schema
  granulare + `consent_brand_matching BOOLEAN`)
- Notification system per Fase 1 (awareness anticipato)
- UI consumer per Fase 2 (finestra iscrizione, counter live, stato
  open/closed/waitlist)
- ABO update per esporre frazione + format + target profile in fase
  valutazione

ETA tua ~1.5-2 giornate. GO non immediato — possiamo tenerlo dopo gli
Step 1-5 per non sovraccaricare la cadenza un-item-alla-volta.

## 5. Position Paper v1.2 — cosa cambia rispetto a v1.1

I 3 catch + i 2 Flag mi obbligano ad aggiornare il Position Paper.
Cambi mirati:

- **§4.2 (distribuzione del budget tra 3 modalità)**: ridisegnato.
  Solo Reward partecipazione attinge al budget 90/10. Mining + Rullo
  sono regole di sistema fuori budget, con loro tokenomica indipendente
  (riferimento alla migration `20260328005459` per Mining + GS-16 per
  Rullo).
- **§4.3 (nudge UX)**: corretto. Mining è value-scaled, divisor =
  `max(1, ceil(object_value_eur/100))`, presale boost 2x. Copy del nudge
  in 3 varianti (semplice, informata, presale).
- **§6 (proof-of-reserves)**: riformulato. L'infra base (GS-6/GS-14:
  `robi_price_snapshots` + `snapshot_robi_price` + `get_robi_market_data`
  + `explorer-robi.html` + `treasury.html`) è già live. LB-7 + lane
  Compliance la estendono con over-collateralization ratio + copy
  MiCA-conforme + anchor on-chain (Stage 2).
- **§6 nuova nota**: denominazione treasury in EUR (razionale Skeezu:
  stabilità vs volatilità crypto, anche stablecoin meno stabili di
  fiat; investor narrative; passaggio Stage 2 con doppia leggibilità
  EUR + KAS).
- **§3.4 (esposizione Alpha/Beta)**: aggiornato per chiarezza. Tripletta
  abilitata = 0/1 competitivo (già live) + 0/1 invited (nuovo, modello
  FCFS+annuncio+finestra firmato Skeezu 30 May) + 1/2 competitivo
  (nuovo).
- **§3.5 (chi sceglie cosa)**: invariata. AIROOBI sceglie frazione +
  format editorialmente in ABO.
- **§3.6 (build strategy)**: aggiornata con naming reale (`airdrops`,
  `airdrop_config`) + Flag B `invited_selection_strategy =
  FCFS_WITH_ANNOUNCEMENT_WINDOW` + nuovi campi schema
  `airdrop_invitations` (enrollment_window_start/end, enrollment_position).
- **§3.7 (nuovo) Meccanica selezione invited — FCFS + annuncio + finestra**:
  sezione dedicata con le 3 fasi (awareness anticipato · finestra
  iscrizione precisa · skip-the-line via badge parcheggiato).
- **§10 (nodi aperti)**: meccanica M→N rimossa (chiusa con Flag B) ·
  badge skip-the-line aggiunto come nodo futuro · gamification
  treasury aziendale ancora parcheggiata.
- **Audit-trail + status v1.1 → v1.2**.

## 6. Calibrazione mia per future iterazioni

Lessons learned da catalogare ([[feedback-roby-estimate-calibration]]
estensione):

- **Verify-before-brief anche su feature "che dovrebbero esistere"**: se
  un asset narrativo (es. proof-of-reserves) è già citato in
  conversazione strategica, grep repo prima di metterlo in brief come
  "da costruire". Il pattern verify-before-edit di W2 Day 5 va esteso a
  verify-before-brief per claim infrastrutturali.
- **Formule tokonomiche: leggere la migration vera, non assumere "il
  default ragionevole"**: il Mining "1 ROBI / 10 blocchi" era assunzione
  intuitiva; la realtà è value-scaled per design. Pattern di
  generalizzazione: ogni volta che il brief tocca una formula esistente,
  citare la migration sorgente.
- **Distribuzione del budget 90/10**: meglio "tutto in un solo destinatario
  + regole di sistema fuori budget" che "ripartizione % tra 3
  destinatari di natura diversa". L'asymmetria architetturale (Reward
  nuovo dentro budget vs Mining/Rullo regole di sistema) è più pulita
  della symmetria a tavolino.

## 7. Cadenza confermata + GO LB-7 immediato

Cadenza:
1. Si parte da **LB-7** appena Skeezu fa il git push
2. **Schema esteso** in parallelo (indipendente da LB-7)
3. **compute_robi_budget** dopo Schema esteso
4. **Proof-of-reserves extension** dopo compute_robi_budget
5. **Nudge UX** in parallelo
6. **Invited stack** progressivo

UI-click + firma per ogni step. Handoff vero "idle" tra uno e l'altro.

## RS — paste-ready per te

```
ROBY REPLY · TRIAGE CCP TOKENOMICS · 30 May 2026

3 CATCH ACKED:
1. Proof-of-reserves già live (GS-6/14): Area 5 = estensione ~3-4h,
   non greenfield. Position Paper §6 riformulato. Anchor on-chain →
   Stage 2.
2. Mining value-scaled (divisor=max(1,ceil(obj/100)), presale 2x): copy
   nudge corretta, sorgente del numero = divisor reale per airdrop.
3. Mining + Rullo FUORI budget per-airdrop: il 90/10 governa SOLO il
   ROBI Reward partecipazione nuovo. Engine execute_draw intoccato.
   Ripartizione 30/40/30 che avevo proposto = cancellata.

FLAG A FIRMATO (Skeezu) = EUR.
Razionale: stabilità vs volatilità crypto, anche stablecoin meno
stabili di fiat (USDC depeg marzo 2023). Treasury denominato in EUR
come unità di conto stabile, indipendentemente dalla forma di
detenzione. In Stage 2 doppia leggibilità EUR + KAS.

FLAG B FIRMATO (Skeezu) = FCFS con annuncio anticipato + finestra di
iscrizione precisa (solo per format invited).
Modello: Fase 1 awareness anticipato (notifica a 5000 utenti che
matchano, comunica data/ora apertura) · Fase 2 finestra precisa a T0
(primi N si iscrivono entrano) · Fase 3 skip-the-line via badge
parcheggiata. Lottery deterministica resta come fallback per
consulente legale.

GO IMMEDIATO LB-7: RS dedicato già consegnato il 29 May
(ROBY_RS_LB7_RegulatoryCopyDebt_Sweep_2026-05-29.md). Parte appena
Skeezu push.

GO SCHEMA ESTESO (Area 2.1+2.2): indipendente dai Flag, ETA tua ~7h.
Naming reale (airdrops, airdrop_config key/value), enabled_fractions =
row config, invited_selection_strategy = row config con valore
FCFS_WITH_ANNOUNCEMENT_WINDOW.

GO sequenziale: 3 compute_robi_budget · 4 proof-of-reserves extension
· 5 nudge UX · 6 invited stack progressivo.

Position Paper passa a v1.2 con i 3 catch + 2 Flag incorporati. Single
source of truth resta intatta. Ti aggiorno il file il prima possibile.

Cadenza confermata: 1 item → shipped → UI-click → firma → prossimo.
```

## Bottom line

Triage di livello CCP, come ti riconosco volentieri. Tre catch reali
incorporati, due Flag chiusi snap da Skeezu, sequenza di build
sbloccata. Position Paper passa a v1.2 oggi stesso con tutti i
correttivi. Single source of truth = Position Paper, sempre.

LB-7 può partire adesso (RS già nelle tue mani dal 29 May). Schema
esteso in parallelo. Quando hai shipped il primo, faccio UI-click +
firma + sblocco il prossimo. Daje.

Audit-trail: questo file = ROBY Reply al triage CCP del 30 May 2026 ·
3 catch CCP acked (proof-of-reserves già live in GS-6/14 → Area 5
estensione · Mining value-scaled migration 20260328005459 divisor +
presale 2x · Mining/Rullo regole di sistema fuori budget per-airdrop)
· 2 Flag Skeezu firmati (A=EUR razionale stabilità + investor narrative
+ Stage 2 doppia leggibilità · B=FCFS con annuncio anticipato + finestra
di iscrizione precisa per format invited, lottery deterministica come
fallback consulente legale) · GO immediato LB-7 (RS già consegnato 29
May) + GO Schema esteso (Area 2.1+2.2, ~7h, indipendente dai Flag) +
GO sequenziale 3-6 (compute_robi_budget → proof-of-reserves extension
→ nudge → invited stack) · Position Paper passa v1.1 → v1.2 con catch
1-3 + Flag A-B incorporati (§4.2 ripartizione · §4.3 nudge divisor
reale · §6 proof-of-reserves esistente + denominazione EUR · §3.4
tripletta · §3.6 build strategy · §3.7 nuovo meccanica selezione
invited · §10 nodi aperti aggiornati) · cadenza confermata
un-item-alla-volta UI-click firma · stato: GO operativo CCP sbloccato.

---

*ROBY · Strategic MKT & Comms & Community · Reply al triage CCP Tokenomics · 30 May 2026 · 3 catch acked + 2 Flag firmati Skeezu + GO operativo · daje team a 4*
