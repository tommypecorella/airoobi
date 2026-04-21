# CLA-CCP BRIDGE — Mirror materiale AIROOBI

Cartella di scambio tra **CCP** (Claude Code, dev/ops sul Raspberry Pi 5) e **CLA** (Claude Desktop, content/marketing/pitch/community).

Contiene una **copia completa** di tutto il materiale del repository `projects/airoobi/` organizzato in sottocartelle tematiche. Skeezu prende l'intera cartella e la passa a CLA per aggiornamento massivo del contesto.

> **Regola operativa:** CCP aggiorna questa cartella in modo sistematico ad ogni modifica rilevante del repo. Vedi `_SNAPSHOT_INFO.md` per data e commit dell'ultimo snapshot.

---

## Struttura

| # | Cartella | Contenuto |
|---|---|---|
| 01 | `01_deliverables_docs/` | Tutta la documentazione: business plan, tokenomics, brand, legal, product, tech, SQL schema, bridge protocol, registry deliverable |
| 02 | `02_app_pages/` | Pagine core della dApp (`dapp.html`, `abo.html`, `airdrop.html`) |
| 03 | `03_site_pages/` | Pagine sito istituzionale + EDU + auth + investors (21 file HTML) |
| 04 | `04_blog_articles/` | Articoli blog SEO (38 articoli) |
| 05 | `05_source_code/` | JS/CSS sorgenti (`src/`): dapp.js, home.js, airdrop.js, topbar.js, relativi CSS + `styles/brand.css` |
| 06 | `06_public_assets/` | Asset pubblici: immagini airdrop, loghi AIROOBI, simboli, favicon, og-image, icons, fonts |
| 07 | `07_supabase/` | Migrations SQL (~120+), edge functions, utility SQL |
| 08 | `08_scripts/` | Script Node: report, auto_draw, ratio_optimizer, crontab |
| 09 | `09_config_meta/` | Config progetto: vercel.json, package.json, manifest, sitemap, service worker, playwright config, ads |

---

## File meta (root della cartella)

- `_README.md` — questo file
- `_SNAPSHOT_INFO.md` — timestamp, commit hash, versione app
- `_DELIVERABLES_LIST.md` — lista completa deliverable con stato attuale

---

## Divisione di lavoro CCP ↔ CLA

Vedi `01_deliverables_docs/bridge/REGOLE.md` per i dettagli.

**Sintesi:**
- **CCP** (io) → codice FE/BE, migration SQL, deploy, test, bug triage, pubblicazione blog, query DB
- **CLA** → copy blog, email campaign, investor pitch, social, community management, deliverable business

---

## Fonte di verità

Il repository `github.com/tommypecorella/airoobi` rimane la **source of truth**. Questa cartella è un mirror operativo per facilitare il lavoro di CLA senza che lui debba fare `git clone`. Ogni volta che Skeezu la passa a CLA, il contesto torna allineato al commit indicato in `_SNAPSHOT_INFO.md`.
