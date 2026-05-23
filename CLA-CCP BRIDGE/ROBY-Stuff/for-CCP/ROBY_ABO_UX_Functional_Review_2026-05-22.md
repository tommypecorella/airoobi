---
title: ROBY · ABO v2 — Review UX & Funzionale + Redesign
purpose: Audit live dell'intero gestionale ABO (22 voci), findings su doppioni / sezioni morte / integrità numeri / RBAC, e proposta di redesign in stile dashboard collaborativa con modello permessi per-modulo. Accompagna il mockup interattivo e l'RS brief per CCP.
date: Ven 22 maggio 2026
audience: Skeezu · CCP
status: REVIEW + REDESIGN PROPOSTO · mockup pronto · RS brief per CCP pronto
related: ABO_v2_Mockup_2026-05-22.html · for-CCP/ROBY_RS_ABO_v2_Redesign_Brief_2026-05-22.md
---

# ABO v2 — Review UX & Funzionale

## TL;DR

Ho cliccato live tutte le **22 voci** dell'ABO come CEO e letto il sorgente
(`02_app_pages/abo.html`, 268 KB, SPA vanilla su Supabase REST). L'impianto
tecnico è **sano** — gran parte dei numeri sono già aggregati reali dal DB.
I problemi sono di **architettura, non di fondamenta**: doppioni di menu,
4 sezioni che renderizzano pagina bianca, alcune isole di numeri manuali che
contraddicono gli aggregati, e un sistema permessi che ha solo 2 ruoli e non
permette di assegnare tab/funzioni.

**Verdetto: ristrutturazione, non demolizione.** Si tiene il motore, si rifà
la pianta. Comprimo **22 voci → 13 moduli** in 3 aree, zero doppioni, zero
pagine morte; aggiungo un layer **RBAC per-modulo/per-azione** con il CEO come
unico Super User; e impongo un **contratto di integrità** sui numeri.

Accompagnano questo documento il **mockup interattivo** (`ABO_v2_Mockup`) e
l'**RS brief per CCP**.

---

## 1. Metodo

Audit live su `www.airoobi.app/abo`, sessione CEO, click-through di ogni voce
di menu + lettura del sorgente e delle migration `user_roles` /
`collaborators_rpc`. Snapshot repo (21 apr) confrontato col live: il live ha
**più voci** dello snapshot (il gruppo "W4 · ATTO 4-6" non era nel mirror).

ABO oggi = **8 gruppi, 22 voci**: Dashboard (1) · Utenti (1) · Airdrop (5) ·
W4 · ATTO 4-6 (4) · Tokenomics (5) · Finanze (2) · Fairness (1) · Sistema (3).

---

## 2. Cosa funziona — da NON perdere nel refactor

- **Architettura tecnica solida.** SPA leggera, dati via Supabase REST, funzioni
  di load ben nominate. Niente framework pesante da smontare.
- **Molti numeri SONO reali.** Statistiche airdrop (4 totali, 1 presale, 1
  closed, 2 annullati) combaciano col conteggio righe in Gestione; "ARIA
  media/utente" = circolante ÷ utenti; Conto ARIA (132 transazioni, 6600 ARIA)
  e Treasury Fondi sono tabelle vere.
- **Esiste già una base ruoli.** Tabella `user_roles`, funzione `is_admin()`,
  pannello Collaboratori, RPC `admin_*`. Non si parte da zero — si estende.
- **Brand coerente.** Dark + oro, in linea col resto della piattaforma.

Il refactor parte da qui: questi pezzi si tengono.

---

## 3. Cosa non funziona

### A. Architettura informativa — doppioni e sovrapposizioni

- **"Conto AIROOBI" è una voce di menu che compare DUE volte**, identica, in
  due gruppi diversi (Tokenomics e Finanze). E sono due cose **scollegate**: una
  è il conto ARIA della piattaforma (saldo reale 6600 ARIA da submission fee),
  l'altra è il registro patrimoniale aziendale (fiat/crypto/NFT, tutto a 0,
  inserito a mano). Stesso nome, due posti, due significati. È il caso peggiore.
- **L'airdrop è affettato in 4 voci separate** — Valutazioni, Gestione,
  Statistiche, Analysis — che lavorano tutte sulla **stessa tabella**
  `airdrops`. Valutazioni (lista filtrata per stato) ≈ Gestione (lista con
  azioni); Statistiche = conteggi per stato (derivabili dalla lista); Analysis =
  breakdown score. 4 voci di menu, 1 entità.
- **Treasury / Tokenomics / Finanze** sono tre gruppi che parlano tutti di
  soldi. Le metriche ROBI in particolare sono sparse su Overview, Treasury,
  ROBI Valuation e NFT per tipo.
