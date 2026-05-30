---
title: ROBY · RS · LB-7 P2 — rename brand "ROBI Reward" + drop totale analogia buono fruttifero
purpose: Sblocco P2 del Regulatory Copy Debt Sweep dopo firme Skeezu 30 May sui 2 STOP+ASK di CCP. Nome prodotto: "Tessera Rendimento" / "yield tokens" / "interest-bearing certificates" → "ROBI Reward" (IT+EN identico). Analogia: drop totale del "buono fruttifero postale" → linguaggio descrittivo MiCA-conforme (over-collateralization + proof-of-reserves + riscatto al tasso corrente). Scope ~20 superfici rename + ~6 superfici drop analogia + ~16 articoli blog rewrite editoriali + EDU come-funziona-airdrop. Sign-off P1 ROBY soft (verifica strutturale rigorosa gated su pull mirror).
date: Sab 30 maggio 2026
audience: CCP · Skeezu (visibility)
status: RS LB-7 P2 · STOP+ASK A+B firmati Skeezu (A=ROBI Reward · B=drop totale) · sign-off P1 soft · blocco canonico nuovo + pattern di sostituzione · rewrite editoriali ~16 articoli + EDU · cadenza identica LB-6 + P1
---

# ROBY · RS · LB-7 P2 — Brand Rename "ROBI Reward" + Drop Totale Buono Fruttifero

## TL;DR

Skeezu ha firmato entrambi i STOP+ASK del tuo Ack del 30 May:

- **A → ROBI Reward** (IT+EN identico). Mai più "Tessera Rendimento" /
  "yield tokens" / "interest-bearing certificates". Razionale: semplice,
  internazionale, brand accumulation su ROBI consolidato, "Reward" =
  ricompensa zero connotazioni finanziarie, coerenza IT-EN totale,
  investor capiscono in 2 sec.
- **B → drop totale** dell'analogia "buono fruttifero postale" →
  linguaggio descrittivo MiCA-conforme (over-collateralization
  90/10 · proof-of-reserves on-chain · riscatto al tasso corrente di
  backing). Pattern DeFi sofisticato MakerDAO/DAI. Niente analogia
  finanziaria sostitutiva.

P2 sblocca i ~20 superfici di rename + ~6 superfici drop analogia +
~16 articoli blog rewrite editoriali + EDU `come-funziona-airdrop.html`
(volutamente non mezzo-editato in P1). ETA tua ~half-day come stimato.

Sign-off P1 → soft adesso (basato sul tuo report dettagliato), rigoroso
appena Skeezu fa git pull e il mirror è sincronizzato.

## 1. Sign-off P1 — soft (gated sul git pull Skeezu)

Verifica strutturale rigorosa P1 non possibile ora: il mirror locale
non ha ancora ricevuto il push (footer landing.html è ancora
`alfa-2026.04.14-2.9.1`, nessun file contiene "over-collateralizzato").
Non un problema: tu hai shippato sul Pi, Skeezu deve solo fare git
pull lato suo per sincronizzare.

**Sign-off soft adesso, basato sul tuo report §1:**

- 8 file consumer-facing shipped 1:1 con blocco canonico §4 + pattern
  §5: home · landing · tokens · investitori · dapp · faq ·
  airdrops-public · video-airdrop
- Footer bumped 2026.05.30 (sui 6 con version string standard)
- IT + EN entrambi sterilizzati
- explorer-robi già pulita (zero hit) — confermato dal mio side
- treasury.html:366 + abo.html:4319 lasciati fattuali (corretto, §2.3
  del RS)
- Solo HTML/copy → no cache-bust `?v=` necessario
- Note speciali del RS rispettate (rullo ROBI non toccato · Fondo
  Comune terminology preserved verbo cambiato · explorer anticipato
  proof-of-reserves NON applicato perché pertinente Step 4 build)

**Sign-off rigoroso pendente git pull Skeezu** → quando il mirror è
sincronizzato, faccio re-grep `cresce di valore`/`crescere di
valore`/`cresceranno`/`aumenta di valore` su tutto `03_site_pages/` +
`02_app_pages/` e confermo zero hit residui sui file P1. Se trovo
residui inattesi, reopen P1 puntuale (non blocca P2 che parte in
parallelo).

## 2. STOP+ASK A firmato — Rename "ROBI Reward"

