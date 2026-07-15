# Test massivo AIROOBI — CCP, 14 lug 2026 (delega Skeezu, giro review)

Stato: **COMPLETATO ×2** — lista eseguita, poi ABO riorganizzato e RUN 2 di riverifica completato.

## RUN 2 + ABO riorganizzato (secondo passaggio, stessa notte)
- **ABO deep-dive**: 14 sezioni testate una per una, zero errori console. Riorganizzazione shipped:
  - Dashboard con box **"DA FARE OGGI"** azionabile (valutazioni in attesa / ack venditore / richieste EVALOBI / dispute) — testato live: il contatore è passato a "1 in attesa del venditore" durante il run 3 e il click porta alla sezione giusta.
  - Engine Config e Analisi & Fairness si caricano da sole (via "Clicca Aggiorna").
  - Cost Tracker (vuoto) fuori dalla sidebar, raggiungibile da Treasury. Lessico canone anche in ABO (blocchi→Step, estrae→chiusura, nei testi e tooltip).
- **Drift ROBI ridotto a 1 fonte**: il cron snapshot ora usa la formula unica di ABO (`treasury_funds × treasury_pct / shares reali`) → topbar, Portafoglio e ABO dicono tutti **€0,272**. Resta SOLO il cap di execute_draw su treasury_stats (2.998€ virtuali) = decisione economica per Skeezu.
- **RUN 3 airdrop ×10**: 10/10 chiusi (8 accept + 1 annullo + 1 lasciato in waiting e chiuso dal venditore). Cap proporzionale confermato: **22 perdenti su 22 pagati**.
- **Bonus milestone VERIFICATI LIVE**: +5 ROBI al vincitore (`airdrop_won`) e +5 al venditore (`airdrop_completed_seller`) per ogni chiusura, + VALUATION NFT — il circolante è salito 369→465 shares e il nominale si muove col treasury come da obiettivo.
- **Fairness su 27 draw totali**: vincitore = scores[0] in **27/27** (100% deterministico), max-Step vince 23/27 (85%), Impegno/pity ribalta 4/27 (15%), 7 vincitori distinti su 7 profili.
- Registrazione riverificata (skeezu+18, grant identico) · footer/topbar 57/57 file ✓ · video canone-clean live ✓ · .com hero+redirect ✓ · mobile ≤390px su dashboard/ABO/blog/treasury ✓.

## Primo passaggio

## Chiusi anche (seconda metà del giro)
- **Pagine loggate**: dashboard/esplora/portafoglio/guadagni verificate live, numeri e grafico ROBI ok. Finding: `/classifica` è rotta morta (fallback su home).
- **Fairness in pagina**: nuova sezione "Come viene decisa la vetta — l'algoritmo, per esteso" su /come-funziona-airdrop (Vantaggio √Step + Impegno/Boost garanzia, cap 30%, risultati del test sul campo). +2 refusi sweep fixati.
- **Mobile 390px**: 12 pagine + salita airdrop verificate via iframe-probe. Fix: glow hero /blog (overflow 436px), /treasury (tabella compare scrollabile, peg-widget a colonna, code a capo). Ora tutto ≤390.
- **Mobile perfection pass (secondo giro, richiesta esplicita)**: probe tutte le viste SPA + ABO + verifica visiva a 390px (dashboard, burger aperto, salita, portafoglio con grafico, esplora). Fix aggiuntivi: topbar dApp compattata (l'avatar veniva CLIPPATO dall'overflow), explore-toolbar allineata al padding (+4px), ABO admin-nav wrap (Logout/campanella erano fuori schermo), **Tokenomics aggiunta al menu mobile della dApp e al menu utente avatar** (spariva su mobile), **rimosso il doppio footer della dApp** (vecchio footer interno + condiviso). Tutto riverificato live: zero overflow, zero link nascosti.
- **Video/slideshow ricostruiti**: video-intro, video-airdrop, airoobi-cards, airoobi-explainer nel canone (Step/corsa/ROBI Reward) e rosso v3 al posto dell'oro. Live.
- **airoobi.com → hero page**: home.html sostituita da hero v3 (slogan immutabile + payoff + CTA airoobi.app); redirect `.com/* → www.airoobi.app/*` (esclusi root e asset SEO); sitemap-com = 1 URL; rotte storie-vincitori rimosse. Vecchia home: `home.html.pre-hero-backup-20260714` + git `1b3e768`.

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

