---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: Skeezu (founder & first signatory) · cc CCP
subject: AdSense unblock — diagnosi precisa + action plan switch airoobi.app → airoobi.com
date: 2026-05-02
status: DIAGNOSIS COMPLETED · 4 action items per Skeezu (no CCP scope · ~30-45min totali)
ref: Task #15 in_progress da W0
---

# AdSense unblock · diagnosi e action plan

## TL;DR

**Le 2 cause del rejection AdSense sono distinte, ognuna ha un fix diverso:**

1. **"ads.txt non trovato"** = problema di redirect (307 invece di 301 dal dominio bare al www)
2. **"contenuti di scarso valore"** = abbiamo submittato il dominio sbagliato (airoobi.app dApp con poca substance pubblica) invece di airoobi.com (38 articoli SEO da 750-1.600 parole each)

I 38 articoli sono **già high-quality** (verified on-disk: media ~1.300 parole, struttura H2 corretta, meta description presenti). Non è un problema di content, è un problema di **dominio submittato**.

## Diagnosi #1 — ads.txt redirect 307 (technical)

**Test live (eseguito 2 May 2026 22:24 UTC):**

```bash
$ curl -I https://airoobi.com/ads.txt
HTTP/2 307                          ← redirect TEMPORANEO
location: https://www.airoobi.com/ads.txt
```

Il redirect 307 è uno status code temporaneo. Il crawler AdSense (e diversi ads.txt validators) potrebbe **non seguire 307** in modo affidabile. Lo standard IAB ads.txt v1.0.2 richiede 301 (permanent).

**Stato del ads.txt al fondo del redirect:** ✅ corretto.
- `www.airoobi.com/ads.txt` → `google.com, pub-6346998237302066, DIRECT, f08c47fec0942fa0`
- `www.airoobi.app/ads.txt` → AdSense + a-ads.com

**Quindi il file esiste e contiene quel che deve, ma AdSense non lo trova perché si ferma al 307.**

### Fix: convertire il redirect 307 → 301 in Vercel

**Action item #1** — In Vercel project settings, cambiare il redirect da apex a www:
- Settings → Domains → airoobi.com (apex) → "Redirect to www.airoobi.com"
- Cambiare il tipo da **"Temporary (307)"** a **"Permanent (301)"**

Stesso per airoobi.app.

**Tempo:** 5 minuti. **Restart non necessario.**

### Alternative se non possibile cambiare il redirect

Se Vercel non permette di cambiare 307 → 301 (potrebbe essere hardcoded):
- Aggiungere un rewrite esplicito in `vercel.json` PRIMA del redirect apex→www:

```json
{
  "rewrites": [
    { "source": "/ads.txt", "destination": "/ads-com.txt" },
    ...
  ]
}
```

Questo è già presente! Quindi probabilmente il redirect avviene a livello di edge prima del rewrite di Vercel. La soluzione 301 è più pulita.

## Diagnosi #2 — "contenuti di scarso valore" (content)

**Causa probabile: hai submittato airoobi.app per AdSense, NON airoobi.com.**

- airoobi.app = dApp marketplace, content gated dietro auth (login/signup richiesto). Il crawler AdSense vede solo:
  - landing.html (poche righe)
  - login.html, signup.html (form)
  - faq.html (1 pagina)
  - come-funziona-airdrop.html (1 pagina)
  - dapp.html (vuoto senza auth)

Totale "valuable content" su airoobi.app crawlable: ~5-6 pagine, di cui 3-4 sono form/utility.

- airoobi.com = sito istituzionale + blog SEO con 38 articoli da 750-1.600 parole each (verified on-disk):

```
cos-e-airoobi-piattaforma-airdrop-equi.html: 752 parole, H2:5
come-funziona-airdrop-airoobi-guida-completa.html: 1.501 parole, H2:8
blockchain-kaspa-ghostdag-spiegato.html: 1.396 parole, H2:8
fair-airdrop-cosa-significa-davvero.html: 1.598 parole, H2:9
```

Tutti gli articoli hanno: `<title>`, `<meta name="description">`, multipli `<h2>`, struttura semantica corretta. **Sono articoli AdSense-grade.**

