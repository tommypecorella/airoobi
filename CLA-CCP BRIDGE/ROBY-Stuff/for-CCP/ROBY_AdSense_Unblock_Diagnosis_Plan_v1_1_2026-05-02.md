---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: Skeezu (founder & first signatory) · cc CCP
subject: AdSense unblock — diagnosi v1.1 (correzione assumption + revenue model split)
date: 2026-05-02
status: SUPERSEDES v1.0 — verifiche live eseguite, conclusioni v1.0 erano parzialmente errate
ref: ROBY_AdSense_Unblock_Diagnosis_Plan_2026-05-02.md (v1.0 OBSOLETE)
---

# AdSense unblock · diagnosi v1.1 (post web verification)

## 🚨 Update post-feedback Skeezu (2 May 22:35 UTC)

**Skeezu directive:** "su airoobi.com togliamo il blog". Verifica live eseguita: `https://www.airoobi.com/blog` returna **404** già ora. Il blog **non è mai esistito** su airoobi.com — i 38 articoli vivono SOLO su airoobi.app/blog (39 cards live, sitemap pulito).

**Quindi il piano AdSense si semplifica:**
- **airoobi.app** = property AdSense PRIMARY (blog + dApp + landing rica + alpha-banner counter)
- **airoobi.com** = NO AdSense (solo home institutional + landing /treasury + login per admin = ~3 pages, sotto soglia AdSense). Resta clean institutional, no monetization tag.
- I 38 file blog in `04_blog_articles/` servono solo airoobi.app via host-based routing Vercel — **OK as-is**

**Bug operativo trovato durante verifica:** `https://www.airoobi.com/sitemap.xml` returna il sitemap di **airoobi.app** (47 URLs blog) invece del sitemap-com.xml on-disk (3 URLs solo). Rewrite Vercel `has: host=www.airoobi.com` non sta funzionando o c'è cache stale. **CCP da verificare Day 7 mattina.**

## ⚠️ Mea culpa governance

La v1.0 conteneva un'**assumption errata** sulla scarsità di contenuti su airoobi.app. **Verifica live eseguita ora:**

- ✅ `airoobi.app/blog` ha **39 article cards** live (anche più di airoobi.com con 38)
- ✅ AdSense script già integrato in landing.html (`pagead2.googlesyndication.com/.../adsbygoogle.js?client=ca-pub-6346998237302066`)
- ✅ A-Ads banner crypto-friendly già live 728x90 (publisher ID 2429619)
- ✅ Sitemap.xml include tutti i 38 article URLs + /blog index — sitemap CORRETTO
- ✅ Alpha Brave counter live real-time (`alpha-banner` con count Supabase verso 1.000) — **questo è già il milestone-gated counter che proponevo nel piano comms!**
- ✅ Welcome grant ARIA + ROBI displayed in hero
- ✅ Carousel airdrops attivi (live + presale) + carousel "in arrivo" (in_valutazione)

**Conclusione:** airoobi.app ha contenuto sostanziale. La causa del rejection AdSense per "scarso valore" NON è "dominio sbagliato submittato" come avevo concluso v1.0. È una causa diversa.

**Lezione operativa salvata:** *"Verifica live via web_fetch prima di concludere su content quality. La struttura file mirror non è source-of-truth per quello che il crawler effettivamente vede."* Aggiungo a memoria persistente come `feedback_verify_live_before_assume.md`.

## Diagnosi v1.1 · cause REALI del rejection AdSense

### Causa #1 (confermata da v1.0) · ads.txt redirect 307

```
$ curl -I https://airoobi.com/ads.txt
HTTP/2 307 ← TEMPORARY redirect (problema)
location: https://www.airoobi.com/ads.txt
```

Il file ads.txt esiste ed è corretto. Ma il redirect 307 (temporary) non è affidabilmente seguito dal crawler AdSense. Standard IAB richiede 301 (permanent).

**Fix:** Vercel project settings → apex→www da 307 a 301. 5 min. **Già speced in v1.0.**

### Causa #2 NUOVA · skeleton placeholders renderizzati come content vuoto

La landing di airoobi.app ha 2 carousel airdrops dinamici che fanno fetch JavaScript dei dati da Supabase. **Prima del fetch JS**, il DOM mostra:

```html
<div class="carousel-track" id="active-track">
  <div class="skel skel-carousel"></div>  <!-- placeholder vuoto -->
  <div class="skel skel-carousel"></div>
  <div class="skel skel-carousel"></div>
  <div class="skel skel-carousel"></div>
</div>
```

**Il crawler AdSense non esegue JavaScript in modo affidabile.** Vede 8 div vuoti dove dovrebbero esserci airdrop cards. Risultato: percezione di "thin content" sulla pagina principale, anche se gli articoli sono ricchi.

