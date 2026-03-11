# AIROOBI_CONTEXT.md
**File di contesto per ARIA · Aggiornato: 08 Mar 2026 · Stage 0 CHIUSO**

---

## PROGETTO

AIROOBI è un marketplace di airdrop decentralizzato su blockchain Kaspa. Gli utenti guadagnano ARIA coin (check-in, video, referral) e li usano per comprare blocchi di partecipazione agli airdrop. Il sistema è legalmente distinto dal gambling grazie al meccanismo di garanzia NFT (Tessere) backed dal Fondo Comune.

**Live:** airoobi.com  
**Repo:** github.com/tommypecorella/airoobi  
**Founder:** Tommaso Pecorella (DrSkeezu)

---

## STACK

- **Frontend:** HTML5 + Vanilla JS, file unico `index.html`
- **Deploy:** Vercel (auto-deploy da push GitHub)
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Email:** Postmark (in attesa approvazione — sostituisce Resend)
- **DNS:** Cloudflare
- **Analytics:** Cloudflare Web Analytics + Vercel Analytics
- **Ads:** A-ADS banner #2429619 + Google AdSense (in revisione)
- **Blockchain:** Kaspa (integrazione on-chain → Stage 2)

---

## CREDENZIALI (solo per ARIA — non committare)

- Supabase URL: `https://vuvlmlpuhovipfwtquux.supabase.co`
- Supabase anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co`
- Admin: visibile solo a `tommaso.pecorella@outlook.com`

---

## DESIGN SYSTEM (TASSATIVO)

**Palette:** BLACK `#000000` · GOLD `#B8960C` · WHITE `#FFFFFF`  
**ARIA blue:** `#4A9EFF` · **KAS green:** `#49EACB`  
**Font heading:** Cormorant Garamond · **Body:** Instrument Sans · **Mono:** DM Mono  
**Dark mode only. Nessun altro colore.**

**Logo:** Font geometrico thin. OO: O sinistra = anelli aperti grandi, O destra = cerchio pieno piccolo scuro. B con tratto verticale alto.

---

## TOKENOMICS (DEFINITIVO)

| Asset | Tipo | Ruolo |
|---|---|---|
| ARIA | Valuta piattaforma | Guadagnata con check-in/video/referral, usata per comprare blocchi |
| Tessera Coin | Proxy wallet blu | Mostra saldo ARIA accumulato |
| Tessera Rendimento | NFT oro | Certificato di resa — converti parte o tutto in KAS |
| Tessera Kaspa | Proxy wallet verde | Mostra saldo KAS ricevuto dopo conversione |

**REGOLE TASSATIVE:**
- Zero menzione di €0.10 nell'area utente (solo in admin panel `adm-coin-price`)
- Non affermare mai che gli ARIA si convertono direttamente in KAS — meccanismo TBD
- Le Tessere sono **proxy wallet ricaricabili** — si converte l'importo, non la tessera stessa

**Guadagno ARIA:**
- Daily check-in: +10 ARIA
- Video view: +10 ARIA (max 5/giorno)
- Referral: +100 ARIA
- Streak settimanale: +100 ARIA

---

## STATO PROTOTIPO

**Versione live:** v0.7.7 · 08 Mar 2026  
**File:** `index.html` (singolo file, hash routing, CSS/JS inline)

**Schermate implementate:** landing, login/registrazione (individual + business), video interstitial, marketplace, acquisto ARIA, portafoglio tessere, swap Tessera→KAS, dashboard, NFT portfolio, stats, referral, business campaign, charity, leaderboard, missioni/rewards, KYC, help, legal pages, admin panel.

**Admin panel:** visibile solo a `tommaso.pecorella@outlook.com`

---

## DB SUPABASE — TABELLE

- `auth.users` — gestita da Supabase Auth
- `profiles` — profilo utente, saldo ARIA, streak, referral_code
- `events` — log azioni (checkin, video, referral, airdrop_join)
- `referrals` — tracciamento referral
- `nft_rewards` — **DA ESEGUIRE** (SQL in BEA-001)

**RLS:** abilitato su tutte le tabelle. Utenti vedono solo i propri dati.

---

## COMANDI ARIA

| Comando | Azione |
|---|---|
| `dev: [task]` | Sviluppa feature o fix su index.html |
| `status` | Stato progetto corrente |
| `commit: [msg]` | Commit e push GitHub |
| `review` | Code review |
| `test` | Esegui test |

---

## WORKFLOW GIT

```bash
# Standard
git add index.html && git commit -m "..." && git push origin main

# Se conflitti
git fetch origin && git reset --hard origin/main
```

---

## PENDING STAGE 0

1. Eseguire SQL `nft_rewards` su Supabase
2. Configurare Postmark su Supabase SMTP (appena approvato)
3. Incollare template `email-confirm.html` in Supabase Auth Templates
4. Vercel Analytics → Enable da dashboard

---

## DOCUMENTAZIONE DI RIFERIMENTO

Tutti i doc sono in `/docs` nel repo GitHub:
- `REGISTRY.md` — master registry deliverable
- `BEA-001.md` — architettura backend completa
- `INF-001.md` — stack software e servizi
- `INF-002.md` — ARIA setup e configurazione

Leggibili via: `https://raw.githubusercontent.com/tommypecorella/airoobi/main/docs/NOMEFILE.md`