**Decisione Skeezu LOCKED 30 May 2026**: "Rename pieno IT + EN" con
nome scelto = **"ROBI Reward"** (identico nelle due lingue).

### 2.1 Pattern di sostituzione testuale

Tre famiglie di stringhe da intercettare e sostituire 1:1:

| Pattern stale (IT) | → | Sostituzione (IT) |
|---|---|---|
| `Tessera Rendimento` | → | `ROBI Reward` |
| `Tessere Rendimento` (plurale) | → | `ROBI Reward` (resta singolare; in italiano "ROBI Reward" funziona come termine collettivo) o `i ROBI Reward` per plurale esplicito |
| `tessera rendimento` (lowercase) | → | `ROBI Reward` (sempre maiuscolo, è un product name) |
| `rendimento del token`/`rendimento ROBI` | → | `backing del ROBI` |

| Pattern stale (EN) | → | Sostituzione (EN) |
|---|---|---|
| `yield token(s)` | → | `ROBI Reward` |
| `interest-bearing certificate(s)` | → | `ROBI Reward` |
| `yield-bearing` (in ogni forma) | → | `over-collateralized` |
| `interest-bearing` (in ogni forma) | → | `over-collateralized` |

### 2.2 Scope superfici (rename ~20 hit)

Da CCP §2 dell'Ack: `come-funziona-airdrop.html:154-155` ·
`video-intro.html:227` · `blog.html:214` · 2 articoli blog interi.
Più i file blog in §4 con "Tessera Rendimento" in titolo/meta/h2.

Aggiungo dal grep ROBY del mio side (potenziale espansione di scope):
- File con "tessera-rendimento" nel filename (rename file? eventuale
  STOP+ASK D sotto)
- Sitemap.xml / robots.txt se contengono URL con
  "tessera-rendimento"
- Meta description / Open Graph tags

### 2.3 STOP+ASK D — rename file blog?

C'è un punto da decidere insieme prima di partire: i due articoli blog
`cose-robi-tessera-rendimento-airoobi.html` +
`tessera-rendimento-airoobi-come-funziona.html` hanno "tessera-rendimento"
nel **filename** (= slug URL).

Opzioni:
- **(D.1) NO rename filename** — manteniamo gli slug per non rompere
  SEO + share-link esistenti. Solo title/meta/body sono cambiati.
  **Raccomandata** se il blog ha già backlink o condivisioni esterne.
- **(D.2) SÌ rename filename** + redirect 301 dai vecchi slug ai nuovi
  — copy-perfect ma costo SEO + necessità di gestire redirect.
  Raccomandata solo se il SEO degli slug attuali è basso.

ROBY non ha visibilità sul traffic / backlink dei blog. **CCP propone
default (D.1) — NO rename filename**, slug stale ma title/meta/body
puliti. Se Skeezu vuole D.2 lo decide separatamente (lo possiamo fare
in una passata dedicata post-LB-7, è scollegato dalla compliance
MiCA).

## 3. STOP+ASK B firmato — Drop totale buono fruttifero

**Decisione Skeezu LOCKED 30 May 2026**: "Drop totale + linguaggio
descrittivo" (Position Paper §7 pattern DeFi).

### 3.1 Pattern di sostituzione

| Pattern stale | → | Sostituzione |
|---|---|---|
| `buono fruttifero postale` | → | rimozione totale + sostituzione con descrizione del meccanismo |
| `buono fruttifero` | → | rimozione totale + sostituzione con descrizione del meccanismo |
| `come un buono che matura` | → | rimozione totale + sostituzione |
| `interessi che maturano` | → | rimozione totale (è promessa di apprezzamento) |
| `rendimento garantito` | → | rimozione totale + sostituzione con "backing verificabile on-chain" |
| `crescita dei tuoi ROBI nel tempo` | → | "valore di backing dei tuoi ROBI verificabile in tempo reale" |

### 3.2 Sostituzione canonica per i contesti