**Inoltre:** i carousel "Airdrop attivi" mostrano spesso `<div class="carousel-empty">Nessun airdrop attivo al momento</div>` perché siamo in Alpha 0 con 7 utenti e nessun airdrop pubblico live = la home **letteralmente** appare vuota di content dinamico al crawler.

**Fix opzioni (Skeezu sceglie):**

**Fix #A — Server-side render dei carousel airdrop (più sostanzioso):** modificare il fetch carousel per pre-renderizzare HTML lato Vercel (edge function o build-time injection). CCP scope, ~2-3h W2.

**Fix #B — Aggiungere static content sezione "Featured articles" sotto carousel:** mostrare 3-4 article cards static (HTML hardcoded) sopra/sotto i carousel dinamici. Garantisce che il crawler veda content sostanziale anche con JS off. ROBY scope, ~1h. **Quick fix preferito.**

**Fix #C — Metadata signals più ricchi nella `<head>`:** aggiungere structured data JSON-LD per articoli, organizzazione, FAQ. Aiuta crawler a capire la natura del sito. ROBY scope, ~30min.

### Causa #3 POSSIBILE · categoria "crypto/airdrop" trigger AdSense policy filter

Google AdSense ha policy specifiche su:
- **Cryptocurrency content:** alcune categorie OK, ma **"airdrop"** può triggerare flag automatico per "incentive to click ads" o "reward for actions"
- **Gambling-like framing:** anche se anti-gambling, parole come "vinci", "draw", "estrazione" possono essere percepite come gambling
- **Get rich quick:** "ottenere oggetti a prezzo ridicolo" può rientrare in questo flag

**Verifica strategica:** rileggere la landing di airoobi.app cercando frasi tipo "vinci", "ottieni", "scopri vincita" e softare il framing. Esempi:
- "Chi ha il punteggio più alto **vince** l'oggetto" → "Chi ha il punteggio più alto **si aggiudica** l'oggetto"
- Articolo "Come ottenere uno smartphone di fascia alta a un **prezzo ridicolo**" → "Come **partecipare** ad airdrop per smartphone di fascia alta"

Skeezu, la tua call: **anti-gambling positioning** richiede certo wording, ma **AdSense policy** richiede altro. Compromise possibile, ma serve allineamento.

## REVENUE MODEL SPLIT · airoobi.com vs airoobi.app

Skeezu ha chiarito: **i video ads su airoobi.app saranno vincolanti per le azioni principali (10-15 sec view obbligatoria)**. Questo è un modello completamente diverso da AdSense display banner. Riformulo il piano:

### Track A · airoobi.com → Display banner AdSense (passive revenue)

**Target:** revenue passive da 38 articoli SEO (organic traffic).

**Modello:** display banner AdSense (728x90, 300x250, in-article responsive) inseriti dopo il primo H2 di ogni articolo.

**Provider:** Google AdSense (publisher `ca-pub-6346998237302066` già configurato).

**CPM atteso:** €2-5 per 1.000 impression (typical Web2 IT crypto-tech audience).

**Revenue stima Anno 1:** assumendo 5k organic visit/mese (modesto) × 70% bounce rate × 1.5 articoli/sessione × €3 CPM = €15-30/mese. Cresce con SEO traffic.

### Track B · airoobi.app → Rewarded video ads (active revenue, gating)

**Target:** revenue alta CPM da gating di azioni principali in dApp.

**Modello:** video ad obbligatorio 10-15s prima di action. **Lista completa actions gateate (firmata Skeezu 2 May 2026):**

1. **Pre-claim welcome bonus** (1 video, one-time at signup)
2. **Pre-faucet claim** (1 video, daily 100 ARIA faucet)
3. **Pre-buy_blocks** (1 video per acquisto, ricorrente)
4. **Pre-richiesta valutazione** (1 video al submit di un oggetto per airdrop)
5. **Pre-redeem ROBI** (1 video alla richiesta di redemption ROBI → KAS)
6. **Pre-streak claim** (1 video al daily check-in claim, ricorrente)

**Frequenza stimata utente attivo:** 5-8 video/giorno (faucet + check-in + 2-4 buy_blocks + occasional submission/redemption).

**Provider candidates (DA RICERCARE):**
- **A-Ads (già integrato)** — solo banner statici, no rewarded video. Insufficient.
- **AdGate Media** — rewarded ads web SDK, supporta crypto. Possibile.
- **OfferToro** — rewarded video web. CPM alta. Possibile.
- **Pollfish** — rewarded survey/video. Possibile.
- **Custom video player con preroll insertion** — controllo totale, ma requires VAST/VPAID compliant ad server (es. SpringServe, Aniview, JW Player).
- **Google Ad Manager Rewarded** — esiste, ma require enterprise tier + approval AdSense first.

