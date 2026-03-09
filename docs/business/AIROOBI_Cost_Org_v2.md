# AIROOBI — Cost Structure Analysis
**BUS-004 · Version 2.0 · Final · 08 Marzo 2026**

> v2.0: Resend eliminato, sostituito da Postmark. Stack infrastruttura aggiornato. Stage 0 chiuso. Target infrastruttura produzione: €60/mese.

---

## 1. Stack Infrastruttura — Costi Attuali (Stage 0)

| Servizio | Costo/mese | Stato | Note |
|---|---|---|---|
| Supabase Free | €0 | ✅ Attivo | Auth, DB, RLS — sufficiente per Stage 0 |
| Vercel Hobby | €0 | ✅ Attivo | Deploy CDN globale da GitHub push |
| Cloudflare Free | €0 | ✅ Attivo | DNS, Proxy, Web Analytics |
| GitHub | €0 | ✅ Attivo | Repo pubblico tommypecorella/airoobi |
| A-ADS | €0 costo | ✅ Attivo | Banner #2429619 — genera revenue |
| Google AdSense | €0 costo | ⏳ In revisione | Applicato, in attesa approvazione |
| Postmark | ~€15 | ⏳ In attesa approvazione | SMTP email transazionali. Server AIROOBI ID 18417614. SOSTITUISCE Resend |
| **TOTALE Stage 0** | **€0 ora / €15 con Postmark** | | |

> ❌ **ELIMINATO:** Resend — abbandonato durante Stage 0. Non usare più.

---

## 2. Target Infrastruttura Produzione (Stage 1+)

| Servizio | Costo/mese | Quando attivare | Trigger |
|---|---|---|---|
| Postmark | ~€15 | Subito (appena approvato) | Email transazionali live |
| Supabase Pro | ~€25 | A 50.000 utenti attivi | Limiti piano free superati |
| Vercel Pro | ~€20 | Valutare in futuro | Performance/analytics avanzati |
| **TOTALE target** | **~€60/mese** | Stage 1 maturo | |

---

## 3. AI Tools — Costi

| Tool | Costo attuale | Alternativa | Raccomandazione |
|---|---|---|---|
| Claude API (ARIA su Pi) | A consumo (~$0,01/1K token) | Claude Max ~$100/mese flat | Valutare Claude Max all'avvio Stage 1 |
| Claude chat (product/docs) | Piano utente (Claude Max attivo) | — | Mantenere |
| OpenClaw runtime | €0 (self-hosted su Pi 5) | — | Mantenere |

> Claude Max include Claude Code illimitato. Con ARIA attiva quotidianamente si raggiunge facilmente la soglia di convenienza in Stage 1.

---

## 4. Costi Fissi Team — Anno 1

| Ruolo | Importo/Anno | Note |
|---|---|---|
| Founder & CEO | €50.000 | Full-time, equity significativa |
| CTO & Co-Founder | €55.000 | Senior, blockchain expertise |
| Product Manager | €40.000 | Mid-senior, da M1 |
| Frontend Developer | €45.000 | Web3 UI, da M1 |
| Operations Manager | €38.000 | KYC + venditori, da M2 |
| Marketing & Community | €35.000 | Community + social, da M3 |
| **TOTALE TEAM** | **€263.000/anno** | 6 FTE |

---

## 5. Break-Even Analysis

| Scenario | Revenue/mese | Costi fissi/mese | Break-Even? |
|---|---|---|---|
| Stage 0 (chiuso) | €0–3.000 | €0 (infra free) | ✅ Operativo |
| Alpha Brave / Stage 1 early | €4.000 | €28.233 | ❌ -€24.233 (investimento) |
| Beta / M3-4 | €12.000 | €28.233 | ❌ -€20.233 |
| Mainnet M5 | €35.000 | €28.233 | ⚡ -€1.233 (quasi break-even) |
| M6 con Corporate | €65.000 | €28.233 | ✅ +€24.767 EBITDA |
| M12 Full Scale | €200.000 | €32.000 | ✅ +€130.000 EBITDA |

---
---

