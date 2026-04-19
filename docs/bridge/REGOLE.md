# REGOLE CCP ↔ CLA

**Documento condiviso** tra CCP (Claude Code, dev/ops) e CLA (Claude Desktop, content/marketing/pitch).
Il bridge operativo è in [`cla-ccp-bridge.md`](./cla-ccp-bridge.md).

## Chi fa cosa

| Area | Agente | Esempio |
|---|---|---|
| Codice FE/BE | CCP | modifica `dapp.js`, migration SQL |
| Deploy CI | CCP | `vercel deploy`, `supabase db push` |
| Test Playwright | CCP | run + report |
| Blog posts | CLA scrive | CCP pubblica in `/blog/*.html` |
| Email campaign | CLA scrive copy | CCP invia via Postmark quando attivo |
| Investor pitch | CLA | `investitori.html`, slide, docs |
| Social posts | CLA | copy + asset |
| Community management | CLA | risposte Telegram/Discord |
| Bug user-reported | CCP | triage + fix |
| Query DB / report dati | CCP | Supabase + output Markdown |
| Copy UI (button, tooltip, EDU page) | collaborativo | CCP baseline, CLA affina |

## Governance pagine / file

**CLA owner:**
- `investitori.html`
- `/blog/*.html` (scrittura; CCP pubblica)
- Email templates (quando attivi)
- Deliverable business in `docs/business/*` (CLA può riscrivere, CCP mantiene versioning coerente)

**CCP owner:**
- `dapp.html`, `home.html`, `airdrop.html`, `come-funziona-airdrop.html`, `faq.html`, `landing.html`
- `src/*.js`, `src/*.css`
- `supabase/migrations/*.sql`
- `tests/**/*`
- `vercel.json`, `package.json`

## Protocollo bridge

Il file `cla-ccp-bridge.md` è un journal di scambio. Chi tocca:

1. Aggiunge entry al **Log** (formato: `- **YYYY-MM-DD HH:MM [AGENTE]** — <cosa fatto>`)
2. Sposta voci tra **Per CCP (da CLA)** e **Per CLA (da CCP)** quando serve azione dall'altra parte
3. Non cancella storia. Log > 20 entry → sposta le più vecchie in `cla-ccp-bridge-archive.md`

**CCP** legge il bridge all'inizio di ogni sessione (via file system locale sul Pi, path: `/home/drskeezu/projects/airoobi/docs/bridge/cla-ccp-bridge.md`).

**CLA** legge il bridge via `web_fetch` su:
`https://raw.githubusercontent.com/tommypecorella/airoobi/main/docs/bridge/cla-ccp-bridge.md`

Quando CCP aggiorna, fa commit+push così CLA vede. Quando CLA vuole aggiornare, scrive la sua entry nella chat con Skeezu, Skeezu la gira a CCP che fa commit.

## Source of truth

- **Dati runtime (utenti, airdrops, ROBI, ARIA)**: Supabase (accesso CCP via MCP)
- **Regolamento motore airdrop**: `docs/business/AIROOBI_Airdrop_Engine_v2.md` (tecnico) e `come-funziona-airdrop.html` (utente)
- **Business foundation**: `docs/business/AIROOBI_Foundations_v3.md`
- **Tokenomics**: `docs/business/AIROOBI_Tokenomics_v3.md`
- **Brand guidelines**: `docs/business/AIROOBI_Brand_Guidelines_v3.md`
- **Sitemap / product structure**: `docs/business/AIROOBI_Sitemap_v2.md`

Quando cambia il motore airdrop: CCP aggiorna engine doc v2.x + `come-funziona-airdrop.html`. CLA poi adatta pitch/blog se rilevante.
