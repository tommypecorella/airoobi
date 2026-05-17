# ROBY-Stuff · indice cartella

> **Cartella di delivery di ROBY** (Strategic MKT, Communication & Community Manager · Claude Desktop).
> Tutto quello che ROBY produce — pitch, strategy, comms, brand, investor materials, tech notes — finisce qui.
>
> **Struttura per audience:** quattro sotto-cartelle, ognuna pensata per un destinatario specifico. Skeezu sceglie cosa girare a chi senza confondersi.
>
> **Convenzione master:** ROBY scrive **solo** in questa cartella e nelle sue 4 sotto-cartelle. Eccezione: asset che vivono nativamente nel repo principale (brief tecnici per CCP letti da `01_deliverables_docs/tech/`, articoli blog SEO in `04_blog_articles/`, copy email in repo). In quei casi, ROBY pubblica nella sezione naturale del repo + mette qui solo la versione PDF di delivery.
>
> **Last sync:** 27 Aprile 2026.

---

## Struttura

```
ROBY-Stuff/
├── _INDEX.md                       ← questo file (master overview)
│
├── investor-pack/                  ← per finanziatori esterni
│   ├── AIROOBI_Pitch_Deck_Q2-2026.pptx + .pdf
│   ├── AIROOBI_Airdrop_Engine_Fairness_Technical_Companion.docx + .pdf
│   └── AIROOBI_Investor_Map_Exit_Strategy.docx + .pdf
│
├── comms-pack/                     ← per esecuzione interna ROBY+Skeezu
│   ├── AIROOBI_Piano_Comunicazione_90gg.docx + .pdf
│   └── AIROOBI_Editorial_Calendar_90gg.xlsx
│
├── brand-and-community/            ← asset live + standalone deployabili
│   ├── AIROOBI_Brand_Kit_One_Pager.html + .pdf
│   └── AIROOBI_Alpha_Brave_Landing.html
│
└── for-CCP/                        ← TUTTO quello che CCP deve leggere
    ├── _INDEX_CCP.md               ← manifest dedicato per CCP, reading order
    ├── AIROOBI_Engine_Hardening_Sprint_W1.pdf
    ├── CCP_Reply_W1_Materials_2026-04-27.md
    ├── ROBY_Reply_to_CCP_W1_2026-04-27.md
    ├── ROBY_Decision_Request_ROBI_Policy_2026-04-27.md
    ├── ROBY_Tech_Note_ROBI_Mining_Coherence_2026-04-27.md
    └── AIROOBI_Brand_Kit_One_Pager.pdf  (copia per Quick Win #1 brand sweep)
```

---

## Cosa girare a chi (cheat sheet)

| Destinatario | Cartella da girare | Comando suggerito |
|---|---|---|
| **CCP (al Pi 5)** | `for-CCP/` | `git add ROBY-Stuff/for-CCP/ && git commit -m "ROBY → CCP" && git push` |
| **Investor pre-seed** (Variant, BlueYard, angel) | `investor-pack/` (zip o link condiviso) | Allega via email o data room |
| **ROBY + Skeezu** (esecuzione daily) | `comms-pack/` | Apri in Cowork quando esegui Piano 90gg |
| **Designer / dev frontend** (futuri hire) | `brand-and-community/` | Onboarding asset |
| **Tutti** | l'intero `ROBY-Stuff/` | Per audit completo o handover |

---

## Investor pack

Per finanziatori — Pre-Seed Q2 2026.

| File | Tipo | Versione | Scopo | Data |
|---|---|---|---|---|
| `AIROOBI_Pitch_Deck_Q2-2026.pptx` | PowerPoint editabile | v1.1 | 15 slide investor-grade · brand BLACK/GOLD/WHITE · slide #13 Team aggiornata (CCP CIO/CTO via SSH) | 27 Apr 2026 |
| `AIROOBI_Pitch_Deck_Q2-2026.pdf` | PDF condivisibile | v1.1 | Stesso contenuto, share-ready | 27 Apr 2026 |
| `AIROOBI_Airdrop_Engine_Fairness_Technical_Companion.docx` | Word editabile | v1.0 | 16 pagine · math + fairness + 6 buchi tecnici esposti onestamente in §10 | 27 Apr 2026 |
| `AIROOBI_Airdrop_Engine_Fairness_Technical_Companion.pdf` | PDF | v1.0 | Versione condivisibile | 27 Apr 2026 |
| `AIROOBI_Investor_Map_Exit_Strategy.docx` | Word editabile | v1.1 | 5 cluster · 25 nomi · term sheet · 3 lanes di exit | 27 Apr 2026 |
| `AIROOBI_Investor_Map_Exit_Strategy.pdf` | PDF | v1.1 | Per condivisione interna | 27 Apr 2026 |

**Update pending post-Sprint W1 (Day 7+):**
- Pitch deck → v1.2 con slide #5 reskin (formula pity v5.1) e slide #11 Traction "6 buchi chiusi pre-Stage 1"
- Technical companion → v1.1 con §10 da "open" a "closed in W1"

## Comms pack

Per esecuzione interna del Piano 90gg Alpha Brave (7 → 1.000 utenti).

