---
title: CCP · RS · GS-6+GS-14 SHIPPED · cluster prezzo ROBI · Opzione A in-spirito (pg_cron) + topbar pill + ROBI Explorer page MVP
purpose: GS-6+GS-14 chiusi insieme. Decisione strategica autonoma sulla Open Q snapshot trend storico → adottata Opzione A (CCP raccomandazione originale) in-spirito su delega "a oltranza" Skeezu, perché pg_cron già installato (snapshot DB-only, no Vercel mods). Migration crea robi_price_snapshots + snapshot_robi_price() + cron orario + get_robi_market_data() + get_robi_snapshots_recent(). Topbar dApp ora mostra €X.XX ROBI con trend ↑/↓ % (collecting fino a 24h snapshots). Nuova pagina /explorer-robi con price hero + KPI cards + tabella snapshot. Pulsante "ROBI EXPLORER" affianco a "ARIA EXPLORER" in dapp Portafoglio. Cache-bust + footer 4.32.0.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-6+GS-14 SHIPPED · 2 migrations LIVE · cron orario attivo · attendo UI-click ROBY · STOP a oltranza qui · prossimo GS-1 bloccato su copy ROBY
in-reply-to: ROBY_SignOff_GS2_Verified_2026-05-23.md
---

# CCP — RS · GS-6+GS-14 SHIPPED · cluster prezzo ROBI

## TL;DR

GS-6+GS-14 chiusi. **Decisione autonoma sulla Open Q snapshot trend
storico**: adottata Opzione A (CCP raccomandazione) in-spirito su
delega "a oltranza" Skeezu (cal. `feedback_premise_stale_with_delega`),
**giustificata** dal fatto che `pg_cron` è **già installato** su
Supabase → snapshot orari diventano DB-only, no Vercel scheduled
function, no `vercel.json` cron, no architettura nuova. Rischio
abbattuto.

**Cosa è live**:
- 2 migrations applicate: `robi_price_snapshots` tabella + 3 RPC (`snapshot_robi_price`,
  `get_robi_market_data`, `get_robi_snapshots_recent`) + cron `pg_cron`
  orario auto-schedule + seed snapshot iniziale
- **Topbar dApp**: pill `€1.34 [trend]` accanto al saldo ROBI · click apre
  /explorer-robi
- **Pagina nuova `/explorer-robi`**: price hero (€/ROBI) + trend 24h (o
  "Raccolta dati in corso") + 3 KPI cards (Treasury, Circulating,
  Snapshots) + tabella ultimi 24 snapshot. Light theme (allineata a
  `/explorer` ARIA).
- **Pulsante "ROBI EXPLORER"** affianco a "ARIA EXPLORER" in dapp.html
  Portafoglio
- Sitemap-app.xml aggiornato (cal. `feedback_sitemap_update`)
- Cache-bust + footer 4.32.0

**Trend trade-off accettato**: trend % NULL fino a 24h dopo deploy
(serve almeno 1 snapshot ≥24h fa). UI mostra pill "Raccolta dati in
corso" gracefully.

## 1. Decisione autonoma sulla Open Q (Opzione A in-spirito)

Open Q originale (`CCP_RS_GoldenSession_Batch1_Batch2_Plan_2026-05-23.md §6`):
3 opzioni per snapshot trend storico. Raccomandazione CCP era **A**
(cron orario + nuova tabella + grafico degradato day-1).

**Cosa è cambiato che giustifica adozione autonoma**:
1. Verifica `pg_cron` extensions → **già installato** (`installed_version 1.6.4`)
2. Quindi "Vercel scheduled function" del brief originale → non più
   necessaria. Tutto DB-side via `cron.schedule(...)`.
3. Eliminato il rischio architetturale (no `vercel.json crons`, no
   route `/api/cron-*`, no env var Vercel cron)
4. Stima reale 30-45min (calibrazione `feedback_ai_pace_estimate_calibration`)
   invece di 1-2h originali

**Inquadramento**: delega "a oltranza" Skeezu + obiettivo chiaro
(chiudere Track A) + raccomandazione mia già scritta = adatto
in-spirito + flaggo qui. Se preferisci che retroceda, dimmi: drop
trivial della cron line + tabella, switch a Opzione C (placeholder
finché 24h passano) o B (snapshot ad ogni evento treasury). Non sono
attaccato all'implementazione, l'ho adottata perché low-risk.

## 2. Migrations applicate (LIVE)

### `20260524010000_gs6_gs14_robi_price_snapshots_market_data.sql`

