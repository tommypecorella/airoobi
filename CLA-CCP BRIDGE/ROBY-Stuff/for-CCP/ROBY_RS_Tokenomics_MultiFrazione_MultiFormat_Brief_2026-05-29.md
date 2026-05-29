---
title: ROBY · RS · Brief implementazione tokonomica — multi-frazione + multi-format + ROBI over-collateralized 90/10 + nudge UX + LB-7 sweep
purpose: Brief operativo per CCP del design tokonomico-legale AIROOBI emerso dalle sessioni di co-design 26-29 May 2026 (post peer review esterna del 27 May). Cattura le implicazioni tecniche del Position Paper Tokenomics Integrity v1.1 in forma actionable. Non è un ordine di build immediato — è la mappa dell'engine target che ROBY consegna a CCP per pianificazione, verify-before-build, STOP+ASK sui nodi aperti, ETA stimato. Verifica tecnica + decisione build cadence resta a CCP per [[feedback-tech-ownership-ccp-final-call]].
date: Ven 29 maggio 2026
audience: CCP · Skeezu (visibility)
status: RS brief implementazione tokonomica · 5 macro-aree + 3 nodi aperti STOP+ASK · verify-before-build + ETA da CCP · LB-7 sweep è P1 cadenza simile a LB-6
---

# ROBY · RS · Brief tokonomica multi-frazione + multi-format + 90/10 + nudge + LB-7

## TL;DR

Position Paper Tokenomics Integrity v1.1
(`ROBY-Stuff/AIROOBI_Tokenomics_Integrity_PositionPaper_2026-05-29.md`)
formalizza il design tokonomico-legale di AIROOBI emerso dal co-design
26-29 May. Cinque aree di implementazione tecnica + due update copy
puro + tre nodi aperti che richiedono STOP+ASK con CCP/Skeezu.

**Aree tecniche da incorporare in Fase A (engine target multi-frazione
+ multi-format + 90/10):**

1. Schema airdrop esteso: campi `frazione_payment` + `format_type` +
   schema `airdrop_invitations`
2. Engine matching utente → profilo target (per format invited)
3. Funzione `compute_robi_budget_for_airdrop(airdrop_id)` con
   formula 90/10 over-collateralization
4. Nudge UX "mancano X blocchi per il prossimo ROBI" sulla pagina
   airdrop
5. Proof-of-reserves pubblico on-chain (estensione di
   `/explorer-robi` o nuova pagina `/treasury`)

**Aree copy/content da fare subito (P1):**