- **Fairness Index vs Analysis** si sovrappongono (entrambe analizzano lo score
  per airdrop); per giunta Fairness Index fa anche da lista "utenti test" — due
  funzioni non correlate nella stessa pagina.
- **Tre etichette per lo stesso pulsante**: RICARICA / AGGIORNA / ANALIZZA. E
  caricamento incoerente: alcune sezioni si popolano da sole, altre richiedono
  un clic manuale.

### B. Sezioni morte

- **Il gruppo "W4 · ATTO 4-6" — EVALOBI, Dispute, Swap, TX Explorer — sono 4
  voci su 22 che renderizzano pagina completamente bianca** (DOM vuoto,
  confermato). Il 18% del menu non porta da nessuna parte.
- **Il nome del gruppo è un codename interno di sprint** ("W4 · ATTO 4-6")
  finito nel menu di produzione. Gergo di sviluppo esposto come UI.

### C. Integrità dei numeri — il punto chiave

ABO mischia numeri **auto-aggregati** (buoni) e numeri **inseriti a mano**
(che driftano). Le isole manuali contraddicono gli aggregati:

| Metrica | Dove appare | Valore | Causa |
|---|---|---|---|
| Valore nominale ROBI | Overview · Treasury | €0,8973 | corretto (treasury ÷ ROBI) |
| Valore ROBI stimato | ROBI Valuation | **€0,00** | input Treasury manuale fermo a 0 |
| Treasury (€) | Treasury Balance | €100,50 | reale, da `treasury_funds` |
| Treasury totale | ROBI Valuation | **€0,00** | campo manuale, etichettato "AUTO" ma non lo è |
| Conteggio ROBI | Overview · Treasury · ROBI Valuation | 112 | — |
| ROBI "Totale emessi" | NFT per tipo | **110** | query diversa, non riconciliata |
| ARIA circolante | Overview · ARIA Metrics | 495.488 | reale |
| "ARIA circolante" (riga) | Patrimonio aziendale | **0** | riga di registro manuale, stale |

La radice è una sola: **campi manuali che alimentano metriche derivate mostrate
altrove**. Il footer di NFT per tipo lo ammette: *"Treasury inserito
manualmente"*. Risultato: lo stesso valore ROBI è €0,8973 in due pagine e €0,00
in una terza.

### D. RBAC — quello che chiedi oggi è impossibile

Il modello attuale: tabella `user_roles` con un CHECK constraint che ammette
**letteralmente due ruoli** — `admin` ed `evaluator`. Il pannello Collaboratori
assegna solo categorie a un valutatore e controlla solo l'accesso a
`/gestione`. Non esiste alcun modo di dare a una persona "Treasury sì, Utenti
no" o "solo Messaggi". L'obiettivo — ogni tab/funzione assegnabile — **oggi non
è realizzabile** con questo schema.

### E. UX / dashboard

- L'Overview è una **griglia piatta di 12 card** senza gerarchia, che mischia
  metriche vanity (video visti, foto profilo impostate) e numeri critici.
- **Nessun concetto di "assegnato a me"**: ABO è un pannello CEO-centrico, non
  uno strumento di collaborazione.
- Le tabelle non hanno ricerca/ordinamento/paginazione: regge ora con dataset
  piccolo, si rompe a scala.

---

## 4. Cosa farei — ABO v2

### 4.1 Verdetto

**Refactor, non rewrite.** Si tengono SPA, Supabase REST, brand, le funzioni di
load reali. Si cambiano: information architecture, layer permessi, isole di
numeri manuali.

Riferimento di layout: **Microsoft Dynamics 365** (model-driven app) — command
bar in alto, site-map raggruppata a sinistra con area-switcher, list-view con
tab di stato, form di dettaglio. È il pattern giusto per un gestionale
multi-utente.

### 4.2 Nuova information architecture — 22 voci → 13 moduli, 3 aree

| Area | Modulo v2 | Sostituisce / assorbe |
|---|---|---|
| **Operations** | Dashboard | Overview (role-aware) |
| | Pipeline airdrop | Valutazioni + Gestione + Statistiche |
| | Analisi & Fairness | Analysis + Fairness Index |
| | Messaggi | Messaggi |
| | Utenti | Ultimi utenti + utenti test |
| **Tesoreria** | Treasury & Fondi | Treasury |
| | Conto ARIA piattaforma | "Conto AIROOBI" (Tokenomics) — rinominato |
| | Patrimonio aziendale | "Conto AIROOBI" (Finanze) — rinominato |
| | Cost Tracker | Cost Tracker |
| | ARIA & ROBI | ARIA Metrics + ROBI Valuation + NFT per tipo |
| **Sistema** | Collaboratori & Permessi | Collaboratori (esteso a RBAC vero) |
| | Categorie | Categorie |
| | Engine Config | Engine Config |

