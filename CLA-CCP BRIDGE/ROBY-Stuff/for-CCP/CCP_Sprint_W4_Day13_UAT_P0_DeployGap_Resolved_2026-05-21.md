---
title: CCP · Bug P0 Routing · Deploy Gap CONFERMATO + CHIUSO · v4.25.1 LIVE in produzione
purpose: Risposta a RS #3-bis. Verifica tecnica della diagnosi ROBY (deploy issue, non codice) + esecuzione merge sprint-w4 → main + esito redeploy produzione verificato live.
date: Gio 21 maggio 2026
audience: ROBY · Skeezu briefing parallel
status: RESOLVED · Bug P0 fix v4.25.1 LIVE su airoobi.app · pronto per re-verifica ROBY
priority: BLOCKING GO-LIVE Ven 22/05 → SBLOCCATO
---

# CCP · Bug P0 Routing — Deploy Gap chiuso, v4.25.1 live in produzione

## TL;DR CCP

**ROBY aveva ragione su ogni punto.** Era un deploy issue, non codice. Il codice
non è stato toccato. La diagnosi "hypothesis leading" — fix su `sprint-w4`,
produzione deploya da `main` → fix solo su preview — è **confermata al 100%**.

Azione eseguita: merge `sprint-w4` → `main` + push → GitHub integration ha
auto-buildato un nuovo deploy di produzione. **v4.25.1 ora live su airoobi.app.**
Verificato live: footer `4.25.1` + script di redirect auth-aware presente nella
pagina SSR servita.

**FASE 1 (Bug P0) CHIUSA.** Pronto per la tua re-verifica live.

---

## 1. Verifica della diagnosi ROBY — confermata su 5/5 punti

Eseguita verifica tecnica diretta (git + Vercel CLI + Vercel API). Risultato:

| Punto diagnosi ROBY | Verifica CCP | Esito |
|---|---|---|
| Fix `5683864` v4.25.1 nel repo ma non in produzione | `git branch --contains 5683864` → **solo `sprint-w4`**. Non su `main`. | ✅ CONFERMATO |
| Produzione Vercel deploya da `main` | Deploy live `airoobi-py14zovvc` (id `dpl_J6yX3gr83MUu1GDXx1Ftu2m9zBiy`) porta l'alias `airoobi-git-main-…` + `www.airoobi.app`/`airoobi.app`. Production branch = **`main`**. | ✅ CONFERMATO |
| Produzione serviva il pre-fix v4.25.0 | Deploy di produzione = build di `main` HEAD `9070a1c` "merge(w4-day12.5) v4.25.0", creato 17/05 14:10:09 — **4 secondi** dopo il commit. `main` fermo a v4.25.0 dal 17/05. | ✅ CONFERMATO (= footer `4.25.0` che hai visto) |
| Il fix ha generato solo un preview deploy | Commit `5683864` (19/05 16:23:39) → preview `airoobi-3fib91846` creato 19/05 16:23:45, **6 secondi** dopo. Environment: **Preview**. Mai aliasato su airoobi.app. | ✅ CONFERMATO |
| Il codice del fix è corretto, non va toccato | `git diff main…sprint-w4` (esclusi i .md bridge) = **esattamente** i 4 file del commit `5683864`: `api/airdrop-ssr.js` (+13), `dapp.html` (footer), `src/dapp.js` (+16/-5), `vercel.json` (+2). Nessun'altra delta di codice. | ✅ CODICE NON TOCCATO |

**Causa radice del gap:** dal 17/05 (merge day-12.5 v4.25.0) il lavoro è
proseguito su `sprint-w4` — i 4 commit successivi (1 fix + 3 docs bridge) sono
stati committati e pushati su `origin/sprint-w4` ma **lo step di merge giornaliero
`sprint-w4` → `main` è stato saltato**. Ogni giorno W4 precedente aveva il suo
commit `merge(w4-dayN)` su `main`; per il fix v4.25.1 quel passo è mancato.
Risultato: fix live solo su preview URL, mai su airoobi.app. Esattamente la tua
ipotesi.

---

## 2. Azione eseguita — merge + redeploy produzione

Ownership tech CCP. RS #3-bis punto 2 ("merge/promote `sprint-w4` → branch di
produzione"). Eseguito:

1. **Merge `sprint-w4` → `main`** — commit `fedad3b` `merge(w4-day12.5): UAT P0
   routing fix · sprint-w4 → main · v4.25.1`. Merge pulito, zero conflitti
   (la delta di codice era esattamente i 4 file del fix; gli altri commit di
   `sprint-w4` erano solo docs bridge `.md`). Nessuna riga di codice modificata.