## Verifica statistica fairness (18 draw completati)
- Deterministico ✓: vincitore = sempre scores[0] di calculate_winner_score (v5.1); il candidato di detect_airdrop_end_event coincide col winner finale in tutti i giri. Zero estrazione, zero caso.
- 16/18: vince chi ha percorso più Step (√blocchi domina a parità di storia).
- 2/18: la loyalty di categoria (+ pity) SUPERA chi ha comprato più Step (8 vs 9 e 7 vs 8 blocchi) — i correttivi fairness incidono davvero.
- Distribuzione vittorie: 7 utenti su 7 partecipanti hanno vinto almeno una volta (5/3/3/2/2/2/1) — nessun monopolio del top spender.

## Findings minori aperti
- `/classifica`: rewrite Vercel esiste ma la SPA non ha quella vista → fallback silenzioso su home (rotta morta, decidere: vista classifica o rimozione rewrite).
- Banner "AGGIORNATO · MOTORE V2.5" negli articoli blog cita "ROBI Mining" (lessico vietato in UI) → sweep da fare.
- Drift ROBI visibile in-page: topbar €0,41 vs card portafoglio €0,27/ROBI nella stessa schermata.
- Snapshot price topbar è sceso 1,09→0,41 durante i test: il cron riconta un circulating che include i mint di test (fonte diversa da entrambe le altre).

## Prossimi (in corso)
- Pagine loggate (numeri/grafici) · fairness spiegata in pagina + verifica statistica · mobile pass · video/slideshow · airoobi.com → hero page.

## Pulizia dati di test — ESEGUITA (GO Skeezu, 15 lug)
- Cancellati in transazione unica: 11 utenti `skeezu+N@gmail.com` (auth+profili+ledger+NFT+notifiche+ruoli, incluso l'admin di test), 32 airdrop `[TEST-CCP]` con tutto l'indotto (742 blocchi, seeds, partecipazioni, treasury_transactions), waitlist e signup_attempts di test.
- Integrità verificata: 9 profili reali, 12 airdrop (solo DEMO), zero orfani, Mary intatta (15 ROBI).
- Circolante ROBI tornato onesto: 138 shares → valore nominale **€0,7283** (snapshot immediato; topbar/portafoglio/ABO si aggiornano da soli).
- treasury_stats NON riavvolto (è solo contatore di audit dopo la formula unica): i suoi numeri storici includono i test.

## Estensioni → Treasury (GO Skeezu, 15 lug sera)
- Gli ARIA delle estensioni ora diventano EUR (×0,10) nel fondo **"Contributi estensioni"** (pct 100 → formula unica → alza il valore nominale ROBI).
- Movimento tracciato in `treasury_transactions` (`extension_contribution`, prima→dopo sul canonico, nota parlante) e visibile in **ABO → Treasury → MOVIMENTI TREASURY** (tabella nuova, con anche i contributi airdrop e le riscossioni).
- Collaudo ×3 giri completi (2 accept + 1 annullo): 10 estensioni, fondo = Σ movimenti = 10,50€, catena contabile coerente, contributo trattenuto anche su annullo (fee di servizio), nominale che si muove. Dati di collaudo poi ripuliti (fondo→0, canonico→100,50€, nominale €0,7283, 9 profili, zero residui).
- Nota di lettura: nella colonna "prima→dopo" i *Contributi airdrop* dei draw usano ancora il contatore legacy `treasury_stats` (~3.000 virtuali), le *Estensioni* il canonico — due pozzi diversi by design, da unificare se/quando si decide il destino di treasury_stats.
