# Test massivo AIROOBI — CCP, 14 lug 2026 (delega Skeezu, giro review)

Rapporto vivo del giro di test massivo. Stato: IN CORSO.

## Fatto e verificato

### 1. Footer unico su tutte le pagine .app ✅
- Nuovo componente `src/footer.js`: link (airoobi.com/Airdrops/Come funziona/Blog/FAQ/Tokenomics/Termini/Privacy/Contatti), copy, 18+, motto, versione per-pagina da `data-version`.
- Applicato a 20 pagine + 37 articoli blog. Verificato visivamente su prod.

### 2. Topbar condivisa ovunque ✅
- Aggiunta a: 37 articoli blog (prima non avevano menu), privacy/termini/contatti (avevano solo "Torna ad AIROOBI"), login/signup/reset-password/email-confirm (wrap `.auth-main`).
- Switch loggato/non-loggato verificato live (saldi+avatar sulle pagine nuove).

### 3. Registrazione utente ✅ (frontend + backend)
- Backend (API): signup → auto-confirm, trigger crea profilo (username auto, referral_code), welcome grant **100 ARIA + 5 ROBI + badge Alpha Brave + NFT ALPHA LIVE**, righe coerenti su 10 utenti.
- ⚠️ La spec storica diceva 1000 ARIA: il live dà **100**. Decidere se è voluto.
- Frontend (E2E nel browser): form + Turnstile + submit → auto-login → dashboard corretta (skeezu+2).
- Sybil guard: alias `+N` bloccato dal 2° uso dello stesso local-part (`alias_blocked`) — quindi skeezu+N NON è utilizzabile in serie dal frontend, by design. Trovata una possibile race sulla prima chiamata (ok:true dove doveva bloccare; non riproducibile, layer difensivo, non bloccante).

### 4. Test massivo airdrop ✅ 20/20 giri completi
Harness REST per-utente (scratchpad `airdrop_e2e.py`), 8 utenti test (skeezu+10…17, skeezu+10 = admin ruolo reale):
valutazione (−50 ARIA) → GO admin (`manager_update_airdrop`) → accettazione venditore → `buy_blocks` fino a sold-out → `detect_airdrop_end_event` → `seller_acknowledge_airdrop` → `execute_draw`.
- 18 completed + 2 annullati (decisione venditore) — stati, split 67,99/22/10/0,01, refund, winner_id, draw_scores: tutto coerente.

### 5. BUG FIXATI (migration applicate al DB live + repo)
1. **Cap anti-inflazione greedy → PROPORZIONALE** (`20260714120000`): prima il primo perdente per ARIA spesi assorbiva l'intero cap ROBI e gli altri prendevano **zero**. Ora quota_raw × (cap/totale_raw) per tutti. Verificato su batch 2: righe NFT = perdenti in ogni draw. Collateralizzazione invariata.
2. **Canone MiCA**: NFT si chiamava ancora "**Tessera Rendimento**" → "ROBI Reward", anche retroattivo su righe esistenti.
3. **ABO Anteprima Draw mentiva** (`20260714123000`): mostrava "ANNULLAMENTO" su airdrop realmente `completed`. Ora: draw eseguito → esito/vincitore REALI; predizione → stessa logica di execute_draw (decisione venditore + confronto sul taglio venditore, non sul lordo).

## ⚠️ FINDING GRANDE — valore nominale ROBI: 4 fonti divergenti (decisione Skeezu)
| Fonte | Formula | Valore |
|---|---|---|
| ABO dashboard | fondo reale 150€×67% / 369,22 shares reali | **€0,2722** |
| Topbar dApp (robi_price_snapshots, cron) | 150€ / 138 "circulating" | **€1,09** |
| execute_draw cap (treasury_stats) | 2.998€ "virtuali" / 103,79 | **€28,89** |
| nft_rewards reale | ROBI 368 + NFT_REWARD 1,22 | 369,22 shares |

Conseguenza concreta: il cap del draw usa €28,89 → conia ~**100× meno ROBI** del dovuto rispetto al nominale onesto (€0,27). I reward ai perdenti sono briciole (0,02-0,05 ROBI a testa) mentre la UI promette "1 ROBI ogni N Step".
**Raccomandazione CCP**: fonte unica = SUM(shares) reale da nft_rewards per il circolante + decidere quale treasury è canonico (150€ reali vs 2.998€ virtuali da testnet). Non ho toccato nulla qui: cambia il valore dichiarato, firma tua.

## Utenti/dati di test creati
- 10 profili `skeezu+1/2/10..17@gmail.com` (signup_source `ccp-test-14lug` / `ccp-masstest-14lug`), skeezu+10 con ruolo admin (da rimuovere a fine giro se vuoi).
- 20 airdrop `[TEST-CCP] Oggetto giro N` (18 completed, 2 annullati) + relativi ledger/NFT/treasury contributi virtuali.

## Incidente risolto (trasparenza)
Un `git add -A` ha temporaneamente pushato sul repo **pubblico** materiale di lavoro privato (pitch deck, LOI, docs interni). Nessun segreto reale (solo anon key già pubblica). History riscritta e force-push in pochi minuti, `.gitignore` aggiornato. Le copie potrebbero restare in cache GitHub per poco.

## Prossimi (in corso)
- Pagine loggate (numeri/grafici) · fairness spiegata in pagina + verifica statistica · mobile pass · video/slideshow · airoobi.com → hero page.
