---
title: CCP · LB-7 P2a shipped — STOP+ASK A+B firmati Skeezu (chat diretta) + P2b blog gated
purpose: Follow-up al CCP_Ack_RS_LB7. Registra le decisioni Skeezu sui 2 STOP+ASK (arrivate via chat DIRETTA Skeezu→CCP, non via ROBY RS — flaggato per audit-trail). P2a consumer/EDU shipped. P2b ~18 articoli blog gated su UI-click ROBY di P1+P2a.
date: Sab 30 maggio 2026
audience: ROBY · Skeezu
status: A=rename pieno "ROBI Reward" · B=drop buono fruttifero (+comms rule MEMORY.md aggiornata) · P2a shipped (8 file) · P2b blog ~18 articoli pronto, gated UI-click
---

# CCP · LB-7 P2a shipped + decisioni A/B

## ⚑ Provenienza decisioni (audit-trail [[feedback-flag-go-skeezu-direct]])

I 2 STOP+ASK del CCP_Ack_RS_LB7 sono stati firmati da **Skeezu via chat
DIRETTA Skeezu→CCP**, NON via ROBY RS. Lo flaggo esplicito come da
protocollo audit-trail.

- **STOP+ASK A — nome prodotto → FIRMATO: (b) rename pieno backing-framed.**
  "Tessera Rendimento" / "yield token" / "interest-bearing certificate"
  → **"ROBI Reward"** (IT+EN unificato). Descrittore: "reward
  over-collateralizzato".
- **STOP+ASK B — analogia buono fruttifero → FIRMATO: (a) drop totale.**
  Via "buono fruttifero postale" ovunque → over-collateralization /
  backing verificabile on-chain (pattern MakerDAO/DAI). **Comms rule in
  MEMORY.md aggiornata** di conseguenza (la vecchia regola "NFT = buono
  fruttifero che cresce di valore" è stata sostituita con la regola
  MiCA-conforme).

## P2a — SHIPPED (consumer + EDU, IT+EN)

| File | Cosa |
|---|---|
| `come-funziona-airdrop.html` (EDU) | heading "le tessere rendimento/yield tokens" → "il reward over-collateralizzato"; body "come buoni fruttiferi · prezzo che cresce" → "tasso corrente di backing, verificabile on-chain"; roadmap "valgono di più/monetizzare" → "over-collateralizzati/riscuotere"; "prezzo di riscatto cresce" → "10% inflow nel treasury come backing". footer 4.16.0 |
| `tokens.html` | tagline "cresce con il treasury, come un buono fruttifero" → "over-collateralizzato dal treasury, backing verificabile on-chain" |
| `video-intro.html` | "Tessere Rendimento/Yield Tokens" → "reward over-collateralizzato"; "Valore garantito" → "Backing dal Fondo Comune" |
| `video-airdrop.html` | "Come un buono fruttifero digitale... cresce" → "Reward over-collateralizzato... backing verificabile on-chain" |
| `diventa-alpha-brave.html` | OG + twitter meta "ROBI come buono fruttifero ≥95% PEG" → "ROBI over-collateralizzato, backing verificabile on-chain" |
| `blog.html` | 2 card (titoli "la tua Tessera Rendimento" / "certificato NFT che garantisce il tuo valore" + excerpt buono-fruttifero) → "reward over-collateralizzato di AIROOBI" + excerpt backing |

**Non toccato (con motivo):**
- `home.html:565` — disclaimer "non garantisce un rendimento economico" = copy **protettiva**, si tiene
- `.card-rendimento` (airoobi-cards CSS) + `#dapp-wcard-rendimento` (dapp id) — **identificatori di codice**, non copy utente, fuori scope LB-7
- `termini.html` — **ToS**, differito al pass legale (brief §9)

## P2b — ~18 articoli blog · GATED su UI-click ROBY di P1+P2a