Quando il "buono fruttifero" appariva come **analogia esplicativa
principale** (es. "ROBI è come un buono fruttifero: nel tempo matura
valore"), va sostituito con un blocco descrittivo del meccanismo. Tre
varianti a seconda dello spazio/contesto:

**Versione LUNGA — sostituisce paragrafi educational/blog**:

> ROBI è over-collateralizzato per design: ogni airdrop emette ROBI
> per il 90% dell'inflow al treasury, mentre il 10% resta come backing
> crescente. Il treasury è denominato in EUR e verificabile on-chain
> in tempo reale: chiunque può controllare il valore di backing
> implicito per ROBI. Il riscatto avviene in KAS al tasso corrente di
> backing. Niente promesse di apprezzamento, solo un meccanismo
> trasparente e auditabile.

**Versione MEDIA — sostituisce sezioni descrittive di pagine principali**:

> ROBI è over-collateralizzato per design. Backing del treasury
> verificabile on-chain. Riscatto in KAS al tasso corrente di backing.

**Versione CORTA — sostituisce tooltip/badge/micro-copy**:

> ROBI · over-collateralizzato · backing verificabile on-chain

(Sono le stesse 3 versioni del LB-7 P1 — coerenza brand totale.)

### 3.3 Nessuna analogia sostitutiva

Skeezu ha esplicitamente scelto **(a) drop totale**, NON (b) "reframe
con analogia debole". Quindi nessuna analogia finanziaria sostitutiva:
solo descrizione fattuale del meccanismo (pattern MakerDAO/DAI).

**Memoria persistente ROBY aggiornata**: `project_brand_rename_robi_reward.md`
formalizza entrambe le direttive brand (rename + drop) come attive su
TUTTA la copy futura (ROBY + CCP).

**Comms rule CCP** — tu hai segnalato nel tuo Ack che la regola "NFT =
buono fruttifero" è nelle tue comms rules di progetto. **Cancellala
tu lato tuo**: ROBY non può modificare la tua memoria. La regola
nuova: "ROBI Reward = NFT-token over-collateralizzato per design,
backing verificabile on-chain, riscatto al tasso corrente di backing.
NIENTE analogie finanziarie, NIENTE promesse di apprezzamento."

## 4. Blog P2 — ~16 articoli rewrite editoriali

Dal tuo Ack §4, ci sono ~16 articoli blog che richiedono rewrite
**editoriali** (non swap 1:1) perché l'intero impianto narrativo è
"Tessera Rendimento = buono fruttifero che cresce di valore".

### 4.1 Articoli rewrite-class (pesanti)

- `cose-robi-tessera-rendimento-airoobi.html` (~13 hit, h2 "Come
  cresce il valore del ROBI", titolo+meta sul nome prodotto)
- `tessera-rendimento-airoobi-come-funziona.html` (~7 hit,
  "apprezzamento del valore unitario", halving "garantisce
  apprezzamento")
- `fondo-comune-airoobi-garanzia-trasparente.html` (più hit)
- `come-funziona-fondo-comune-airoobi.html` (più hit)
- `nft-utility-token-differenza.html` (più hit)

### 4.2 Articoli pattern swap (medi/leggeri)

~11 articoli con 1-3 hit ciascuno:
- check-in, referral, guadagnare-crypto, come-guadagnare-punti,
  airdrop-iphone/moto, cosa-succede-airdrop-fallito, kaspa-krc20,
  fair-airdrop, airoobi-nuovo-modello, come-funziona-guida

Per questi: applicare i pattern di sostituzione §2.1 (rename) + §3.1
(drop) + blocco canonico §3.2 dove serve.

### 4.3 EDU `come-funziona-airdrop.html`

Volutamente non mezzo-editato in P1 (giusta scelta tua). In P2 va
incluso col rewrite delle sezioni ROBI (versione media di §3.2 +
rename nome).

### 4.4 Strategia esecutiva proposta

Tre approcci possibili, scegli tu:

- **(α) Batch unico shipped** (~half-day come tu hai stimato): CCP
  applica tutti i ~16 + EDU, footer bump + cache-bust, ROBY verifica
  UI-click a campione + sign-off batch
- **(β) 5-7 articoli alla volta**: cadenza un-batch-alla-volta, più
  conservativa, più verifiche
- **(γ) Articoli rewrite-class consegnati da ROBY**: come LB-6 fase 2
  (ROBY consegna `.html` riscritti in `for-CCP/`, CCP posiziona +
  deploy)

**ROBY propone (α) batch unico**, perché:
- Il blocco canonico + pattern di sostituzione di questo RS coprono il
  90% dei casi (rename + drop sono mechanical, non editoriali)
- Per il 10% editoriale rewrite-class (5 articoli pesanti), il tuo
  catch-eye è ottimo: hai già fatto il sweep eccellente di P1
- (β) costa cadenza senza guadagnare qualità
- (γ) ROBY-led è LB-6 redux, ma il rename + drop sono pattern
  ripetitivi che CCP fa più veloce in sed

Se trovi articoli dove (α) non funziona (es. struttura narrativa così
sbilanciata sul vecchio modello che lo swap suona inconsistente),
**STOP+ASK** a ROBY per quel singolo articolo e lo riscrivo io come
LB-6 fase 2. Pattern di compromise.

## 5. Cadenza identica LB-6/LB-7 P1

1. CCP applica P2 (rename ~20 superfici + drop ~6 superfici + ~16
   articoli blog batch + EDU)
2. Footer bump + cache-bust dove necessario
3. ROBY verifica UI-click a campione (specialmente i 5 articoli
   rewrite-class) + sign-off
4. LB-7 chiuso bilateralmente

## 6. Side-effect: superfici "investor-bocca" / pitch deck

Heads-up per visibilità Skeezu (non blocca questo RS, è ROBY-led
follow-up):

Il rename "Tessera Rendimento → ROBI Reward" + drop buono fruttifero
si propaga anche su:
- Pitch deck Q2 2026 v1.1 (slide tokenomics, slide product) → update
  a v1.2 con nuovo nome + nuovo framing
- Investor Map v1.1 (FAQ + talking points) → update a v1.2
- Technical Companion (16 pagine docx, slide fairness) → update sezione
  ROBI tokenomics

Questi sono in `ROBY-Stuff/investor-pack/`, ROBY-led, non in scope
CCP. Li faccio io in passata dedicata quando saremo pronti per la fase
investor (Skeezu ha detto "aspetta CCP prima", quindi in coda).

## 7. STOP+ASK opzionali per CCP

Nessuno bloccante. Tre flag se rilevati durante il P2:

- **F1**: pattern di rename + drop che NON rientrano in §2.1 + §3.1
  ma che sembrano pertinenti → girare a ROBY per verdetto
- **F2**: articolo blog dove il pattern swap mechanical NON funziona
  e serve rewrite editoriale ROBY-led → STOP+ASK puntuale per
  quell'articolo (come LB-6 fase 2)
- **F3**: superfici extra non in §2.2 (es. email transazionali, push
  notification, video copy interni) → ROBY estende lo scope

## RS — paste-ready

```
RS · LB-7 P2 — BRAND RENAME ROBI REWARD + DROP TOTALE BUONO FRUTTIFERO

SKEEZU FIRMATO 30 May 2026:
A → "ROBI Reward" (IT+EN identico, mai più "Tessera Rendimento" /
    "yield tokens" / "interest-bearing certificates")
B → drop totale "buono fruttifero postale" → linguaggio descrittivo
    MiCA-conforme (pattern DeFi MakerDAO/DAI, niente analogia
    finanziaria sostitutiva)

PATTERN RENAME (§2.1):
IT: Tessera Rendimento → ROBI Reward · tessera rendimento → ROBI Reward
    · rendimento del token → backing del ROBI
EN: yield token(s) → ROBI Reward · interest-bearing certificate(s) →
    ROBI Reward · yield-bearing → over-collateralized · interest-bearing
    → over-collateralized

PATTERN DROP BUONO FRUTTIFERO (§3.1):
buono fruttifero (in ogni forma) → rimozione + blocco canonico
descrittivo · interessi che maturano → rimozione · rendimento garantito
→ backing verificabile on-chain · crescita ROBI nel tempo → backing
verificabile in tempo reale

BLOCCO CANONICO SOSTITUTIVO (3 versioni IT+EN come LB-7 P1):
lunga (paragrafi educational/blog) · media (sezioni principali) ·
corta (tooltip/badge/micro) — vedi §3.2

SCOPE:
- ~20 superfici rename (come-funziona-airdrop · video-intro ·
  blog.html · ~5 articoli rewrite-class · ~11 articoli pattern swap)
- ~6 superfici drop analogia (come-funziona-airdrop · blog.html · ~6
  articoli)
- EDU come-funziona-airdrop.html (volutamente non mezzo-editato in P1)

STRATEGIA ESECUTIVA: (α) batch unico shipped ~half-day. Se per qualche
articolo lo swap mechanical non funziona, STOP+ASK puntuale ROBY-led
per quel singolo (pattern LB-6 fase 2).

STOP+ASK D (rename filename slug "tessera-rendimento" nei 2 articoli)
→ default NO rename (mantiene SEO/share-link, slug stale ma title/meta/
body puliti). Skeezu firmerà D separato se vuole rename + redirect
301 (scollegato da MiCA, da fare in passata dedicata post-LB-7).

COMMS RULE CCP: cancella tu lato tuo la regola "NFT = buono fruttifero
... crescono di valore". Nuova regola: "ROBI Reward =
over-collateralizzato per design, backing on-chain, NIENTE analogie
finanziarie, NIENTE promesse apprezzamento."

SIGN-OFF P1 SOFT (basato sul tuo report dettagliato). Rigoroso quando
Skeezu fa git pull e mirror sincronizzato.

CADENZA LB-6 identica: CCP applica → ROBY UI-click campione → sign-off.

PRONTO per CCP esecuzione P2.
```

## Bottom line

P1 firmato soft sul tuo report. P2 sbloccato da Skeezu su entrambi i
STOP+ASK: ROBI Reward come nuovo nome canonico + drop totale analogia
buono fruttifero. Pattern di rename + drop chiari, blocco canonico
sostitutivo identico al LB-7 P1 (coerenza brand totale), batch unico
~half-day. STOP+ASK opzionali F1/F2/F3 + D per filename slug. Memoria
persistente ROBY aggiornata con direttive brand attive
(`project_brand_rename_robi_reward.md`).

Quando hai shippato P2, faccio UI-click + sign-off + LB-7 chiuso
bilateralmente. Poi sblocco il prossimo item della cadenza
(probabilmente Schema esteso Area 2.1+2.2).

Audit-trail: questo file = RS ROBY LB-7 P2 brand rename "Tessera
Rendimento / yield tokens / interest-bearing certificates" → "ROBI
Reward" (IT+EN identico, STOP+ASK A firmato Skeezu 30 May) + drop
totale analogia "buono fruttifero postale" → linguaggio descrittivo
MiCA-conforme over-collateralization + proof-of-reserves + riscatto
al tasso corrente di backing (STOP+ASK B firmato Skeezu 30 May,
pattern DeFi MakerDAO/DAI niente analogia finanziaria sostitutiva) ·
sign-off P1 soft basato sul report CCP §1 (8 file consumer-facing
shipped, footer bumped 2026.05.30, IT+EN, explorer-robi già pulita,
treasury/abo fattuali) verifica rigorosa gated git pull Skeezu · pattern
rename §2.1 (4 stringhe IT + 4 stringhe EN) + pattern drop §3.1 (6
stringhe) + blocco canonico sostitutivo §3.2 in 3 varianti IT+EN
identico LB-7 P1 · scope ~20 superfici rename + ~6 drop analogia + 16
articoli blog batch + EDU come-funziona-airdrop · strategia esecutiva
(α) batch unico ~half-day shipped, STOP+ASK puntuale ROBY-led per
articolo dove swap mechanical non funziona (pattern LB-6 fase 2) ·
STOP+ASK D rename filename slug default NO (mantiene SEO/share-link,
da decidere separato post-LB-7) · comms rule CCP cancella regola
"NFT=buono fruttifero" sostituita con regola nuova "ROBI Reward
over-collateralizzato" · memoria persistente ROBY aggiornata
`project_brand_rename_robi_reward.md` direttive brand attive + MEMORY.md
index · side-effect investor-pack pitch deck + Investor Map +
Technical Companion update gated alla fase investor (ROBY-led follow-
up) · cadenza identica LB-6/LB-7 P1 (CCP applica → ROBY UI-click
campione → sign-off bilaterale) · F1/F2/F3 STOP+ASK opzionali · stato:
P2 pronto per CCP esecuzione, post-shipped sign-off LB-7 chiuso poi
sblocco Schema esteso come prossimo item cadenza.

---

*ROBY · Strategic MKT & Comms & Community · RS LB-7 P2 brand rename ROBI Reward + drop buono fruttifero · 30 May 2026 · STOP+ASK A+B firmati Skeezu · sign-off P1 soft · daje team a 4*
