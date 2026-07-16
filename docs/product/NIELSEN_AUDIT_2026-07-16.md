# Nielsen Audit — airoobi.app + ABO · 16 lug 2026 (CCP)

Valutazione euristica (10 euristiche di Nielsen) su tutta la dApp girata come un
crawler: Esplora, I miei Airdrop, Fai valutare, Portafoglio, Invita, Come funziona,
FAQ, Blog, Tokens, Explorer ARIA/ROBI, Treasury, Termini, Privacy, Contatti,
Venditore, Login/Signup/Reset, root, 404, ABO. Desktop + probe mobile, IT + EN,
light + dark, guest + loggato.

## Evidenze trovate → fix applicati

| # | Euristica | Evidenza | Fix |
|---|---|---|---|
| 1 | H1 Visibilità stato + H3 Controllo | **P0 · Backdrop notifiche orfano**: `notifGoToAirdrop`/`notifGoToChat` e il click-fuori chiudevano il pannello senza spegnere `#notif-panel-backdrop`; il click sul backdrop faceva *toggle* (riapriva). Pagina intera non cliccabile finché non ricaricavi — il residuo dei "freeze" segnalati | `setNotifPanel(open)` unico punto di sync pannello+backdrop; backdrop e click-fuori chiudono; Escape chiude (dapp.js v4.60.0) |
| 2 | H4 Coerenza | **P0 · /venditore rimbalzava al login anche da loggati**: la dApp salva la sessione in `localStorage.airoobi_session`, venditore.html usava supabase-js con storage default | Bridge sessione in bootstrap (setSession + writeback se token ruotato) |
| 3 | H4 Coerenza (GO formula unica) | **P0 · Drift nominale ROBI**: topbar/explorer-robi mostravano €1,11 ↑47,8% mentre ABO/portafoglio/snapshot dicevano €0,75 — `get_robi_market_data` sommava i fondi **senza** `treasury_pct` | Migration `20260716120000_market_data_formula_unica` (applicata sul live): ora €0,75 e trend 0% ovunque |
| 4 | H9 Recupero errori | **404 = pagina raw Vercel** (inglese, zero brand, nessuna uscita) | `404.html` brandizzata IT, theme-aware, CTA Esplora/Home |
| 5 | H1+H9 | **Empty-state ricerca fuorviante**: con query senza match diceva "Nessun airdrop attivo" (falso se ce ne sono) | "Nessun risultato per «q»" + link *azzera la ricerca* (IT/EN) |
| 6 | H2 Linguaggio (canone) | 90 notifiche storiche con "blocchi"/"Acquista blocchi per risalire"; 13 notifiche citavano airdrop eliminati (click senza alcun effetto) | Bonifica DB: lessico → Step, orfane eliminate (0 residui) |
| 7 | H2 canone (generatori vivi) | `send-push` ("Acquista blocchi…", "Sei il vincitore") e `process-auto-buy` ("+N blocchi acquistati automaticamente") emettono ancora lessico vietato | Sorgenti corretti nel repo ("Fai altri Step per risalire", "Sei arrivato in vetta", "+N Step percorsi in automatico"). **Redeploy edge function BLOCCATO dal gate di sicurezza in sessione autonoma → serve GO Skeezu** |
| 8 | H6 Riconoscere vs ricordare | Login mostrava il form "muto" anche da già loggati (con topbar loggata: incoerente) | Banner "Sei già connesso come … → Continua" con returnTo sanificato |
| 9 | H4/A11y | Select categoria (`#sub-cat`) senza label associata; thumb storico portafoglio senza alt | aria-label + alt |

## Verificati OK (nessuna azione)
- Feedback di sistema: skeleton, toast, contatori live, countdown, badge notifiche.
- Errori form login/signup chiari e in italiano ("Email non valida", "Completa la verifica anti-bot"); anti-bot Turnstile attivo.
- EN toggle: dApp interamente tradotta e persistita; root `/` reindirizza correttamente alla dashboard da loggati.
- Empty-state Esplora/Miei airdrop/ABO ("DA FARE OGGI" verde a zero) ben fatti.
- Nessun overflow orizzontale su nessuna pagina; nessun id duplicato; nessun bottone/link senza nome accessibile.
- Link share `/invita` con `href="#"`: falso positivo (onclick funzionanti).
- Avatar topbar `alt=""`: corretto (decorativo dentro bottone con aria-label).
- Nota tecnica: la cattura CDP su /blog va in timeout (layer blur pesante) ma la pagina è sana (lag 0,2 ms) — non impatta gli utenti.

## Pendenze
- **Redeploy `send-push` + `process-auto-buy`** con i testi a canone (repo pronto, serve GO).
- Decisione aperta: colonna prima→dopo dei Movimenti treasury (contributi airdrop su treasury_stats vs estensioni su canonico).