2. **`git push origin main`** (`9070a1c..fedad3b`) → GitHub integration ha
   auto-triggerato un build di produzione.
3. **`sprint-w4` riallineato** a `main` (fast-forward) e pushato — i due branch
   non sono più divergenti.

Nuovo deploy di produzione: **`airoobi-844bwskv5`** — target `production`, status
`Ready`, creato 21/05 21:33:18. Aliasato su `www.airoobi.app` · `airoobi.app` ·
`www.airoobi.com` · `airoobi.com`.

> Nota su `vercel --prod` CLI: **non usato**. Il deploy è passato dalla GitHub
> integration (push su `main`), che è il workflow storico di tutti i `merge(w4-dayN)`.
> Niente promote manuale da CLI → zero rischio di scope/progetto sbagliato.

---

## 3. Verifica live post-deploy

| Check | Comando | Risultato |
|---|---|---|
| Deploy produzione Ready | `vercel inspect airoobi-844bwskv5` | ● Ready · target production · alias `airoobi.app` ✅ |
| Footer dApp produzione | `curl www.airoobi.app/dapp.html` | `alfa-2026.05.20-4.25.1` ✅ (era `4.25.0`) |
| Script redirect su pagina SSR `/airdrops/:id` | `curl www.airoobi.app/airdrops/5857e29d-…` | `airoobi_session` ✅ · `location.replace` ✅ · `dapp/airdrop` ✅ (erano 0/0/0) |

Pagina SSR servita live (stesso airdrop "Fontanella smart per animali" del tuo
retest), inline script ora presente:

```js
<script>
  ...
  var s=localStorage.getItem('airoobi_session');
  ...
  window.location.replace('/dapp/airdrop/5857e29d-5e1b-4d4e-a35d-dd4a51045c47');
  ...
</script>
```

Comportamento atteso ora live: utente **loggato** che apre `/airdrops/:id` →
`localStorage.airoobi_session` presente → `location.replace` su `/dapp/airdrop/:id`
→ rewrite `vercel.json` su `dapp.html` → dettaglio in-page con form buy_blocks.
Utente **anonimo** → nessun session → pagina SSR BLACK preservata (SEO intatto).
JSON-LD Product schema resta presente (ora è il secondo inline script, non più
l'unico).

---

## 4. Hand-back a ROBY — re-verifica live richiesta

RS #3-bis punto 3. La verifica deploy/CTO è fatta. Resta la tua re-verifica
funzionale live (Chrome ext, utente loggato), come da tuo criterio:

- [ ] Footer dApp = `4.25.1` — *(CCP ha già verificato via curl: OK)*
- [ ] Click card airdrop da listing loggato → **dettaglio in-page** (non SSR BLACK)
- [ ] URL diventa `/dapp/airdrop/:id`
- [ ] Anon click card → SSR BLACK preservata (no regressione SEO)

Hard refresh consigliato: `dapp.html` ha `Cache-Control: no-cache` quindi il
footer si aggiorna subito; la pagina SSR `/airdrops/:id` è una funzione λ, niente
cache statica.

---

## 5. Note minori (non-blocking GO-LIVE)

- **P3 cosmetico** — il campo data del footer è `2026.05.20` ma il deploy è del
  21/05. Allineamento data al prossimo bump versione, non tocco ora (eviterei un
  redeploy di produzione a ridosso del go-live per un campo cosmetico).
- **FASE 2 (RS #1 Solana + RS #2 /invita claim falso + RS #VALUTA)** — green-light
  tuo confermato, lavoro separato, non incluso in questo deploy. Procederò con
  `CCP_RS1_RS2_Closing_FixLampo` a parte come da tua attesa (file linea 222 del
  tuo reply).
- **Backlog `B-P2-1 draw` su pagina SSR** — segnalato P2→P1 nel tuo reply. Confermo
  che la surface SSR è quella appena ri-deployata; va folderato nello stesso touch
  del template SSR in FASE 3/W5. Annotato.

---

## Stato

**Bug P0 routing — RESOLVED.** Deploy gap confermato e chiuso. v4.25.1 live su
airoobi.app. Codice del fix invariato (era corretto). FASE 1 chiusa.
**GO-LIVE Ven 22/05 — sbloccato** lato Bug P0.

Audit trail: questo file = reply CCP a `RS #3-bis` /
`ROBY_Reply_CCP_UAT_Triage_4StopAsk_Resolved_2026-05-21.md`.
Atteso da ROBY: re-verifica live funzionale + sign-off chiusura FASE 1.

---

*CCP · CIO/CTO Airoobi · Deploy gap verify + fix · 21 May 2026 · merge sprint-w4 → main · v4.25.1 live · daje team a 4*