- LB-7 · Regulatory Copy Debt Sweep (sostituzione "ROBI cresce di
  valore" → linguaggio MiCA-conforme su tutte le superfici)

**Nodi aperti che richiedono STOP+ASK:**

- Definizione esatta di T0 per lo snapshot `valore_corrente_ROBI`
- Cosa succede agli airdrop con inflow nullo/negativo
- Meccanica di selezione M invitati → N partecipanti effettivi
  (format invited)

ETA, sequenza implementativa e verify-before-build sono delegate a
CCP. Brief non blocca lavori in corso.

## 0. Riferimento canonico

Tutto il design tokonomico-legale è cristallizzato in:

`ROBY-Stuff/AIROOBI_Tokenomics_Integrity_PositionPaper_2026-05-29.md`
(v1.1 DRAFT, pronto per review Skeezu)

Questo è il **single source of truth**. Questo brief è il suo
companion operativo per CCP. In caso di divergenza tra il brief e il
Position Paper, prevale il Position Paper.

## 1. Schema airdrop esteso

### 1.1 Campi nuovi

Aggiungere a tabella `airdrop` (o equivalente nella tua schema attuale):

```sql
ALTER TABLE airdrop ADD COLUMN frazione_payment TEXT NOT NULL
  DEFAULT 'ZERO_OVER_ONE'
  CHECK (frazione_payment IN ('ZERO_OVER_ONE', 'ONE_OVER_FOUR',
    'ONE_OVER_THREE', 'ONE_OVER_HALF', 'ONE_OVER_ONE'));

ALTER TABLE airdrop ADD COLUMN format_type TEXT NOT NULL
  DEFAULT 'COMPETITIVE'
  CHECK (format_type IN ('COMPETITIVE', 'INVITED'));
```

Default = configurazione attuale (`ZERO_OVER_ONE` + `COMPETITIVE`) →
zero impatto su airdrop pre-esistenti.

### 1.2 Schema invitations (per format invited)

Nuova tabella per gestire i format invited. Proposta strutturale:

```sql
CREATE TABLE airdrop_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airdrop_id UUID NOT NULL REFERENCES airdrop(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  matched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  invited_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'INVITED', 'ACCEPTED',
      'DECLINED', 'EXPIRED', 'PARTICIPATED')),
  ranking_score NUMERIC,
  UNIQUE (airdrop_id, user_id)
);

CREATE INDEX idx_inv_airdrop ON airdrop_invitations(airdrop_id);
CREATE INDEX idx_inv_user ON airdrop_invitations(user_id);
CREATE INDEX idx_inv_status ON airdrop_invitations(status);
```

Lo schema esatto va calibrato con CCP — questa è una proposta di
massima per esprimere il concetto, non un finalized DDL.

### 1.3 ABO update

In fase di valutazione positiva su ABO, l'admin (CEO, evaluator) deve
poter selezionare:
- frazione di pagamento (dropdown 5 valori, default 0/1)
- format type (dropdown 2 valori, default COMPETITIVE)
- (se INVITED) target profile come query/filter sul profile schema

ABO v2 RBAC: solo ruoli con permission `airdrop.set_advanced_params`
possono modificare questi campi (default CEO; configurabile per
evaluator se Skeezu lo decide).

### 1.4 Esposizione Alpha/Beta — tripletta abilitata

Dal Position Paper §3.4:
- 0/1 competitivo (già live, default)
- 0/1 invited (nuovo)
- 1/2 competitivo (nuovo)

Le altre frazioni (1/4, 1/3, 1/1) restano disabilitate nel FE consumer
fino a consulenza legale specializzata. Suggerisco un feature flag
`enabled_fractions` in `airoobi_config` per gestire abilitazione
progressiva.

## 2. Engine matching utente → profilo target

### 2.1 Scope

Per il format INVITED, AIROOBI deve poter eseguire una query sui
profile fields per identificare gli utenti che matchano i criteri
del brand sponsor.

### 2.2 Requisiti minimi

- Schema profilo utente deve avere campi granulari (già nella
  roadmap §7 implicazioni operative, "profile schema +
  consent framework Phase-2-ready")
- Funzione `match_users_for_target_profile(target_query JSONB)
  RETURNS SETOF user_id` o equivalente
- Considerare consent GDPR: solo utenti che hanno dato consenso
  esplicito al matching per brand campaigns vengono inclusi
  (campo `consent_brand_matching BOOLEAN` su profile, default FALSE)

### 2.3 Esempio CocaCola (Position Paper §3.2)

CocaCola lancia formato 15cl, target = età 30-60 anni + profilo X.
La target_query potrebbe essere:

```json
{
  "age_min": 30,
  "age_max": 60,
  "interests": ["beverages", "cola"],
  "consent_brand_matching": true
}
```

Output: SETOF user_id che matchano. Quegli utenti vengono
populati nella tabella `airdrop_invitations` con status PENDING.

### 2.4 Privacy / consent

CRITICAL: il consent per il matching brand deve essere esplicito,
granulare, revocabile in qualsiasi momento, con audit trail. Va
incorporato in onboarding consumer e nella sezione Privacy del
profile. Connesso al consent framework GDPR-grade già nella roadmap
§7 (Phase-2-ready).

## 3. Funzione `compute_robi_budget_for_airdrop`

### 3.1 Formula (Position Paper §4.1)

```
ROBI_coniabili_per_airdrop = (0.90 × inflow_treasury_atteso) /
                              valore_corrente_ROBI
```

### 3.2 Componenti di calcolo

- `inflow_treasury_atteso`: somma incassi previsti (cash vincitore +
  ARIA acquistati attesi) − pagamento al venditore − altri costi
  diretti. La definizione di "atteso" è critica — proposta: per gli
  airdrop competitivi 1/X il cash vincitore è certo (es. €400 nella
  1/2 di un drone €800), gli ARIA acquistati attesi sono una proiezione
  conservativa (es. 50% del valore-airdrop totale). Per gli airdrop
  invited il pagamento del brand è certo a priori (contratto firmato).
- `valore_corrente_ROBI`: snapshot al T0 dell'airdrop, calcolato
  come `treasury_totale_kas / robi_in_circolazione`. **STOP+ASK 1
  sotto** per definizione esatta di T0.

### 3.3 Cap rigido al budget

Una volta calcolato il budget a T0, l'airdrop **non può emettere ROBI
oltre quel cap**, qualunque sia l'inflow effettivo durante la corsa.
Se l'inflow effettivo > atteso → emettiamo fino al cap, il delta va al
treasury come bonus over-collateralization. Se l'inflow effettivo <
atteso → emettiamo proporzionalmente meno, il cap non viene saturato.

### 3.4 Distribuzione del budget tra le 3 modalità

Il budget calcolato si distribuisce in 3 modalità (Position Paper §4.2):
- ROBI Reward partecipazione (NUOVO)
- ROBI Rullo (GIÀ LIVE — GS-16)
- ROBI Mining (GIÀ LIVE)

Proposta di ripartizione iniziale (calibrabile in build): 30% Reward +
40% Rullo + 30% Mining. Da validare con CCP in base ai parametri
attuali del Rullo e del Mining.

## 4. Nudge UX "mancano X blocchi per il prossimo ROBI"

### 4.1 Scope

Sulla pagina airdrop (`/dapp/airdrop/:id`), nella sezione competitiva
sopra la piega (zona già definita dalla mini-spec GS-9), esporre un
messaggio dinamico:

> "Mancano X blocchi per il prossimo ROBI"

dove X = (`blocchi_attuali_per_prossimo_robi - blocchi_attuali_utente`)
modulo `blocchi_per_robi` (default = 10 per la regola Mining attuale).

### 4.2 Comportamento

- Si aggiorna in tempo reale al variare dei blocchi acquistati
- Quando X = 0 → mostra brevemente "ROBI ottenuto! 🟡" + reset al
  prossimo target
- Copy ROBY (versione preliminare, da rivedere a freddo con calma):
  "Ti mancano X blocchi per il prossimo ROBI" / "Sei a X blocchi dal
  prossimo ROBI"

### 4.3 Implementazione

- Componente FE che legge `blocchi_utente_su_airdrop` e `blocchi_per_robi`
  (da `airoobi_config`)
- Aggiornamento via Supabase realtime subscription o polling leggero
- Posizionamento: sopra la piega, vicino al box "compra blocchi"

### 4.4 Perché è importante

Game design d'autore (Position Paper §4.3): trasforma la psicologia
da scommessa a progressione achievement garantita. L'utente compra
blocchi per il ROBI sicuro, non per la chance di vincere il drone.
**Anti-azzardo letterale nell'esperienza utente, oltre che nel design
economico.**

## 5. Proof-of-reserves on-chain pubblico

### 5.1 Scope

Estensione di `/explorer-robi` (o nuova pagina `/treasury`) che espone:
- Treasury totale in KAS
- ROBI in circolazione (somma su tutti i wallet)
- Valore implicito per ROBI (`treasury / robi_circolanti`)
- Over-collateralization ratio (`treasury / (robi_circolanti × tasso_riscatto)`)
- Aggiornamento real-time
- Anchor on-chain trasparente per ogni metrica

### 5.2 Funzione legale e narrativa

- Difesa legale: dimostra non-Ponzi in modo verificabile (acid test del
  Position Paper §6 reso pubblico)
- Asset narrativo investor: dimostra sofisticazione del moat economico
- Difesa reputazionale: chiunque può verificare di non essere truffato
- Coerenza missione anti-azzardo: trasparenza completa

### 5.3 Implementazione

- Query SQL aggregata sui ROBI emessi/circolanti
- Treasury totale: ricavato da `treasury_stats` o tabella equivalente
  esistente
- Aggiornamento: probabilmente non serve real-time hard (refresh ogni
  N minuti / on transaction trigger), valutazione UX
- Anchor on-chain: ogni snapshot scritto su chain Kaspa con merkle root
  delle metriche (così è auditabile post-hoc)

## 6. LB-7 · Regulatory Copy Debt Sweep

### 6.1 Cos'è

Registro LIVE-BUGS.md §LB-7. Sweep delle copy esistenti che usano
linguaggio di apprezzamento ROBI ("ROBI cresce di valore" / "il valore
aumenta nel tempo" / "Fondo Comune fa crescere ROBI" / simili) →
linguaggio MiCA-conforme (descrivere il design, mai promettere il prezzo).
Pattern DeFi sofisticato (MakerDAO/DAI).

### 6.2 Scope superfici

- Landing pages (home.html, dapp homepage, sezione ROBI)
- FAQ (qualsiasi paragrafo che descriva l'evoluzione del valore ROBI)
- dApp interface (tooltip, banner, descrizioni del wallet ROBI)
- Pagina Explorer ROBI (`explorer-robi.html` / equivalente)
- Doc Treasury Methodology
- Blog (articoli ROBI-related — c'è probabilmente sovrapposizione
  con superfici già ripulite in LB-6 fase 2)
- ABO (admin-note se presenti)

### 6.3 Cadenza

Simile a LB-6: ROBY scrive RS con sweep mirato (grep le frasi
incriminate, identifica gli hit, scrive blocco canonico sostituzione,
applicazione 1:1, sign-off UI-click). Tempo stimato ~4-6h ROBY + 2h
CCP. CCP fa il sweep tecnico, ROBY verifica.

### 6.4 Blocco canonico sostituzione

ROBY consegnerà copy puntuale nel RS dedicato di LB-7 (file separato
in for-CCP/). Direzione del linguaggio (Position Paper §7):

> "ROBI è over-collateralizzato per design: ogni airdrop emette ROBI
> per il 90% dell'inflow al treasury, il 10% resta come backing
> crescente. Treasury verificabile on-chain in tempo reale. Riscatto
> in KAS al tasso corrente di backing."

## 7. STOP+ASK · 3 nodi aperti che richiedono decisione

### 7.1 STOP+ASK 1 — Definizione esatta di T0

Per la formula `compute_robi_budget_for_airdrop`, lo snapshot del
`valore_corrente_ROBI` si fa a T0. Candidati per T0:

- (a) Presale start (quando l'airdrop apre la presale ma blocchi non
  ancora acquistabili)
- (b) Active start (quando i blocchi diventano acquistabili)
- (c) Valutazione positiva ABO (calcolo a tavolino prima del lancio)

Proposta ROBY: **(b) active start** — è il primo momento in cui il
sistema "spende" capacity di ROBI. Ma è una scelta tecnica + UX, va
confermata da CCP con verify-before-build.

### 7.2 STOP+ASK 2 — Airdrop con inflow nullo o negativo

Cosa succede se un airdrop non genera abbastanza ARIA acquistati per
ripagare il pagamento al venditore? Es. un sponsored 0/1 in cui il
brand mette €500 ma gli ARIA acquistati dai partecipanti generano €300
di valore → inflow treasury = -€200.

Proposta ROBY:
- Zero ROBI emessi per quell'airdrop (la formula collassa
  naturalmente a 0 se inflow ≤ 0)
- La perdita è assorbita da AIROOBI come marketing cost
- I partecipanti ricevono comunque ROBI Mining standard (che sono
  fuori dal budget per-airdrop perché regola di sistema) e ROBI Rullo
  standard (idem)
- Solo i ROBI Reward partecipazione si azzerano per quell'airdrop

Da confermare con CCP perché ha implicazioni su `compute_robi_budget`
e sulla gestione delle 3 modalità di distribuzione (sono fuori dal
budget per-airdrop o dentro?).

### 7.3 STOP+ASK 3 — Meccanica di selezione M → N (format invited)

Per il format invited, AIROOBI invita M utenti che matchano il
profilo (es. 800). I posti effettivi dell'airdrop sono N (es. 200).
Come si arriva da M a N?

Candidati:
- (a) FCFS (first-come-first-served sull'accept invito)
- (b) Lottery deterministica (hash deterministico user_id +
  airdrop_id, primi N rank)
- (c) Prioritization by Alpha seniority (badge ALPHA_BRAVE prime, poi
  badge BETA, poi gli altri)
- (d) Ibrido (es. 50% Alpha seniority + 50% FCFS sui restanti)

Position Paper §10 dichiara questo nodo "parcheggiato per studio
separato". ROBY non ha ancora una proposta forte. Skeezu dovrà
ragionare e firmare. CCP può cominciare a costruire il format invited
con un placeholder (es. FCFS come default, configurabile più tardi).

## 8. Sequenza implementativa proposta (ETA da CCP)

Proposta ROBY in ordine di priorità + dipendenze (CCP rivede e calibra):

1. **LB-7 sweep copy** (indipendente da tutto il resto, P1 content-debt
   da fare subito)
2. **Schema airdrop esteso** (campi frazione_payment + format_type +
   schema invitations) — base per tutto il resto
3. **Funzione `compute_robi_budget_for_airdrop`** con formula 90/10 +
   cap rigido + ripartizione 3 modalità
4. **Proof-of-reserves pubblico** (estensione `/explorer-robi`) —
   indipendente dai pezzi 2-3 ma ne valorizza la trasparenza
5. **Nudge UX "mancano X blocchi"** — leggero, indipendente, ad alto
   valore game-design
6. **Engine matching utente → profilo target** (per format invited)
7. **Schema feedback collection** (per format invited)
8. **ABO update** per esporre frazione + format + target profile in
   fase valutazione

ETA stimato ROBY (calibrazione [[feedback-roby-estimate-calibration]]:
ridurre 50-70%):
- LB-7 sweep: ~4-6h CCP
- Schema + funzione 90/10: ~1-2 giornate CCP
- Proof-of-reserves: ~1 giornata CCP
- Nudge UX: ~2-3h CCP
- Engine matching + feedback (format invited completo): ~2-3 giornate
  CCP

Totale ETA ROBY: ~5-7 giornate CCP per il pacchetto completo. **Da
calibrare con la tua stima reale + STOP+ASK aperti.**

## 9. Cosa NON va in build adesso

Per chiarezza:
- KYC framework ai 2 snodi (riscatto ROBI + pagamento venditore) →
  lane Compliance & Tokenomics Integrity della roadmap §8, ma non parte
  ora. Va attivato prima del primo riscatto reale o pagamento venditore
  reale (probabilmente go-Mainnet).
- ToS update con i 3 invarianti legali → si fa dopo la consulenza legale
  specializzata, per evitare doppi giri.
- Frazioni 1/4, 1/3, 1/1 (format competitivo) → disabilitate nel FE
  consumer fino a consulenza legale specializzata.
- Combo "frazione X/Y + format invited" → possibilità futura, non
  prioritaria.

## RS — paste-ready

```
RS · TOKENOMICS MULTI-FRAZIONE + MULTI-FORMAT + 90/10 + NUDGE UX + LB-7

Brief tokonomica completo nel file:
ROBY-Stuff/for-CCP/ROBY_RS_Tokenomics_MultiFrazione_MultiFormat_Brief_2026-05-29.md

Single source of truth del design:
ROBY-Stuff/AIROOBI_Tokenomics_Integrity_PositionPaper_2026-05-29.md (v1.1)

5 aree tecniche da incorporare in Fase A:
1. Schema airdrop esteso (frazione_payment + format_type +
   airdrop_invitations table)
2. Engine matching utente → profilo target (per format invited)
3. compute_robi_budget_for_airdrop con formula 90/10
   over-collateralization + cap rigido a T0
4. Nudge UX "mancano X blocchi per il prossimo ROBI" su pagina airdrop
5. Proof-of-reserves pubblico on-chain (estensione /explorer-robi)

LB-7 (P1 content-debt class, simile a LB-6): sweep "ROBI cresce di
valore" → linguaggio MiCA-conforme. ROBY scrive RS dedicato con copy
canonica.

3 STOP+ASK aperti:
- Definizione esatta di T0 per snapshot valore_corrente_ROBI (presale
  vs active vs valutazione)
- Comportamento airdrop con inflow nullo/negativo
- Meccanica di selezione M invitati → N partecipanti effettivi
  (FCFS / lottery deterministica / prioritization Alpha seniority /
  ibrido)

Cosa NON va in build adesso: KYC framework · ToS update · frazioni
1/4-1/3-1/1 · combo frazione X/Y + invited.

ETA ROBY stimato (calibrazione -50-70%): ~5-7 giornate CCP per
pacchetto completo. Da ricalibrare con la tua stima reale.

Verify-before-build su tutti gli schemi proposti — gli ALTER TABLE
e i CREATE TABLE sono indicativi, vanno adattati alla schema reale.
```

## Bottom line

Questo brief è il companion operativo del Position Paper Tokenomics
Integrity v1.1. È una mappa, non un ordine di build immediato. CCP
ha tutta la flessibilità necessaria per: pianificare la sequenza,
fare verify-before-build, rispondere ai 3 STOP+ASK, calibrare ETA,
proporre adattamenti tecnici. La decisione tecnica finale è di CCP
per [[feedback-tech-ownership-ccp-final-call]]. Skeezu firma le
decisioni strategiche aperte (STOP+ASK 3 — meccanica selezione
invitati, in particolare).

Audit-trail: questo file = RS ROBY brief implementazione tokonomica
multi-frazione + multi-format + 90/10 over-collateralization + nudge
UX + LB-7 Regulatory Copy Debt Sweep · companion operativo del
Position Paper Tokenomics Integrity v1.1 (ROBY-Stuff/AIROOBI_Tokenomics_Integrity_PositionPaper_2026-05-29.md) ·
5 aree tecniche Fase A (schema airdrop esteso · engine matching ·
compute_robi_budget formula 90/10 · nudge UX · proof-of-reserves
on-chain) + 1 area copy P1 (LB-7 sweep) + 3 STOP+ASK aperti (T0
snapshot · inflow negativo · selezione M→N invitati) · sequenza
implementativa proposta + ETA stimato calibrabile · cosa NON va in
build adesso (KYC framework · ToS update · frazioni avanzate · combo
fraz×inv) · verify-before-build + adattamento schema reale delegato
a CCP per tech ownership · paste-ready RS in §9 · stato: pronto per
CCP triage + ETA + STOP+ASK responses + sign-off per partire.

---

*ROBY · Strategic MKT & Comms & Community · RS brief tokonomica · 29 May 2026 · companion del Position Paper v1.1 · daje team a 4*