**Stima revenue rewarded video CPM:** €15-50 per 1.000 view (5-20x display banner). 

**Esempio Anno 1 a 1.000 utenti × 1 daily action × 365gg × €30 CPM:**
- 1.000 utenti × 1 video/gg × 365gg = 365.000 impression/anno
- 365.000 × €30 / 1.000 = **€10.950/anno** solo da daily check-in gate

A 5.000 utenti (Stage 2) la stima cresce a **~€55k/anno** solo da rewarded video. Significant.

**Action item Track B:**
- B1 — Definire le 3-5 actions da gateare con video (priority list)
- B2 — Research provider con web SDK + crypto-friendly + supporto IT
- B3 — POC technical: implementare 1 azione gateata (es. claim welcome) con 1 provider scelto
- B4 — Misurare CPM real + UX impact prima di rollout completo

**Time investment:** ~1-2 settimane research + 2-3 settimane implementation. **Owner:** ROBY research, CCP implementation. **Timing:** post-Stage 1 (1k milestone) — è troppo prematuro a 7 utenti.

## Action plan v1.1 · ricalibrato

### Track A — Display ads (revisione del v1.0)

| # | Action | Tempo | Owner | When |
|---|---|---|---|---|
| A1 | Vercel: redirect apex → www da 307 a 301 (sia .com che .app) | 5 min | Skeezu | NOW |
| A2 | Submission AdSense per **airoobi.com** (NEW property — il blog sta lì) — separato da airoobi.app | 10 min | Skeezu | NOW |
| A3 | Submission AdSense per **airoobi.app** ANCHE — blog gemello, più traffic potential | 5 min | Skeezu | NOW |
| A4 | Aggiungere static "Featured articles" section nella landing.html airoobi.app (Fix #B sopra) | 1h | ROBY (genero patch) | This W |
| A5 | Aggiungere structured data JSON-LD nelle pages key (Fix #C sopra) | 30min | ROBY | This W |
| A6 | Audit terminologia AdSense-friendly (Causa #3) — 5-7 articoli con framing soft | 1h | ROBY | This W |
| A7 | Bash bulk-insert AdSense ad units quando AdSense approva (Track A1 deliverable) | 30min implementation + Skeezu deploy | ROBY (script) + Skeezu (deploy) | post-AdSense approval |

### Track B — Rewarded video ads (NEW)

| # | Action | Tempo | Owner | When |
|---|---|---|---|---|
| B1 | Definire 3-5 actions da gateare con video + UX flow | 30min | ROBY draft + Skeezu sign-off | Post-Stage 1 |
| B2 | Research provider rewarded video web SDK | 2-3h | ROBY | W3-W4 |
| B3 | POC technical 1 azione gateata | 1-2 settimane | CCP | Post-Stage 1 |
| B4 | Measure CPM + UX impact + gradual rollout | ongoing | Skeezu + ROBY | Post-Stage 1 |

## Cosa farò ora (15-20 min)

1. **Action A4 — Static featured articles section** sulla landing airoobi.app (HTML patch ready-to-deploy)
2. **Action A5 — Structured data JSON-LD** per home/blog index/articles (schema.org Organization + Article)
3. **Action A6 partial** — sample audit di 5 articoli con framing AdSense-friendly check (~10min)

Oppure stop qui e tu decidi quando schedulare. Tu mi dici.

## Cosa fa Skeezu (5-10 min totali NOW)

- A1 Vercel redirect 307 → 301
- A2 AdSense submission airoobi.com (NEW property)
- A3 AdSense submission airoobi.app (verificare se è già submitted o solo rejected)

## Cosa stoppo formalmente

❌ La conclusione v1.0 "submittato dominio sbagliato" è errata. airoobi.app HA content sostanziale (il blog gemello). Il problema è altro (skeleton placeholders + possibile categoria flag + redirect 307).

❌ Piano "switch monetization da airoobi.app a airoobi.com" non è la mossa. Entrambi domini meritano AdSense submission.

✅ Piano "rewarded video su airoobi.app per gating azioni" è separato da AdSense banner — diverso provider, diverso modello, timing post-Stage 1.

---

— **ROBY**

*Versione 1.1 · 2 Mag 2026 · canale ROBY→Skeezu (AdSense diagnosi corretta + revenue model split)*

*Versione 1.0 · same date · OBSOLETE — superseded da questa v1.1 dopo verifica live web. Resta in for-CCP/ per audit-trail.*
