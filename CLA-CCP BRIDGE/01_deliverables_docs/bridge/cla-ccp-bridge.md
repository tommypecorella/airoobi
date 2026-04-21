# CLA ↔ CCP bridge

**Ultimo aggiornamento:** 2026-04-19 23:45 (CCP — spostato in repo GitHub)
**Owner repo AIROOBI:** Skeezu (tommaso.pecorella@outlook.com)

> Journal di scambio tra **CCP** (Claude Code, dev/ops) e **CLA** (Claude Desktop, content/marketing/investor pitch).
> Regole + governance: [`./REGOLE.md`](./REGOLE.md).
>
> **Accesso:**
> - **CCP**: lettura/scrittura locale sul Pi a `/home/drskeezu/projects/airoobi/docs/bridge/cla-ccp-bridge.md`
> - **CLA**: lettura via `web_fetch` su `https://raw.githubusercontent.com/tommypecorella/airoobi/main/docs/bridge/cla-ccp-bridge.md`. Per scrivere, CLA risponde a Skeezu che gira a CCP per commit.

---

## 📌 Stato corrente

- **Alpha-Net live** su airoobi.app (scoring v4 · earnings v2 · early-close lockdown · fairness guard)
- Versione corrente: `alfa-2026.04.20-3.35.0`
- Ultimo deploy DB: `supabase db push` del 19 Apr 19:30 + fix migrations 20:00
- Test Playwright: 104/104 post-scoring-v4
- Blocker: **nessuno** (pronti per campagna apertura Alpha Brave)

## 📥 Per CCP (da CLA)

_Nulla al momento. Skeezu o CLA inseriscono qui le richieste tecniche pending verso dev._

## 📥 Per CLA (da CCP)

- [ ] **Blog post di lancio Alpha Brave**. Fonte: `docs/business/AIROOBI_Foundations_v3.md` v3.4 (con fasi 4 stadi, scoring v4 semplificato, welcome grant 1000 ARIA + 5 ROBI). Audience: early adopter curiosi di crypto/marketplace alternativi. Tono: invito, non hype. CTA "Entra nei primi 1000 su airoobi.app/signup".
- [ ] **Copy email waitlist → signup** per chi è nella lista d'attesa. Punti chiave: Alpha-Net aperto, 1000 posti, welcome grant ARIA+ROBI, referral bonus, link diretto /signup.
- [ ] **Aggiornamento `investitori.html`**: allineare a v2.7 del motore (scoring mono-fattoriale anti-gambling, fasi Alpha/Beta/Pre-Prod/Mainnet con soglie utenti). Skeezu ha indicato questa pagina come tua (CLA) il 2026-04-19.

## 🗓 Log (più recente in alto, max 20 entry)

- **2026-04-19 23:45 CCP** — Bridge spostato da `/home/drskeezu/shared/` al repo `docs/bridge/`. Aggiunto `REGOLE.md` con governance. CLA approvato protocollo, legge via raw.githubusercontent.com.
- **2026-04-19 23:15 CCP** — Creato file bridge. Mappato ruoli CCP=dev, CLA=content/pitch/marketing. Pronti per F5 (comunicazione Alpha Brave).
- **2026-04-19 20:30 CCP** — Deploy scoring v4 + earnings v2 completato. Fix notifications.data + execute_draw args + status 'sale' pre-draw. Airdrop Poltrona 3in1 (4219b39a) chiuso anticipatamente con early-close, winner assegnato.
- **2026-04-19 14:30 CCP** — Chiusura F3 (earnings v2: streak 50 ARIA/gg, referral 5+5 ROBI, trigger airdrop milestones). Migrations applicate.
- **2026-04-19 mattina CCP** — Chiusura F2 (UIX polish: redesign /airdrops, photo wizard, icone flat, pagina EDU /come-funziona-airdrop). Report Playwright 61/61 public pass → deliverable F2 close.

---

## Formato entry Log (per chi aggiunge)

```
- **YYYY-MM-DD HH:MM [AGENTE]** — <cosa fatto>. <eventuale handoff o blocker>.
```

Esempio:
```
- **2026-04-20 09:00 CLA** — Bozza blog post lancio. Review pending CCP per link corretti.
```

## Archivio

Quando il Log supera 20 entry, sposta le più vecchie in `cla-ccp-bridge-archive.md` (stesso direttorio).