**W4 · ATTO 4-6 (EVALOBI, Dispute, Swap, TX Explorer): rimosso dal menu** finché
non è costruito. Va dietro un flag "Moduli in sviluppo", nascosto di default —
mai una voce di menu che porta a pagina bianca. Quando CCP li completa, si
inseriscono nell'area giusta (Dispute → Operations; Swap/TX Explorer →
Tesoreria).

Risultato: **3 aree, 13 moduli reali, 0 doppioni, 0 pagine morte.**

### 4.3 Modello RBAC

- **Unità di permesso = il modulo.** Ognuno dei 13 moduli è assegnabile in modo
  indipendente.
- **Azioni per modulo**, non solo accesso: es. Pipeline airdrop ha Vedere /
  Modificare / Approva-Rifiuta / Esegui Draw come grant distinti. Vedere ≠ agire.
- **Ruoli = template** che riempiono la matrice in un clic, poi rifinibili cella
  per cella:
  - *CEO — Super User*: tutto, immutabile, **uno solo**. Non declassabile né
    rimovibile. Unico che vede "Collaboratori & Permessi".
  - *Valutatore*: Pipeline airdrop (vedere+modificare+approvare, scoped per
    categoria), Analisi, Messaggi, Dashboard. Niente Tesoreria, niente Sistema.
  - *Community Manager*: Messaggi, Utenti, Dashboard, Analisi.
  - *Tesoriere*: tutta l'area Tesoreria, Dashboard. Niente approvazioni airdrop.
  - *Analista (sola lettura)*: vedere su Dashboard / Analisi / ARIA&ROBI /
    Utenti / Pipeline. Nessuna modifica.
  - *Personalizzato*: il CEO sceglie i grant cella per cella.
- **Lo scoping per categoria** (già esistente) resta per il Valutatore.
- **La sidebar si renderizza sui permessi**: un collaboratore vede solo i moduli
  che gli sono assegnati. Un Valutatore che apre ABO vede Dashboard + Airdrop e
  nient'altro.
- **"Vedi ABO come…"** — il CEO può simulare la vista di qualsiasi ruolo
  (anteprima permessi). È il modo più veloce per verificare un'assegnazione.

### 4.4 Contratto di integrità dei numeri

- Ogni numero a schermo ha **una sola query sorgente**. Nessuna metrica derivata
  da un campo manuale che è anche mostrato altrove.
- Il campo Treasury manuale di ROBI Valuation: **eliminato**. Valore ROBI =
  Treasury Balance reale (da `treasury_funds`) ÷ ROBI in circolazione reale (da
  `nft_rewards`). Una formula, ovunque.
- Conteggio ROBI: una query sola, riconciliare 110 ↔ 112.
- Input manuali ammessi **solo** per dati genuinamente esterni (saldo banca,
  ricavi ads) e sempre etichettati "inserito a mano · aggiornato il {data}".
- "AUTO" deve voler dire AUTO. Ogni KPI porta un tag di fonte visibile.

### 4.5 Dashboard role-aware

La home non è una griglia di card: è **"il mio lavoro"**. Pannello "Da fare ora"
in cima (es. "1 conversazione da rispondere", "1 airdrop in presale"), poi una
striscia KPI essenziale con tag di fonte. Un Valutatore vede i suoi airdrop da
valutare; un Tesoriere vede lo stato Treasury.

---

## 5. Il mockup

`ABO_v2_Mockup_2026-05-22.html` — mockup interattivo, ispirato a Dynamics 365.
Da aprire nel browser. Mostra:

- la nuova IA (3 aree, sidebar raggruppata, command bar);
- la **Dashboard** role-aware con KPI source-tagged;
- la **Pipeline airdrop** che unifica 4 voci vecchie;
- **Collaboratori & Permessi** — la matrice permessi per-modulo/per-azione coi
  template di ruolo: è il pezzo centrale;
- **ARIA & ROBI** con la fonte Treasury unica (il fix di integrità dimostrato);
- il selettore **"Vedi come"** in alto: cambia ruolo e la sidebar si ridisegna
  mostrando solo i moduli concessi — la prova viva del modello RBAC.

I numeri nel mockup sono quelli reali rilevati nell'audit.

---

## 6. Handoff a CCP

L'RS brief `for-CCP/ROBY_RS_ABO_v2_Redesign_Brief_2026-05-22.md` traduce questo
documento in spec implementativa: estensione schema `user_roles`, render della
sidebar sui permessi, merge dei moduli, kill del campo Treasury manuale. Le
scelte di stack/DB sono call di CCP — qui c'è il *cosa* e il *perché*, non il
*come* tecnico.

Ordine suggerito: prima il contratto di integrità (basso rischio, alto valore),
poi la nuova IA (merge moduli), poi il layer RBAC.

---

*ROBY · Strategic MKT & Comms & Community · ABO v2 Review & Redesign · 22 May 2026 · daje team a 4*