Rewrite editoriali (non 1:1) perché interi articoli sono costruiti sulla
tesi appreciation/buono-fruttifero. I più pesanti:
`cose-robi-tessera-rendimento` · `tessera-rendimento-come-funziona` ·
`fondo-comune-garanzia-trasparente` · `come-funziona-fondo-comune` ·
`nft-utility-token-differenza` · `kaspa-krc20` · `fair-airdrop` +
~11 con 1-3 hit.

**Direzione già autorizzata** (A+B firmati). Li faccio in **un batch
P2b dedicato (~half-day)** appena ROBY UI-click-verifica P1+P2a — così
rispettiamo la cadenza un-item-gate e non shippo 18 file senza checkpoint.

### Decisione minore flaggata — filename/URL blog
Due articoli hanno "tessera-rendimento" nello **slug URL**
(`/blog/cose-robi-tessera-rendimento-airoobi.html`,
`/blog/tessera-rendimento-airoobi-come-funziona.html`). In P2a ho
rinominato solo i **titoli/excerpt visibili**, lasciando gli **URL
stabili** (rinominare slug live = 301 redirect + sitemap + link interni
= costo SEO > beneficio). In P2b confermami se vuoi: **(a) URL stabili**
(reco CCP, slug ≠ nome prodotto) o **(b) rename slug + 301 + sitemap**.

## RS — paste-ready

```
CCP LB-7 P2a SHIPPED + A/B FIRMATI (chat diretta Skeezu, flaggato)

A = rename pieno → "ROBI Reward" (IT+EN). B = drop totale buono
fruttifero → over-collateralization/backing. Comms rule MEMORY.md
aggiornata.

P2a shipped (consumer+EDU, IT+EN): come-funziona-airdrop(EDU) · tokens
· video-intro · video-airdrop · diventa-alpha-brave(meta OG/tw) ·
blog.html(2 card). Lasciati: home:565 disclaimer · card-rendimento
CSS/id · termini.html(ToS, legal pass).

P2b = ~18 articoli blog, rewrite editoriali, GATED su tuo UI-click di
P1+P2a. Direzione già autorizzata, ~half-day in un batch.

Flag minore: slug URL blog con "tessera-rendimento" lasciati STABILI in
P2a (no break SEO). Confermi (a) URL stabili / (b) rename+301+sitemap in P2b.

Pronto per UI-click ROBY su P1+P2a.
```

## Bottom line

A+B firmati e incorporati, P2a (consumer + EDU) in produzione. Il sito
consumer-facing e l'EDU deliverable sono ora MiCA-conformi sul
linguaggio ROBI: zero "cresce di valore", zero "buono fruttifero", zero
"yield token". Manca il layer blog (P2b, ~18 articoli) che parte appena
fai UI-click su P1+P2a. Daje.

Audit-trail: questo file = CCP follow-up LB-7 P2a · STOP+ASK A+B firmati
Skeezu via chat DIRETTA (flaggato [[feedback-flag-go-skeezu-direct]]) ·
A=rename pieno "ROBI Reward" IT+EN · B=drop totale buono fruttifero +
comms rule MEMORY.md aggiornata MiCA-conforme · P2a shipped 8 file
consumer/EDU (come-funziona-airdrop EDU footer 4.16.0 · tokens ·
video-intro · video-airdrop · diventa-alpha-brave meta OG/tw · blog.html
2 card) IT+EN tutto → over-collateralizzato/backing on-chain · lasciati
home:565 disclaimer protettivo + card-rendimento CSS/id code + termini.html
ToS legal-pass · P2b ~18 articoli blog rewrite editoriali GATED su
UI-click ROBY P1+P2a (~half-day, direzione autorizzata) · flag slug URL
blog lasciati stabili (no break SEO, conferma a/b in P2b) · stato: P2a
prod live, P2b pronto gated.

---

*CCP · CIO/CTO AIROOBI · LB-7 P2a shipped + A/B firmati · 30 May 2026 · daje team a 4*
