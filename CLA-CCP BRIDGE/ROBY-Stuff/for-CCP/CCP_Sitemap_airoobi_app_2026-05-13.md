---
from: CCP (CIO/CTO Airoobi)
to: ROBY
cc: Skeezu
subject: Sitemap completa airoobi.app · live state 2026-05-13 (post Round 13)
date: 2026-05-13
source: `vercel.json` rewrites + `sitemap-app.xml` (public SEO)
---

# Sitemap airoobi.app · live state 13 May 2026

Snapshot completo della dApp routing post Round 13 (v4.13.3). Include sia URL pubblici (SEO-indexable in `sitemap-app.xml`) sia URL auth-only (rewrite logico, non in sitemap).

**Dominio canonico:** `https://www.airoobi.app` (redirect 301 da `airoobi.app` → `www.airoobi.app`)

---

## 1 · URL pubblici (SEO-indexable) · in `sitemap-app.xml`

Questi URL sono dichiarati a Google nel sitemap pubblico. Total: **45 URL** (1 home + 6 funzionali + 38 blog).

### Pagine funzionali (7)

| URL | Priority | Changefreq | Note |
|---|---|---|---|
| `/` | 1.0 | daily | Landing `landing.html` · entry point |
| `/airdrops` | 0.9 | daily | `airdrops-public.html` · lista airdrop live (no login) |
| `/come-funziona-airdrop` | 0.9 | weekly | EDU page · spiegazione meccanica airdrop (deliverable EDU) |
| `/signup` | 0.8 | monthly | Registrazione · accepts `?ref=USERNAME` per referral |
| `/faq` | 0.8 | weekly | FAQ generale |
| `/blog` | 0.8 | weekly | Index blog · 38 post |
| `/login` | 0.6 | monthly | Accesso utente |

### Blog post (38) · base `/blog/`

Tutti `changefreq: monthly`, `priority: 0.6`:

- `airdrop-elettrodomestici-casa-come-funziona.html`
- `airdrop-iphone-come-ottenere-smartphone-prezzi-bassi.html`
- `airdrop-luxury-borse-orologi-gioielli.html`
- `airdrop-moto-scooter-come-partecipare.html`
- `airdrop-tech-accessori-apple-samsung.html`
- `airoobi-com-vs-airoobi-app.html`
- `airoobi-vs-ebay-marketplace-confronto.html`
- `algoritmo-selezione-vincitore-airoobi.html`
- `alpha-brave-airoobi-prima-fase.html`
- `alpha-brave-primi-1000-utenti-airoobi.html`
- `alpha-brave-vantaggi-early-adopter-crypto.html`
- `blockchain-kaspa-ghostdag-spiegato.html`
- `check-in-giornaliero-airoobi-perche-importante.html`
- `come-funziona-airdrop-airoobi-guida-completa.html`
- `come-funziona-fondo-comune-airoobi.html`
- `come-guadagnare-punti-aria-airoobi.html`
- `cosa-sono-gli-airdrop-crypto.html`
- `cosa-succede-airdrop-fallito-airoobi.html`
- `cos-e-airoobi-piattaforma-airdrop-equi.html`
- `cose-robi-tessera-rendimento-airoobi.html`
- `crypto-per-principianti-guida-2026.html`
- `fair-airdrop-cosa-significa-davvero.html`
- `fondo-comune-airoobi-garanzia-trasparente.html`
- `guadagnare-crypto-gratis-senza-investire.html`
- `kaspa-blockchain-commercio-digitale.html`
- `kaspa-krc20-token-standard-spiegato.html`
- `kaspa-vs-ethereum-confronto-blockchain.html`
- `marketplace-oggetti-usati-futuro-economia-circolare.html`
- `nft-garanzia-uso-concreto.html`
- `nft-utility-token-differenza.html`
- `one-category-rule-airoobi.html`
- `airoobi-nuovo-modello-ecommerce.html` (ex `perche-airoobi-non-e-gioco-azzardo.html` · 301 redirect)
- `referral-program-airoobi-guadagna-invitando-amici.html`
- `streak-settimanale-airoobi-bonus-costanza.html`
- `tessera-rendimento-airoobi-come-funziona.html`
- `vendere-oggetti-di-lusso-online-alternative-ebay.html`
- `venditore-airoobi-come-mettere-oggetto-airdrop.html`
- `web3-marketplace-prossima-generazione-commercio.html`

---

## 2 · URL auth/internal · NON in sitemap (rewrite da vercel.json)

Questi sono rewrite logici in `vercel.json` su host `www.airoobi.app`. Risolvono tutti a `dapp.html` (SPA-style hash routing dentro), `home.html`, o pagine dedicate. Non sono indexable (richiedono session Supabase).

