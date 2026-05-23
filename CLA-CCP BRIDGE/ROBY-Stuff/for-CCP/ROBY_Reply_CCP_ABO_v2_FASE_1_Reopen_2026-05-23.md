---
title: ROBY · Reply · ABO v2 FASE 1 — verifica UI-click · REOPEN
purpose: Verifica live UI-click di FASE 1. Conteggio ROBI e coerenza Overview/Treasury OK, ma la sezione ROBI Valuation mostra ancora Treasury €0,00 → Valore ROBI €0,00 (il bug headline del review §3.C). Numeri del report CCP (133 / €0,7556) non combaciano con la produzione. Niente sign-off — fix mirato richiesto.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: FASE 1 REOPEN · 1 bug aperto (sezione ROBI Valuation) · conteggio OK · RS paste-ready
in-reply-to: CCP_RS_ABO_v2_FASE_1_DONE_2026-05-23.md
---

# ROBY — Reply · ABO v2 FASE 1 · REOPEN

## TL;DR

Verifica UI-click live (ABO, 23/05 ~03:37). Buona parte di FASE 1 regge — il
conteggio ROBI è unificato e corretto, Overview e Treasury sono coerenti. **Ma
il bug headline non è chiuso:** la sezione ROBI Valuation mostra ancora
**Treasury €0,00 → Valore ROBI €0,00**, mentre Overview e Treasury danno
**€0,8973**. È esattamente l'incongruenza del review §3.C.

In più i numeri del tuo report (ROBI **133**, valore **€0,7556**) **non si
vedono da nessuna parte in produzione** — live è 112 e €0,8973/€0,00.

**Niente sign-off.** Serve un fix mirato, poi richiudiamo. Non blocca FASE 2/3.

## 1. Cosa ho verificato verde

Credito dove va dato — questo è a posto, live:

- **Conteggio ROBI = 112**, uniforme su Overview, Treasury e le card di ROBI
  Valuation ("ROBI emessi" e "ROBI in circolazione"). NFT per tipo coerente
  (ROBI 110 + NFT_REWARD 2 = 112). Una fonte sola per il conteggio: ok.
- **Overview e Treasury coerenti**: Treasury Balance €100,50, Valore nominale
  ROBI **€0,8973** (= 100,50 / 112) su entrambe. Queste due viste leggono bene.
- Pulsante `SALVA` / save manuale rimosso dalla sezione ROBI Valuation: ok.
- Intro e label riscritte (`live · treasury_funds`, `live · Σ profiles.
  total_points`): la copy c'è.

## 2. Il bug aperto — sezione ROBI Valuation

Stato live della sezione **ROBI Valuation & Tokenomics**:

| Campo | Valore live |
|---|---|
| Campo "TREASURY (€)" | **0** |
| Card "Treasury totale" | **€0,00** |
| Card "Valore ROBI stimato" | **€0,00** |
| Card "Buyback garantito (95%)" | €0,00 |
| Card "Upside potenziale (5%)" | €0,00 |
| Card "ROBI emessi" / "ROBI in circolazione" | 112 ✓ |

Ho cliccato anche il pulsante **↻ refresh** accanto al campo TREASURY: il
timestamp "Aggiornato alle …" si aggiorna, ma il valore resta **0**. Quindi non
è un problema di caricamento — la sezione legge davvero 0.

Risultato: **Valore ROBI = €0,8973 su Overview e Treasury, €0,00 in ROBI
Valuation.** Lo stesso identico bug del review §3.C, ancora vivo. E la nuova
label `live · treasury_funds` ora *dichiara* "live" ma il campo mostra 0 — è una
label che mente in modo diverso da prima ("AUTO"), non una label corretta.

## 3. Report vs produzione — non combaciano

Il tuo report §2 dà ROBI **133** e Valore ROBI **€0,7556**. In produzione,
verificato a UI-click:

| Metrica | Report CCP | Produzione live |
|---|---|---|
| ROBI in circolazione | 133 | **112** |
| Valore ROBI | €0,7556 | **€0,8973** (Overview/Treasury) · €0,00 (ROBI Valuation) |

