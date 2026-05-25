---
title: ROBY · RS fast-track · LB-3 ARIA Explorer overflow mobile + LB-4 copy ARIA "non ha controvalore in euro" da correggere ovunque
purpose: Due bug live segnalati da Skeezu, triagiati P1, caratterizzati a UI-click. LB-3: `airoobi.app/explorer` ha overflow orizzontale su mobile — `.exp-container` larghezza fissa 565px, non responsive. LB-4: la pagina come-funziona-airdrop §02 dice "ARIA non ha controvalore in euro" — sbagliato: 1 ARIA vale €0,10 e in testnet si ottiene, non si compra. Copy corretta fornita qui, da applicare ovunque (sweep).
date: Lun 25 maggio 2026
audience: CCP · Skeezu
status: LB-3 + LB-4 triagiati P1 · caratterizzati · copy LB-4 consegnata · CCP fixa frontend + sweep
in-reply-to: Skeezu · segnalazione 2 live bug 25 May 2026
---

# ROBY — RS fast-track · LB-3 explorer mobile + LB-4 copy ARIA

## TL;DR

Due bug live da Skeezu, entrambi **P1**, caratterizzati a UI-click.

- **LB-3** — `airoobi.app/explorer` overflow orizzontale su mobile:
  `.exp-container` ha larghezza **fissa 565px**, non si adatta. Fix
  responsive.
- **LB-4** — `come-funziona-airdrop` §02 dice "ARIA **non ha
  controvalore in euro**": sbagliato. **1 ARIA vale €0,10**, e in
  testnet l'ARIA **non si compra, si ottiene**. Copy corretta in §2,
  da applicare **ovunque**.

## 1. LB-3 · ARIA Explorer — overflow orizzontale mobile

### Caratterizzazione (Chrome, viewport 412px)
`airoobi.app/explorer` — il contenuto è più largo del viewport: numeri
e label delle stat-card tagliati a destra, scrollbar orizzontale.
`documentScrollWidth = 565` contro un viewport ~305-412px.

Elementi che sforano (grab DOM):
- `.exp-container` — `width: 565.375px` **fissa**
- `.exp-refresh` — `width: 517.375px`
- `.exp-stats` — `width: 517.375px`, `display: grid`

Root cause: la pagina explorer è costruita a **larghezza desktop
fissa** e non è mai stata resa responsive. La grid `.exp-stats` non
reflowa su mobile.

### Fix direzione (frontend-only)
- `.exp-container`, `.exp-refresh`, `.exp-stats` → da `width: <px
  fisso>` a `width: 100%` + eventuale `max-width` per il desktop.
- `.exp-stats` (grid) → `grid-template-columns: 1fr` sotto
  `@media (max-width: 480px)` così le stat-card si impilano.
- `box-sizing: border-box` dove serve, padding interni che non
  sommino oltre il 100%.
- **Verify-before-fix**: greppare la regola `.exp-container` width;
  e verificare se `.exp-container` è **condiviso con `/explorer-robi`**
  — se sì, un fix unico copre entrambe le explorer; se no, applicare
  anche a explorer-robi se ha lo stesso pattern.
- Cache-bust `?v=` + footer bump come da pattern.

ROBY verifica a UI-click a 412px: zero scroll orizzontale,
`documentScrollWidth == viewport`, stat-card leggibili impilate.

## 2. LB-4 · Copy ARIA — "non ha controvalore in euro" è sbagliato

### Il problema
`come-funziona-airdrop` §02 "ARIA e ROBI", paragrafo ARIA, dice:

> "Si guadagna gratis con login giornaliero (+1), faucet (+100 in
> fase testnet), check-in quotidiano, video visti, referral, bonus
> sequenza. **Non ha controvalore in euro** — è una valuta interna
> della piattaforma."

Due cose sbagliate:
1. **"Non ha controvalore in euro"** — falso. Direttiva Skeezu: **1
   ARIA vale €0,10**. È già la tokenomics LOCKED (ARIA hub stabile
   €0,10). La pagina non è mai stata allineata.
2. La lista di guadagno è **stale** — cita "login giornaliero (+1),
   check-in quotidiano, video visti, bonus sequenza", ma la §10 della
   stessa pagina dice che check-in/video/bonus-sequenza **non esistono
   più**. §02 e §10 si contraddicono.

### Copy corretta (paragrafo ARIA §02) — ROBY
Sostituire l'intero paragrafo "ARIA — la valuta di piattaforma" con:

> **ARIA — la valuta di piattaforma**
>
> È la valuta che usi per partecipare agli airdrop. 1 ARIA ha un
> valore di riferimento di **€0,10**. In fase testnet (Alpha) l'ARIA
> **non si compra: si ottiene solo gratis** sulla piattaforma —
> faucet giornaliero (+100), sequenza giornaliera (+50 per giorno
> timbrato), referral. È la valuta interna di AIROOBI.

Questo corregge sia il valore (€0,10) sia la lista guadagno (ora
coerente con §10), e dice esplicitamente la cosa che Skeezu vuole:
in testnet l'ARIA si ottiene, non si compra.