# AIROOBI — Organizational Structure
**BUS-006 · Version 2.0 · Final · 08 Marzo 2026**

> v2.0: AI-first model confermato in produzione. ARIA dev agent operativo su Pi 5. Claude Max attivo.

---

## 1. Principio Guida

> **Lean Team + Heavy AI Automation = High Scalability**

Stage 0 è stato completato con il solo Founder + AI agents. Tutta la documentazione, il codice frontend, la strategia e la UI sono stati prodotti con Claude. Questo modello è sostenibile economicamente e scalabile.

---

## 2. AI come Dipendenti — Stack Corrente

| Agente AI | Ruolo | Tool | Costo | Stato |
|---|---|---|---|---|
| Claude (chat) | Product strategy, documentazione, codice, design | Claude.ai Max | Piano utente | ✅ Operativo |
| ARIA (dev agent) | Sviluppo continuo, commit, code review via Telegram | OpenClaw + Claude Code su Pi 5 | API a consumo → Claude Max Stage 1 | ✅ Operativo |

> ARIA è il "dipendente tecnico principale" di AIROOBI in Stage 0-1. Gira 24/7 su Raspberry Pi 5 (`skeeberrypi`), risponde a comandi Telegram: `dev:`, `status`, `commit:`, `review`, `test`.

---

## 3. ARIA Dev Agent — Dettagli Tecnici

| Parametro | Valore |
|---|---|
| Hardware | Raspberry Pi 5 (`skeeberrypi`) |
| Runtime | OpenClaw v2026.3.2 |
| LLM | Claude Sonnet 4.6 (via API) / Claude Max (diretto) |
| Memoria | `~/.openclaw/agents/main/memory/airoobi/AIROOBI_CONTEXT.md` |
| Skill | `~/.openclaw/agents/main/skills/airoobi.md` |
| Comandi Telegram | `dev:` `status` `commit:` `review` `test` |
| Repo | `~/projects/airoobi` |

---

## 4. Automation First — Dove AI sostituisce persone

- **Sviluppo frontend:** ARIA (Claude Code) — 100% automatizzato in Stage 0
- **Documentazione e strategia:** Claude chat — 100% automatizzato
- **Customer support L1:** chatbot AI (FAQ, status) — 80% ticket risolti automaticamente
- **KYC processing:** provider esterno (Onfido/Veriff) — zero intervento umano
- **Smart contract execution:** estrazione vincitore, Tessere, distribuzione Fondo — 100% automatico (Stage 2+)
- **Video ad serving:** sistema automatico CPM-based — zero gestione manuale
- **Valutazione oggetti:** AI pre-screening (70% dei casi) — umano solo per edge cases

---

## 5. Hiring Roadmap Stage 1+

| Ruolo | Quando | Priorità | Motivazione |
|---|---|---|---|
| CTO & Co-Founder | Stage 1 early | CRITICA | Smart contract Kaspa, architettura on-chain |
| Backend Developer | M4-5 | Alta | Scalabilità, endpoint API, Supabase Edge Functions |
| Operations Manager | M3 | Alta | KYC process, venditori P2P, compliance |
| Marketing & Community | M3 | Alta | Community 5.000+, referral, contenuti |
| Business Development | M5 | Alta | Corporate airdrop sales, partnership brand |
| Data Analyst | M6 | Media | KPI tracking, Treasury analytics, fraud detection |

---

## 6. OKR Framework — Anno 1

**Obiettivo 1: Costruire e lanciare con successo**
- KR1: Alpha Brave live con 500 utenti invitation-only
- KR2: Smart contract auditati da terze parti entro M4
- KR3: Mainnet live entro M5 con 8 categorie e KYC obbligatorio

**Obiettivo 2: Costruire una community engaged**
- KR1: 5.000 utenti KYC-verified entro M6
- KR2: 15.000 utenti entro M12
- KR3: NPS ≥ 50 su base mensile da M5

**Obiettivo 3: Raggiungere la sostenibilità economica**
- KR1: Break-even operativo entro M6
- KR2: Fondo Comune NFT ≥ €100.000 entro M9
- KR3: 3+ campagne Corporate/Business attive entro M8