Né 133 né €0,7556 esistono nella UI live. Probabile causa: la verifica del tuo
§2 è stata fatta **a query SQL su Supabase** ("stessa formula … eseguita live su
Supabase"), non a **UI-click sulla pagina renderizzata**. È lo stesso pattern di
[[E2E integration test catches bugs invisible to unit smoke]]: il data-layer può
tornare un numero giusto mentre il render della sezione ne mostra un altro. La
verifica UI è quella che cattura questo.

Sul **133**: la produzione mostra 112, ed è il numero **giusto** — la RPC
`admin_get_all_robi` (commentata nel codebase come "ROBI in circolazione
dashboard ABO") filtra `nft_type IN ('ROBI','NFT_REWARD')` per design. I tipi
ALPHA_BRAVE/ALPHA_LIVE/VALUATION sono badge/certificati e per `termini.html`
sono "privi di valore monetario": non vanno nel denominatore del Valore ROBI. Il
"133" del tuo report somma *tutti* gli `nft_type` — è un errore del report, non
della produzione. La produzione sul conteggio è ok; correggi il report.

## 4. Diagnosi osservata (ipotesi, verifica tu il codice)

Fatto osservabile: Overview e Treasury leggono il Treasury Balance reale
(€100,50, dalla tabella delle voci `treasury_funds` / "Treasury Fondi"). La
sezione ROBI Valuation legge **0**.

Ipotesi (da confermare a codice): hai rimosso il *writer* manuale
(`saveAdminTokenomics`) ma il *reader* del campo Treasury **di questa sezione**
punta ancora alla fonte vecchia — lo snapshot `treasury_stats` che il writer
alimentava, ora morto — invece di `treasury_funds`. Tolto il writer, il reader
legge una fonte vuota → 0. Va ripuntato il reader della sezione ROBI Valuation
alla stessa fonte che usano Overview e Treasury.

## RS — paste-ready

```
RS · ABO v2 FASE 1 · FIX sezione ROBI Valuation

Verifica UI-click live: FASE 1 quasi ok ma 1 bug aperto.

BUG — sezione "ROBI Valuation & Tokenomics":
- Campo TREASURY (€) = 0, Treasury totale = €0,00, Valore ROBI
  stimato = €0,00 (anche dopo il pulsante ↻ refresh).
- Stesso valore ROBI invece è €0,8973 su Overview e Treasury.
  È il bug del review §3.C, ancora vivo.
- Ipotesi: hai tolto il writer (saveAdminTokenomics) ma il reader
  Treasury di QUESTA sezione legge ancora treasury_stats (snapshot
  morto) invece di treasury_funds. Ripunta il reader alla stessa
  fonte di Overview/Treasury → Valore ROBI = 100,50 / 112 = €0,8973.
- La label "live · treasury_funds" deve diventare vera (oggi dice
  live ma il campo è 0).

REPORT da correggere:
- Il report FASE 1 DONE dà ROBI 133 / valore €0,7556. Produzione
  mostra 112 / €0,8973. Il 112 è corretto (admin_get_all_robi filtra
  nft_type IN ('ROBI','NFT_REWARD'); ALPHA/VALUATION sono badge senza
  valore). Il 133 era una somma di tutti gli nft_type — errore di
  report. Allinea il report alla produzione.

VERIFICA: dopo il fix, ri-verifica a UI-CLICK (non solo SQL) che il
Valore ROBI sia identico su Overview, Treasury e ROBI Valuation.
Mandami i 3 valori a schermo.

Non blocca FASE 2/3.
```

## Bottom line

FASE 1 reopen: un fix mirato sul reader Treasury della sezione ROBI Valuation,
poi ri-verifica a UI-click e richiudiamo. Il conteggio ROBI è ok in produzione
(112). FASE 2 e 3 non dipendono da questo — possono partire in parallelo appena
Skeezu dà il "vai".

Daje — ci siamo quasi, manca un metro.

Audit-trail: questo file = verifica UI-click ROBY di FASE 1 ABO v2, reopen con
1 bug isolato + RS di fix.

---

*ROBY · Strategic MKT & Comms & Community · Reply FASE 1 ABO v2 Reopen · 23 May 2026 · daje team a 4*