| File | Tipo | Versione | Scopo | Data |
|---|---|---|---|---|
| `AIROOBI_Piano_Comunicazione_90gg.docx` | Word editabile | v1.1 | Piano operativo · time-to-first-win <30gg come north-star · pillar Behind-the-scenes con CCP al lavoro | 27 Apr 2026 |
| `AIROOBI_Piano_Comunicazione_90gg.pdf` | PDF | v1.1 | Per condivisione | 27 Apr 2026 |
| `AIROOBI_Editorial_Calendar_90gg.xlsx` | Excel | v1.1 | 6 fogli: README · Calendar (12 settimane) · Channels · Pillars · KPI Tracker · Risks | 27 Apr 2026 |

**Update pending post-Sprint W1:**
- Piano 90gg → v1.2 con persona "Marina · custode di valore inutilizzato" + plan pre-arruolamento seller W5-W6

## Brand & community

Asset live e standalone. Deployabili o stampabili così come sono.

| File | Tipo | Versione | Scopo | Data |
|---|---|---|---|---|
| `AIROOBI_Brand_Kit_One_Pager.html` | HTML standalone | v1.0 | Brand kit completo: palette, font, voice, do/don't tassativi anti-gambling, asset system | 27 Apr 2026 |
| `AIROOBI_Brand_Kit_One_Pager.pdf` | PDF stampabile | v1.0 | Versione print-ready (A3 portrait) | 27 Apr 2026 |
| `AIROOBI_Alpha_Brave_Landing.html` | HTML standalone | v1.0 | Landing teaser community: hero, counter live, signup form, FAQ. Pronta per push su `airoobi.com/diventa-alpha-brave` | 27 Apr 2026 |

**Wire pending (CCP):**
- Counter Alpha Brave → wire su Supabase (option A: count(profiles) trasparente da 7) — Day 1 sprint W1.

## For-CCP

Tutto il materiale che CCP deve leggere per essere allineato. Vedi `for-CCP/_INDEX_CCP.md` per il reading order dettagliato e priorità (P0/P1/P2). I file di scambio CCP↔ROBY (Reply, Tech Note, Decision Request) vivono qui nativamente — niente duplicazione altrove.

---

## Convenzioni di naming

```
AIROOBI_<Document>_<Version-or-Phase>.<ext>     ← file di delivery (investor, comms, brand)
ROBY_<Topic>_<DateOrVersion>.<ext>              ← file ROBY → CCP (in for-CCP/)
CCP_<Topic>_<DateOrVersion>.<ext>               ← file CCP → ROBY (in for-CCP/)
```

Esempi:

- `AIROOBI_Pitch_Deck_Q2-2026.pptx`
- `AIROOBI_Engine_Hardening_Sprint_W1.pdf`
- `ROBY_Decision_Request_ROBI_Policy_2026-04-27.md`
- `CCP_Reply_W1_Materials_2026-04-27.md`

Versioning policy:

- **v1.0** prima release
- **v1.1, v1.2** per fix tipografici / aggiornamenti minori (es. coerenza naming team Apr 27)
- **v2.0+** per revisioni sostanziali (es. post-Hardening Sprint la maggior parte dei file investor-pack diventa v2.0)

---

## Workflow CCP ↔ ROBY tramite Skeezu

```
ROBY produce in for-CCP/ → Skeezu git push → CCP legge da repo e lavora
                                     ↓
CCP risponde con CCP_*.md in for-CCP/ → Skeezu git pull/notifica ROBY → ROBY rilegge
                                     ↓
                          [iterazione fino a chiusura]
```

Skeezu è il bridge umano. Niente messaggi sparsi, niente Telegram nello sviluppo (zero costi extra oltre Claude Max). Read-only mutuale: ROBY non modifica file `CCP_*`, CCP non modifica file `ROBY_*` e nemmeno `AIROOBI_*` di delivery.

Per urgenze: Skeezu è il single channel. Se CCP/ROBY hanno bisogno di sblocco bloccante, scrivono un file `<Author>_Urgent_*.md` in `for-CCP/` e Skeezu lo aprirà al prossimo giro.

---

## Quick links — cosa serve a chi (workflow daily)

**Per Skeezu prima di una call investor:**
- Apri `investor-pack/AIROOBI_Pitch_Deck_Q2-2026.pdf` per share via email.
- Allega `investor-pack/AIROOBI_Airdrop_Engine_Fairness_Technical_Companion.pdf` per chi chiede tech depth.
- Tieni aperto `investor-pack/AIROOBI_Investor_Map_Exit_Strategy.docx` per ricordarti cluster e talking points.

**Per Skeezu allineamento sprint hardening con CCP:**
- Apri `for-CCP/_INDEX_CCP.md` per vedere cosa CCP deve leggere e in quale ordine.
- `git add ROBY-Stuff/for-CCP/ && git push` ogni volta che ROBY aggiorna o produce nuovi file qui.

**Per esecuzione Piano Comms 90gg (Skeezu + ROBY):**
- Calendar settimanale: `comms-pack/AIROOBI_Editorial_Calendar_90gg.xlsx` foglio `Calendar`.
- KPI review venerdì: stesso file, foglio `KPI Tracker`.
- Brand-check su ogni post: `brand-and-community/AIROOBI_Brand_Kit_One_Pager.html`.

**Per CCP durante lo sprint:**
- Reading order: `for-CCP/_INDEX_CCP.md`.
- Source of truth tech spec: `01_deliverables_docs/tech/AIROOBI_Engine_Hardening_Sprint_W1.md` nel repo principale.

---

ROBY · 27 Apr 2026 · v1.1 (post-restructure ROBY-Stuff in 4 sub-folders by audience)
