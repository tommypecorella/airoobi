---
title: CCP · ack RS LB-6 B.11 rewrite shipped (HTML statico verbatim) · FLAG 1 stale (blog/ già 100% pulito) · FLAG 2 1 nuovo hit + 5 già flaggati
purpose: B.11 rewrite ROBY (`ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html`) shippato verbatim su `blog/check-in-giornaliero-airoobi-perche-importante.html` + bridge mirror `04_blog_articles/`. Filename trovato dopo hint Skeezu (era in for-CCP/, non in 04_blog_articles/ come premessa brief). FLAG 1 a-ads: premessa "~38 articoli lo hanno ancora" è STALE — verifica grep conferma blog/ 100% pulito pre-B.11 (38/38 articoli zero hit), il rewrite B.11 reintroduce 1 hit a-ads (line 159 script src=//www.a-ads.com/2429619/aads.js). Cleanup separato P2: post-ship blog/ ha esattamente 1 hit a-ads (solo B.11), decisione cleanup a ROBY. FLAG 2 grep mirato 04_blog_articles: 5 articoli rewrite-class già flaggati in §5.1 ack precedente + 1 NEW (`come-funziona-airdrop-airoobi-guida-completa.html` "streak settimanale").
date: Dom 25 maggio 2026
audience: ROBY · Skeezu
status: B.11 shipped verbatim · FLAGS verificati · 3 premise stale brief flaggate
in-reply-to: RS Skeezu 25 May 2026 LB-6 B.11 + ROBY_RS_LB6_B11_Article_Rewritten_2026-05-25.md + ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html
---

# CCP — Ack RS LB-6 B.11 shipped · FLAGS verificati

## TL;DR

- **B.11 shipped verbatim**: il file rewrite ROBY
  `ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html` copiato
  identicamente su `blog/check-in-giornaliero-airoobi-perche-importante.html`
  (live URL invariato) + bridge mirror `04_blog_articles/`. Diff
  triplo verificato: blog ≡ bridge_mirror ≡ for-CCP/ source. HTML
  statico, nessun footer/?v=/redirect (per brief).
- **Verify-before-ship file location**: la premessa brief "il file
  è in `04_blog_articles/`" era stale → bridge `04_blog_articles/`
  conteneva solo vecchio mirror Apr 21 col vecchio modello. Hint
  Skeezu (filename `ROBY_LB6_B11_check-in-giornaliero_REWRITTEN`)
  ha indirizzato find ricorsivo: file in `ROBY-Stuff/for-CCP/`.
  Stop+ask applicato per `feedback_3_options_stop_pattern.md`.
- **FLAG 1 a-ads premise STALE**: i ~38 articoli blog NON hanno
  più a-ads — verifica grep `a-ads|aads.io` su `blog/*.html` =
  **0/38 hit pre-B.11**. Già rimossi (probabilmente con il drop
  23 May citato in MEMORY). Il rewrite B.11 REINTRODUCE 1 hit
  (line 159 `<script async src="//www.a-ads.com/2429619/aads.js">`).
  Post-ship `blog/` ha esattamente **1 hit a-ads (solo B.11)**.
  Decisione cleanup a ROBY (strip su B.11? o riattivazione globale
  pending consent banner?). CCP non strippa unilateralmente: brief
  esplicito "ship verbatim + cleanup P2 separato".
- **FLAG 2 grep mirato 04_blog_articles**: 5 articoli già flaggati
  in §5.1/§5.2 LB-6 ack precedente + **1 NEW hit** =
  `blog/come-funziona-airdrop-airoobi-guida-completa.html`
  ("streak settimanale" presente — articolo distinto dal site-page
  LB-4-chiuso `come-funziona-airdrop.html`).

## 1. B.11 shipped · verify-before-ship trail

### File location verify

Brief premise: "L'articolo è stato riscritto da zero in
`04_blog_articles/`".

`find` ricorsivo iniziale (`-iname "*check-in*"`) ha trovato solo:
- `04_blog_articles/check-in-giornaliero-airoobi-perche-importante.html`
  → vecchio mirror Apr 21 (title: "Perché il check-in giornaliero
  su AIROOBI vale molto più di 1 ARIA di test" = vecchio modello)

Premessa stale rilevata → ask Skeezu via 3-option pattern
(`feedback_3_options_stop_pattern.md`). Skeezu hint = filename
`ROBY_LB6_B11_check-in-giornaliero_REWRITTEN`.

`find -iname "*REWRITTEN*"` → ha trovato:
- `CLA-CCP BRIDGE/ROBY-Stuff/for-CCP/ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html`

ROBY ha droppato il file in for-CCP/ con prefisso `ROBY_*.html`
(pattern atipico: di solito i deliverable HTML vanno in bridge
mirror tipi `04_blog_articles/`). Sospetto: ROBY ha messo qui per
mantenere audit-trail RS (i `.md` ROBY_* sono in for-CCP/),
delegando a CCP il ri-naming + drop alla destinazione finale.

### Verify model markers

| Check | Risultato |
|---|---|
| New model (sequenza/faucet/moltiplicatore fedeltà) | 15 hit ✅ |
| Stale (video +1 ARIA / streak settimanale / +10/+15 / airdrop finale mainnet) | 0 hit ✅ |
| a-ads script | 1 hit (line 159) ⚠️ FLAG 1 |
| Title | "Check-in giornaliero AIROOBI: perché la sequenza giornaliera vale più di quanto sembra" ✅ |
| URL canonical | airoobi.com/blog/check-in-giornaliero-airoobi-perche-importante.html ✅ stesso URL |
| Template HTML | invariato (struttura ok) ✅ |

### Ship action

```bash
cp ROBY-Stuff/for-CCP/ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html \
   blog/check-in-giornaliero-airoobi-perche-importante.html

cp ROBY-Stuff/for-CCP/ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html \
   CLA-CCP BRIDGE/04_blog_articles/check-in-giornaliero-airoobi-perche-importante.html
```

Diff verificato: blog ≡ bridge mirror ≡ for-CCP source (3 file
identici). Zero modifiche introdotte da CCP — ship verbatim.

## 2. FLAG 1 · a-ads cleanup status

### Premise brief (stale)

> "FLAG 1 — a-ads: l'articolo ha ancora lo script a-ads. Memoria:
> A-ADS rimosso 23 May → i ~38 articoli blog lo hanno ancora.
> Cleanup separato P2, CCP verifica."

### Reality check

`grep -rli "a-ads|aads.io" blog/*.html` (pre-B.11) = **0/38 hit**.

Tutti i 38 articoli blog esistenti sono già 100% a-ads clean. Il
cleanup citato 23 May in MEMORY è stato eseguito globalmente, non
solo su home/dapp. Premessa "~38 articoli lo hanno ancora" =
stale.

Il rewrite B.11 reintroduce 1 hit:

```html
<!-- line 159 -->
<script async src="//www.a-ads.com/2429619/aads.js"></script>
```

Post-ship blog/ totale a-ads hit = **1** (solo B.11 nuovo).

### Decisione cleanup → ROBY

CCP NON strippa unilateralmente: brief esplicito "Cleanup separato
P2" → cleanup è scope di un futuro RS dedicato, non bundled con
B.11 ship. Ship verbatim mantiene fede al brief.

ROBY decide cosa fare:

- **Opzione A**: cleanup ad-hoc B.11 (strippare line 159, 1 commit
  rapido) → blog/ torna 100% pulito
- **Opzione B**: tenere la script su B.11 in attesa decisione
  globale (consent banner + riattivazione coordinata)
- **Opzione C**: cleanup totale anti-regressione: aggiungere lint
  pre-commit che blocca `a-ads|aads` su `blog/*.html`

MEMORY policy (23 May 2026): "Ads rimosso · riattivare con
consent banner". Implicazione: ads OFF finché consent non in
place. La nuova hit B.11 contraddice la policy → suggerisco
Opzione A o C.

## 3. FLAG 2 · grep mirato 04_blog_articles

Pattern ricercati per file (esclusi `check-in-giornaliero…` =
ora shipped + `come-funziona-airdrop.html` site page = LB-4
chiuso, NON è in blog/):

| Pattern | Hit files |
|---|---|
| `check-in.{0,20}\+1.{0,5}ARIA` | come-guadagnare-punti-aria, guadagnare-crypto-gratis, streak-settimanale |
| `video.{0,30}\+1.{0,5}ARIA` | (nessuno) |
| `streak settimanal` | come-guadagnare-punti-aria, **come-funziona-airdrop-airoobi-guida-completa** (NEW), guadagnare-crypto-gratis, fair-airdrop, streak-settimanale |
| `airdrop finale.*mainnet` | fair-airdrop |
| `\+10/\+15` | (nessuno) |
| `\+10.{0,5}ARIA.{0,30}referral / referral.{0,30}\+10` | guadagnare-crypto-gratis, referral-program, streak-settimanale |

### Cross-ref con §5.1/§5.2 LB-6 ack precedente

**Già flaggati in §5.1 (rewrite-class)**:
- `streak-settimanale-airoobi-bonus-costanza.html` ✅
- `guadagnare-crypto-gratis-senza-investire.html` ✅
- `come-guadagnare-punti-aria-airoobi.html` ✅
- `referral-program-airoobi-guadagna-invitando-amici.html` ✅

**Già flaggato in §5.2 (sub paragrafale)**:
- `fair-airdrop-cosa-significa-davvero.html` ✅

**NEW (non flaggato precedentemente)**:
- ⚠️ `blog/come-funziona-airdrop-airoobi-guida-completa.html`
  — hit "streak settimanale" (pattern abolito §0)

Nota: questo articolo blog è **distinto** dal site-page
`come-funziona-airdrop.html` chiuso in LB-4. Naming simile, due
asset diversi. ROBY: brief copy dedicato o classificare
rewrite-class come gli altri.

### Pattern NON trovati (puliti)

- `video.{0,30}\+1.{0,5}ARIA` → zero hit in blog/ (nessuna
  promessa video earning attiva nei blog)
- `\+10/\+15` → zero hit letterale (potrebbero esserci varianti
  con spazi/slash diversi, ma slogan-pattern è clean)

## 4. Audit-trail GO

- Brief RS: paste Skeezu in chat 25 May (testo originale RS) +
  file ROBY `ROBY_RS_LB6_B11_Article_Rewritten_2026-05-25.md`
  (announcement) + file rewrite
  `ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html` (deliverable)
- Esecuzione: ship verbatim verify-before-ship (3 premise stale
  flaggate + 1 corretta via Skeezu hint)
- Cadenza: one-item-gate derogata ROBY in LB-6 brief precedente
  per content-debt low-risk; B.11 fits stesso pattern.
- ROBY verifica UI-click post-ship.

## 5. Coda post-LB-6

- **B.11 cleanup a-ads** (Opzione A/B/C in §2)
- **FLAG 2 NEW** `come-funziona-airdrop-airoobi-guida-completa.html`
  brief copy ROBY
- **5 rewrite-class articles** (§5.1 ack precedente) in attesa
  brief rewrite ROBY (pattern B.11)
- **5 superfici mixed** (airoobi-explainer, video-airdrop,
  blog/fair-airdrop:194, blog.html cards, abo.html tooltips,
  diventa-alpha-brave:417) in attesa brief paragrafale ROBY

CCP idle in attesa.

## Audit-trail

CCP ack RS Skeezu+ROBY 25 May LB-6 B.11 rewrite shipped verbatim
file ROBY_LB6_B11_check-in-giornaliero_REWRITTEN.html in for-CCP/
(non in 04_blog_articles/ come da premessa brief stale · find
ricorsivo iniziale ha trovato solo vecchio mirror Apr 21 col
vecchio modello · hint Skeezu su filename ha sbloccato · pattern
feedback_3_options_stop_pattern + feedback_recursive_find_before_missing)
· copy verbatim 1:1 to blog/check-in-giornaliero-airoobi-perche-
importante.html (stesso URL) + bridge mirror 04_blog_articles/
diff triplo verificato 3 file identici · HTML statico no footer no
?v= no redirect per brief · verify model markers 15 hit
nuovo modello (sequenza giornaliera + faucet + moltiplicatore
fedeltà) + 0 hit stale (video +1 ARIA / streak settimanale /
+10/+15 / airdrop finale mainnet) · FLAG 1 a-ads premise brief
~38 articoli lo hanno ancora STALE → grep blog/ pre-B.11 = 0/38
hit cleanup già fatto globalmente 23 May · rewrite B.11
REINTRODUCE 1 hit a-ads line 159 script src www.a-ads.com/
2429619/aads.js · post-ship blog/ = 1 hit a-ads totale (solo
B.11) · CCP NON strippa unilateralmente brief esplicito cleanup
P2 separato · decisione cleanup A/B/C a ROBY (suggerito A o C
per coerenza MEMORY policy ads OFF until consent banner) ·
FLAG 2 grep mirato 04_blog_articles 4 articoli rewrite-class
streak-settimanale + guadagnare-crypto-gratis + come-guadagnare-
punti-aria + referral-program + fair-airdrop:194 GIÀ flaggati in
§5.1/§5.2 LB-6 ack precedente + 1 NEW come-funziona-airdrop-
airoobi-guida-completa.html "streak settimanale" (articolo blog
distinto dal site-page LB-4 chiuso) · pattern non trovati video
+1 ARIA letterale + +10/+15 letterale · ROBY verifica UI-click
post-ship B.11 cadenza one-item-gate derogata content-debt
low-risk · 3 premise brief flaggate stale: file location (corretto
via Skeezu) + a-ads 38 articoli (già clean) + (no terza, FLAG 2
mixed parziale).

---

*CCP · CIO/CTO AIROOBI · ack RS LB-6 B.11 shipped + FLAGS · 25
May 2026 · daje team a 4*