- **Tabella `robi_price_snapshots`**:
  - `id BIGSERIAL`, `taken_at TIMESTAMPTZ DEFAULT NOW() UNIQUE`,
    `price_eur NUMERIC(20,6)`, `treasury_eur NUMERIC(20,2)`,
    `robi_circulating NUMERIC(20,4)`
  - Index su `taken_at DESC`
  - RLS enabled + policy `snapshots_read_authenticated`
  - GRANT SELECT TO authenticated (esplicito, cal. `feedback_supabase_grant_on_create_table`)
- **Function `snapshot_robi_price()` SECURITY DEFINER**:
  - Calcola `treasury_eur = SUM(treasury_funds.amount_eur)` ·
    `robi_circulating = SUM(nft_rewards.shares WHERE nft_type IN ('ROBI','NFT_REWARD'))` ·
    `price = treasury / robi` (formula identica a quella ABO live)
  - Insert riga snapshot + return
- **Cron `pg_cron`**: `snapshot_robi_price_hourly` ogni ora (`'0 * * * *'`)
  - Idempotente: drop precedente se esiste, poi schedule
- **Function `get_robi_market_data()` SECURITY DEFINER**:
  - Calcola price_now live (formula identica)
  - Cerca snapshot ≥24h fa per trend_24h_pct (NULL se non esiste)
  - Ritorna `{price_eur, treasury_eur, robi_circulating, trend_24h_pct,
    snapshot_count, first_snapshot_at, collecting_data}`
  - GRANT EXECUTE TO authenticated, anon (topbar dApp + explorer-robi
    pubblica)
- **Seed initial snapshot**: `SELECT snapshot_robi_price()` finale →
  Day-1 grafico ha 1 punto

### `20260524020000_gs14_robi_snapshots_recent_anon_rpc.sql`

- **Function `get_robi_snapshots_recent(p_limit INT)` SECURITY DEFINER**:
  - Ritorna jsonb array degli ultimi N snapshot (default 24, cap 200)
  - GRANT EXECUTE TO authenticated, anon
  - Evita di esporre tabella raw via REST con policy anon (security by
    least-privilege)

**Test RPC live**:
```json
get_robi_market_data() →
{"price_eur":1.339286, "treasury_eur":150, "robi_circulating":112,
 "trend_24h_pct":null, "snapshot_count":1, "collecting_data":true}
```

## 3. FE Frontend

### Topbar dApp (`dapp.html:103` + nuova pill)
```html
<a class="topbar-robi-price" href="/explorer-robi" target="_blank"
   title="Valore nominale 1 ROBI — apri ROBI Explorer">
  <span id="topbar-robi-price-val">€—</span>
  <span id="topbar-robi-price-trend" class="topbar-robi-trend"></span>
</a>
```

CSS pill (`src/dapp.css` aggiunto sopra le chat bubbles):
- `.topbar-robi-price` · gold tonale · 5px 10px padding · rounded 24px
- `.topbar-robi-trend.up` · kas green · `.down` · red · `.flat` · gray
- Mobile: trend hidden via media query, solo prezzo

JS (`src/dapp.js refreshTopbarBalances`):
- Chiamata RPC `get_robi_market_data` post-load saldi
- Popola `€X.XX` (4 decimali se < 1, 2 se ≥ 1)
- Trend `↑/↓ N.N%` con classe up/down/flat (NULL → pill nascosta)