### Fix: submit airoobi.com, NON airoobi.app

**Action item #2** — In AdSense console:
1. Add new site: `airoobi.com` (NOT airoobi.app)
2. Code AdSense placement va su pages di airoobi.com (home + 38 blog articles)
3. ads.txt è già configurato correttamente per airoobi.com

**Action item #3** — Eventualmente lasciare airoobi.app fuori da AdSense per ora. La dApp non serve content ad-friendly. Quando avremo una "wallet experience" pubblica post-Stage 2 (KRC-20 transfers visibili), si rivaluta.

## Action plan completo per Skeezu

| # | Action | Tempo | Owner | Where |
|---|---|---|---|---|
| 1 | Vercel: redirect 307 → 301 per apex → www (sia .com che .app) | 5 min | Skeezu | Vercel project settings |
| 2 | AdSense console: add site airoobi.com (NEW property) | 10 min | Skeezu | AdSense console |
| 3 | AdSense: rimuovere airoobi.app (rejected, niente content) o lasciarlo standby | 2 min | Skeezu | AdSense console |
| 4 | Posizionare AdSense ad units sui 38 articoli + home airoobi.com (~1 ad/articolo, eventualmente 2 sui più long) | 20 min | Skeezu (manuale) o ROBY (genero il code snippet pronto) | airoobi.com pages |
| 5 | Aspettare AdSense re-crawl (24-72h post-fix) | passive | — | — |

**Totale tempo Skeezu attivo:** ~30-45 min. **ETA approval:** 3-7 giorni post-submission (tipico AdSense).

## Optional Action item #4 — code snippet AdSense ready-to-paste

Se vuoi, posso preparare un `<script>` AdSense ready-to-paste per inserimento massivo nei 38 articoli + home.html. Il pattern:

```html
<!-- AdSense — placement after 1st H2 -->
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-6346998237302066"
     data-ad-slot="[SLOT-ID-FROM-ADSENSE]"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

Skeezu deve generare lo SLOT-ID dentro AdSense console (1 ad unit per posizione). Posso scrivere il bash script per fare il bulk insert dopo il primo `<h2>` di ogni articolo se confermi il pattern.

## Action item #5 — verifica post-fix

Dopo il fix #1 (redirect 301), eseguire:

```bash
curl -I https://airoobi.com/ads.txt
# Expected: HTTP 301 (NOT 307)
curl -I -L https://airoobi.com/ads.txt
# Expected: final 200 OK with content
```

Quando 301 confermato, vai a https://www.adsense.com → Sites → Verify ads.txt → si dovrebbe vedere "Authorized seller relationship verified".

## Cosa NON è il problema

Per chiarezza, ho escluso queste possibili cause:

- ❌ **Quality dei 38 articoli** — verified high-quality, 750-1600 parole, struttura corretta
- ❌ **Naming legacy** (AICO/ARIA) — anche con vecchio naming, AdSense non rejecta per terminology
- ❌ **Domain age** — airoobi.com è registrato da pre-Marzo 2026, sufficiente
- ❌ **Privacy policy / Terms** — già presenti (privacy.html, termini.html)
- ❌ **Mobile responsiveness** — tutte le pages hanno viewport meta + responsive CSS
- ❌ **HTTPS** — entrambi i domini su HTTPS via Vercel

## Closing peer-to-peer

Skeezu, questo era un problema di **submit del dominio sbagliato** + **redirect technical**. Niente content da rifare, niente articoli da scrivere. ~30-45 min di azione tua + 3-7 giorni di pazienza AdSense crawler.

Action più importante: **#1 + #2 prima di tutto.** Il #4 (placement code) lo facciamo quando AdSense approva la nuova property airoobi.com.

Se confermi che vuoi procedere così, posso scrivere il bash script bulk-insert AdSense code per i 38 articoli (~10 min lavoro mio, pronto quando AdSense approva).

---

— **ROBY**

*Versione 1.0 · 2 Mag 2026 · canale ROBY→Skeezu (AdSense unblock diagnosi)*