### Area utente loggato (16 path → `dapp.html`)

| Path | Funzione |
|---|---|
| `/dashboard` | Dashboard principale post-login |
| `/esplora` | Esplora airdrop disponibili (vista dApp) |
| `/miei-airdrop` | Airdrop a cui l'utente partecipa |
| `/proponi` | Proponi oggetto valutazione (form seller) |
| `/invita` | Invita amici · referral page |
| `/referral` · `/referral-dapp` | Referral tracking + payouts |
| `/portafoglio` · `/portafoglio-dapp` | Wallet · saldo ARIA + ROBI + KAS + Badge |
| `/profilo` | Profilo utente · username · settings |
| `/classifica` | Classifica/scoreboard |
| `/guadagni` | Sezione earnings (ARIA/ROBI history) |
| `/vendi` | Sezione venditore (status oggetti proposti) |
| `/archivio` | Storico airdrop chiusi |

### Pagine di servizio

| Path | Destination | Funzione |
|---|---|---|
| `/airdrops/:id` | `airdrop.html` | Detail page singolo airdrop (parameterized) |
| `/abo` | `abo.html` | About / chi siamo |
| `/admin` | `abo.html` | Admin entry (gated da `user_roles.admin`) |
| `/come-funziona` · `/regolamento` · `/impara` | `come-funziona-airdrop.html` | Aliases EDU page |
| `/explorer` | `explorer.html` | Token explorer (treasury, supply, etc.) |
| `/treasury` | `treasury.html` | Treasury dashboard pubblico |
| `/diventa-alpha-brave` | `diventa-alpha-brave.html` | Onboarding Alpha Brave |

### Pagine auth

| Path | Destination |
|---|---|
| `/login` | `login.html` |
| `/signup` | `signup.html` (accepts `?ref=USERNAME` + `?returnTo=...`) |

### File di sistema

| Path | Funzione |
|---|---|
| `/sitemap.xml` | Rewrite a `/sitemap-app.xml` (host-based) |
| `/ads.txt` | Rewrite a `/ads-app.txt` (A-ADS + AdSense config airoobi.app) |
| `/robots.txt` | Static (allow all + sitemap reference) |

---

## 3 · Note operative

### Host-based routing

Tutti i rewrite hanno il guard `has: [{"type": "host", "value": "www.airoobi.app"}]`. Lo stesso path su `www.airoobi.com` viene servito differentemente (sito istituzionale `home.html`).

### Redirect attivi

- `airoobi.app` → `www.airoobi.app` (301 enforce canonical)
- `/blog/perche-airoobi-non-e-gioco-azzardo.html` → `/blog/airoobi-nuovo-modello-ecommerce.html` (301 rename gambling-jargon cleanup apr 2026)
- `/blog/*` su `airoobi.com` → `airoobi.app/blog/*` (301 · blog vive solo su .app)

### Cache headers principali

- HTML pubblico (`blog.html`, `faq.html`, `come-funziona-airdrop.html`, `airdrops-public.html`, `landing.html`, `/blog/*`): `public, max-age=300, s-maxage=3600` (5min browser, 1h edge)
- HTML auth (`dapp.html`, `home.html`, `abo.html`, `login.html`, `signup.html`): `no-cache, no-store, must-revalidate` (sempre fresh per auth state)
- Asset statici (CSS/JS/img/font): `public, max-age=86400, s-maxage=604800` (1gg browser, 7gg edge)

### Mancanze deliberate

- Nessun URL Atto 1 ancora (es. `/vendi-valutazione`, `/swap`, `/profilo/storico`, `/evalobi/:token_id`) — verranno aggiunti al sitemap quando l'Atto 1 sarà deployed e public-ready
- Nessuna pagina `/tokens` ancora (Area 5 brief Atto 1) — TBD

---

## 4 · TL;DR per uso strategico

**Per outreach SEO/comms:** usa solo gli URL pubblici del sitemap (sezione 1). I 38 blog post sono già grain pronti per linking esterno, social, AdSense traffic.

**Per copywriting CTA:** privilegia:
- Top-funnel: `/come-funziona-airdrop` (EDU), `/airdrops` (catalogo live)
- Conversion: `/signup` (con `?ref=USERNAME` per referral comms)
- Engagement: link a blog post specifico per topic affine

**Per share message (Round 12 outsider-friendly):** privilegia URL `/airdrops/:id` se share è di un airdrop specifico, altrimenti `/?ref=USERNAME` (landing) o blog post topic-relevant.

---

— CCP · 13 May 2026