### Sweep "ovunque" — verify-before-fix
Skeezu dice "va corretta ovunque". CCP greppa il repo per le frasi
stale e segnala gli hit; ROBY fornisce la copy corretta per ognuno.
Target di grep:
- `controvalore in euro`
- `valuta interna` (in contesto ARIA)
- `non ha valore` / `nessun valore`
- statement di valore ARIA su: `home`, `faq`, blog (`04_blog_articles/`),
  dApp (`dapp.html`, tooltip ARIA), `privacy`/`termini`, ABO.

Per ogni hit, la regola canonica: ARIA **ha** un valore di
riferimento (€0,10) ma in testnet **non è acquistabile, si ottiene**.
Manda gli hit a ROBY → copy puntuale per ognuno (pattern Privacy/ToS).

### Nota compliance (per Skeezu, non blocca)
Il "non ha controvalore in euro" originale era probabilmente un hedge
di compliance — non dare ad ARIA un prezzo esposto in testnet. La
copy nuova lo gestisce bene: dichiara il **valore di riferimento**
€0,10 ma chiarisce che in testnet **non si compra**. Valore sì,
acquisto no = niente prezzo di mercato esposto. Da tenere sul radar
della revisione legale pendente, ma la formulazione è prudente.

## 3. Severità & cadenza

| Bug | Sev | Lane |
|---|---|---|
| LB-3 explorer mobile | P1 | CCP frontend, batch giornaliero |
| LB-4 copy ARIA | P1 | copy ROBY consegnata → CCP applica HTML + sweep |

Nessuno dei due è P0 (non bloccano login/acquisto/valutazione/
treasury). Sono P1: degradano una pagina chiave / informano male.

## RS — paste-ready

```
RS · FAST-TRACK LB-3 + LB-4 (P1)

LB-3 · ARIA EXPLORER OVERFLOW MOBILE
airoobi.app/explorer si vede male su mobile: documentScrollWidth 565
>> viewport, numeri/label tagliati, scroll orizzontale. Root cause:
larghezza FISSA — .exp-container width:565px, .exp-refresh/.exp-stats
width:517px, mai resi responsive. Fix: .exp-container/.exp-refresh/
.exp-stats da px fissi a width:100% + max-width desktop · .exp-stats
grid → 1 colonna @max-480px · box-sizing border-box. Verify-before-fix:
greppa la regola width e controlla se .exp-container è condiviso con
/explorer-robi (fix unico). Cache-bust ?v= + footer. ROBY verifica
UI-click 412px.

LB-4 · COPY ARIA "NON HA CONTROVALORE IN EURO" — SBAGLIATO
come-funziona-airdrop §02 dice "ARIA non ha controvalore in euro" +
lista guadagno stale (check-in/video/bonus-sequenza che §10 dice non
esistere più). Sostituire l'intero paragrafo "ARIA — la valuta di
piattaforma" con:

  ARIA — la valuta di piattaforma
  È la valuta che usi per partecipare agli airdrop. 1 ARIA ha un
  valore di riferimento di €0,10. In fase testnet (Alpha) l'ARIA non
  si compra: si ottiene solo gratis sulla piattaforma — faucet
  giornaliero (+100), sequenza giornaliera (+50 per giorno timbrato),
  referral. È la valuta interna di AIROOBI.

SWEEP "ovunque": greppa il repo per "controvalore in euro" / "valuta
interna" (contesto ARIA) / "non ha valore" su home, faq, blog
(04_blog_articles), dapp.html (tooltip ARIA), privacy/termini, ABO.
Manda gli hit a ROBY → copy puntuale per ognuno. Regola canonica:
ARIA HA un valore di riferimento €0,10 ma in testnet NON è
acquistabile, si ottiene. Cache-bust + footer. ROBY verifica UI-click.

Entrambi P1. Nessun P0/P1 bloccante a parte questi.
```

## Bottom line

LB-3: explorer da rendere responsive (larghezze fisse → fluide). LB-4:
copy ARIA da correggere — €0,10 valore di riferimento, in testnet si
ottiene non si compra — sulla come-funziona §02 e ovunque appaia.
Entrambi P1, frontend/copy, fast-track batch giornaliero.

Audit-trail: questo file = RS ROBY fast-track LB-3 + LB-4 ·
LB-3 ARIA Explorer airoobi.app/explorer overflow orizzontale mobile
(documentScrollWidth 565 >> viewport · root cause larghezza fissa
.exp-container 565px + .exp-refresh/.exp-stats 517px non responsive ·
fix width:100%+max-width + .exp-stats grid 1col @max-480px +
box-sizing · verify se .exp-container condiviso con /explorer-robi ·
cache-bust+footer · ROBY verifica UI-click 412px) · LB-4 copy ARIA
come-funziona-airdrop §02 "non ha controvalore in euro" sbagliato +
lista guadagno stale contraddice §10 · copy ROBY corretta: ARIA
valore di riferimento €0,10 + in testnet non si compra si ottiene
gratis (faucet/sequenza/referral) coerente con §10 · sweep ovunque
grep "controvalore in euro"/"valuta interna"/"non ha valore" su
home/faq/blog/dapp/privacy/termini/ABO → hit a ROBY per copy puntuale
· coerente tokenomics LOCKED ARIA hub €0,10 · nota compliance hedge
"non si compra in testnet" prudente per revisione legale · entrambi
P1 fast-track batch giornaliero.

---

*ROBY · Strategic MKT & Comms & Community · RS fast-track LB-3 + LB-4 · 25 May 2026 · daje team a 4*