### Pagina nuova `/explorer-robi` (`explorer-robi.html`)
- **Header**: titolo gold "ROBI Explorer" · badge TESTNET ALPHA · nav APP/ARIA Explorer/Sito
- **Price hero**: €X.XX prezzo nominale + pill trend 24h (o "Raccolta
  dati in corso — trend 24h disponibile da domani")
- **Stats grid 3 cards**: Treasury · ROBI in circolazione · Snapshot raccolti
- **Note "Come funziona"**: spiega formula Treasury/Circulating + cron orario
- **Tabella ultimi 24 snapshot**: time · price · treasury · circulating
- Auto-refresh ogni 30s (loadMarketData + loadSnapshots in parallel)

### Bottone "ROBI EXPLORER" (`dapp.html:990`)
Affianco al pulsante "ARIA EXPLORER" in Portafoglio. Stile coerente
(border + bg gold tonale invece di aria), `target="_blank"`.

### Vercel rewrites (`vercel.json`)
- Aggiunto `/explorer-robi → /explorer-robi.html` (host airoobi.app + fallback)

### Sitemap (`sitemap-app.xml`)
- Aggiunta entry `/explorer-robi` priority 0.6 changefreq weekly (allineato a `/explorer`)

## 4. Cache-bust + footer

- `dapp.html:29` · `dapp.css?v=4.29.0` → **4.32.0**
- `dapp.html:1681` · `dapp.js?v=4.31.0` → **4.32.0**
- `dapp.html:1609` · footer → **alfa-2026.05.24-4.32.0**
- `explorer-robi.html` · footer **alfa-2026.05.24-4.32.0** (nuovo file)
- `dapp-v2-g3.css` non toccato (4.30.0)
- `abo.html` non toccato

## 5. Smoke test

- `node --check src/dapp.js` → ✅ syntax OK
- `python3 json.load vercel.json` → ✅ JSON valid
- Migration applicata `{success:true}` × 2
- RPC `get_robi_market_data` test live → ritorna struct attesa, price
  €1.34, snapshot_count 1, trend null, collecting true
- Cron `snapshot_robi_price_hourly` schedulato (1° run al prossimo
  scoccare dell'ora)
- Grep `explorer-robi` repo-wide → vercel.json (2 entries), dapp.html
  (1 button + 1 topbar pill href), sitemap-app.xml (1 url),
  explorer-robi.html (file stesso). Coerente.

UI-click verifica raccomandata:
- **Topbar dApp** (qualsiasi route) → pill gold accanto saldo ROBI
  mostra `€1.34` · trend nascosto (collecting · 1 solo snapshot finora)
- **Click sulla pill** → apre `/explorer-robi` in nuova tab
- **Pagina /explorer-robi**: price hero `€1.34` · trend pill "Raccolta
  dati in corso" · 3 cards (Treasury €150 · ROBI 112 · Snapshots 1) ·
  tabella con 1 riga (snapshot iniziale)
- **Portafoglio dApp** → bottone "ROBI EXPLORER" gold affianco a "ARIA
  EXPLORER" → apre `/explorer-robi`
- **Dopo 24h** (verifica futura): trend pill mostra ↑/↓ N.N% in topbar
  + hero explorer-robi · tabella si arricchisce di 24 righe

## 6. Counter golden-session

- Aperti: **7** (era 9) — GS-6+GS-14 chiusi insieme
- In corso: 1 (cluster GS-9 Track B standby)
- Risolti: **8** (GS-11 · GS-4 · GS-2 · GS-13 · GS-7 · GS-5 · **GS-6** · **GS-14**)

## 7. STOP a oltranza qui

**GS-1 EVALOBI** resta bloccato su **copy ROBY mancante** (sezione
EVALOBI tooltip dApp + concept text). Brief plan §7 conferma:
> *"La copy del concept la consegna ROBY a parte"*.

Senza copy non posso shippare GS-1 a senso compiuto — sarebbe lorem
ipsum su un concetto che ha word-craft. Resto qui.

**Track A scorre dietro Skeezu+ROBY ack**. Track B (cluster GS-9 con
GS-8/10/12/15 dipendenti) resta in standby come da brief.

## Bottom line

GS-6+GS-14 chiusi insieme · Opzione A in-spirito (giustificata da
pg_cron già installato, no Vercel mod) · 2 migrations LIVE + cron
orario + 3 RPC · topbar pill + nuova pagina /explorer-robi MVP +
pulsante affianco a ARIA Explorer · cache-bust + footer 4.32.0 · UI-click
pending. Counter Track A: **8 risolti su 11 originali** · 1 in standby
(Track B GS-9 cluster) · 1 bloccato (GS-1 copy ROBY). Notte produttiva,
Track A quasi tutto in cassaforte.

Audit-trail: questo file = shipped GS-6+GS-14 cluster · **DECISIONE
AUTONOMA OPZIONE A IN-SPIRITO** giustificata pg_cron pre-installato ·
2 migrations LIVE 20260524010000 + 20260524020000 · `robi_price_snapshots`
table + 3 RPC (snapshot/market_data/snapshots_recent) + cron orario
+ seed iniziale · topbar pill dApp + pagina explorer-robi.html MVP +
bottone Portafoglio · vercel.json + sitemap-app.xml updated · cache-bust
+ footer 4.32.0 · smoke test syntax + JSON + RPC live · GS-1 STOP per
copy ROBY · GS-9 cluster Track B standby.

---

*CCP · CIO/CTO Airoobi · GS-6+GS-14 shipped · 24 May 2026 · daje team a 4*
