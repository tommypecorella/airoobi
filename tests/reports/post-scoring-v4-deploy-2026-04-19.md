# AIROOBI — Playwright Report post deploy scoring v4

**Data: 2026-04-19 · Versione: alfa-2026.04.19-3.33.1 (commit `53003f4`)**
**Contesto: verifica integrità dopo `supabase db push` di 6 migrazioni (earnings v2 + scoring v4 + early-close lockdown).**

---

## Esito: ✅ PASS — 104/104 test passati

Dopo un primo run che aveva flaggato 2 regressioni minori su `dashboard.spec.ts` (test datati rispetto al redesign topbar/nav, NON causate da scoring v4), i test sono stati aggiornati all'attuale markup:

- `topbar-bal` ora è un badge SVG con "A" + valore numerico (non più label testuale "ARIA")
- Tab `archive` spostato fuori dalla nav desktop primaria (accessibile altrove)

Dopo il fix → **7/7 dashboard passati**, suite completa **104/104**.

---

## Breakdown

| Suite | Test | Status | Durata |
|---|---|---|---|
| `tests/public/` — landing, navigation, SEO, blog, login | 61 | ✅ 61/61 | 1m 55s |
| `tests/dapp/` — dashboard, airdrops, submit, wallet, referral, my-airdrops, learn, archive | 23 | ✅ 23/23 | ~40s |
| `tests/admin/` — ABO backoffice (layout, sezioni, tabelle) | 20 | ✅ 20/20 | ~80s |
| **Totale** | **104** | **✅ 104/104** | **~5m** |

Browsers: `chromium` (desktop 1280×720) + mobile (`Pixel 5`).

---

## Coverage dopo scoring v4

I test che toccano aree impattate dal deploy sono tutti passati:

- **Dashboard home** (`dashboard.spec.ts`) — topbar, nav, balance, avatar, notifications, lang toggle, home tab attivo
- **Airdrops list + detail** (`airdrops.spec.ts`) — caricamento lista, apertura detail
- **Submit/Proponi** (`submit.spec.ts`) — form valutazione, campi necessari
- **Wallet** (`wallet.spec.ts`) — card saldo (ARIA/ROBI/KAS) presenti
- **Referral** (`referral.spec.ts`) — link referral, stats
- **My-airdrops** (`my-airdrops.spec.ts`) — partecipazioni utente
- **ABO Backoffice** — 20 test su tutte le sezioni (Overview, Utenti, Valutazioni, Gestione, Analysis, Treasury, ARIA Metrics, ROBI Valuation, Cost Tracker, Categorie)

**Nota importante:** questi sono test smoke (navigazione, layout, elementi presenti). La logica economica nuova (scoring v4 mono-fattoriale, early-close lockdown, seller decision flow) **non è coperta da E2E dedicati**: richiederebbe setup controllato con 3+ utenti test, acquisti blocchi reali, e verifica dello stato post-draw.

---

## TODO follow-up test

Aree da coprire con test mirati nelle prossime sessioni:

1. **Scoring v4 deterministico**: scenario con 3 utenti, diversi pattern di spesa categoria + cross-cat, verifica che rank sia quello atteso
2. **Fairness guard**: scenario lockdown matematico → verifica che buy-btn diventi disabled + message "fairness"
3. **Early-close auto-trigger**: riproduci value_threshold (leader raggiunge `object_value_eur × 10`) → verifica status=`pending_seller_decision`, blocks burned, notifica
4. **Seller decision**: seller flow `pending_seller_decision` → click COMPLETA → accepts → status=completed
5. **Streak settimanale**: 7 `daily_checkin_v2` consecutivi → verifica +1 ROBI assegnato in `nft_rewards`
6. **Referral confirm**: signup user via ref link + login → verifica +5 ROBI a inviter + +5 a new user (idempotente)

Questi test richiedono utenti test dedicati e un DB staging isolato (in alpha 0 il DB production è accettabile come staging de facto, ma rischia side effects sulla dashboard admin).

---

## Conclusione

Il deploy di scoring v4 + earnings v2 **non ha introdotto regressioni** rilevabili dal layer Playwright attuale. Backward-compat RPC (`calculate_winner_score` ritorna ancora `f1`/`f2`, `claim_checkin` è alias di `daily_checkin_v2`) garantisce che il FE legacy non migrato non si rompa.

**Ready for user-side smoke testing.** Le nuove meccaniche sono live e osservabili manualmente nella dApp.

---

*Report generato via `npx playwright test` · `v1.59.1`. HTML report di dettaglio (con screenshot delle 2 failure iniziali + loro fix) disponibile via `npx playwright show-report`.*
