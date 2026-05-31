---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · su Pi 5) · cc Skeezu
subject: AdSense fix — landing.html airoobi.app patch (static featured articles + JSON-LD structured data)
date: 2026-05-02
ref: ROBY_AdSense_Unblock_Diagnosis_Plan_v1_1_2026-05-02.md (action items A4 + A5)
status: READY-TO-DEPLOY · 2 patch + 3 structured data blocks
---

# AdSense fix — landing.html airoobi.app patches

## Intent

La landing di airoobi.app mostra carousel skeleton vuoti al crawler AdSense (JavaScript non eseguito affidabilmente). Causa #2 del rejection AdSense per "scarso valore". Fix:

- **A4 — Static featured articles section** sotto i carousel (visible al crawler anche con JS off)
- **A5 — JSON-LD structured data** in `<head>` (signal sostanza al crawler)

Patches sono **non-distruttivi**: solo additive. Skeezu/CCP deploya direttamente.

---

## PATCH A4 — Static featured articles section

### Dove inserire

Dentro `landing.html` di airoobi.app, **dopo** il blocco `<!-- ADS -->` (la sezione iframe a-ads.com 728x90), **prima** di `<!-- FOOTER -->` (la sezione `landing-footer`).

Pattern in landing.html attuale:

```html
<!-- ADS -->
<div class="ads-section">
  <iframe data-aa="2429619" ...></iframe>
</div>

<!-- ⬇️ INSERIRE QUI IL BLOCCO featured-articles ⬇️ -->

<!-- FOOTER -->
<footer class="landing-footer">
```

### CSS da aggiungere (dentro `<style>` esistente)

```css
/* Featured articles (AdSense-friendly content layer) */
.featured-articles{max-width:1100px;margin:0 auto;padding:0 24px 48px}
.featured-articles-title{font-family:var(--font-h);font-size:clamp(1.6rem,4vw,2.4rem);font-weight:600;text-align:center;margin-bottom:12px;color:var(--white);letter-spacing:-.01em}
.featured-articles-sub{text-align:center;font-size:.9rem;color:var(--gray-400);margin-bottom:36px;max-width:600px;margin-left:auto;margin-right:auto}
.featured-grid{display:grid;grid-template-columns:1fr;gap:18px}
@media(min-width:640px){.featured-grid{grid-template-columns:1fr 1fr}}
@media(min-width:960px){.featured-grid{grid-template-columns:1fr 1fr 1fr}}
.featured-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:var(--radius);padding:1.75rem;display:flex;flex-direction:column;gap:.75rem;transition:all .3s;text-decoration:none;color:inherit;position:relative;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.2)}
.featured-card:hover{border-color:rgba(74,158,255,.25);transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.4),0 0 0 1px rgba(74,158,255,.12)}
.featured-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)}
.featured-cat{font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:var(--accent);text-transform:uppercase;font-weight:600}
.featured-title{font-family:var(--font-h);font-size:1.25rem;font-weight:600;line-height:1.3;color:var(--white)}
.featured-excerpt{font-size:.875rem;color:var(--gray-300);line-height:1.65;flex:1}
.featured-link{display:inline-block;margin-top:.25rem;color:var(--accent);font-size:.875rem;font-weight:500;text-decoration:none;transition:opacity .25s}
.featured-card:hover .featured-link{opacity:.75}
.featured-cta{text-align:center;margin-top:32px}
```

### HTML block da inserire

```html
<!-- FEATURED ARTICLES (static, AdSense-friendly content) -->
<section class="featured-articles">
  <h2 class="featured-articles-title">Approfondimenti</h2>
  <p class="featured-articles-sub">Capisci come funziona AIROOBI: airdrop equi, blockchain Kaspa, il ROBI come tessera di rendimento, l'algoritmo deterministico che garantisce la fairness strutturale.</p>

  <div class="featured-grid">

    <a class="featured-card" href="/blog/cos-e-airoobi-piattaforma-airdrop-equi.html">
      <span class="featured-cat">Inizia da qui</span>
      <h3 class="featured-title">Cos'è AIROOBI: la piattaforma che reinventa gli airdrop</h3>
      <p class="featured-excerpt">Un marketplace di commercio basato sugli airdrop di oggetti fisici reali, costruito sulla blockchain Kaspa. Il principio è semplice: invece di vendere al miglior offerente, ogni partecipante può aggiudicarsi l'oggetto in base al proprio impegno misurato.</p>
      <span class="featured-link">Leggi l'articolo →</span>
    </a>

    <a class="featured-card" href="/blog/come-funziona-airdrop-airoobi-guida-completa.html">
      <span class="featured-cat">Guida pratica</span>
      <h3 class="featured-title">Come funziona un airdrop su AIROOBI: la guida completa</h3>
      <p class="featured-excerpt">Blocchi, score, draw deterministico: tutto quello che devi sapere per partecipare al tuo primo airdrop. Algoritmo pubblico, audit-able, riproducibile. Nessuna componente aleatoria pura, nessuna lotteria.</p>
      <span class="featured-link">Leggi l'articolo →</span>
    </a>

    <a class="featured-card" href="/blog/cose-robi-tessera-rendimento-airoobi.html">
      <span class="featured-cat">Tokenomics</span>
      <h3 class="featured-title">Cos'è ROBI: la tua Tessera Rendimento su AIROOBI</h3>
      <p class="featured-excerpt">ROBI è l'NFT che ottieni partecipando agli airdrop: non si compra, si guadagna. Cresce di valore col Fondo Comune e si riscatta in KAS. Garantito ≥95% del valore via backing economico trasparente.</p>
      <span class="featured-link">Leggi l'articolo →</span>
    </a>

    <a class="featured-card" href="/blog/blockchain-kaspa-ghostdag-spiegato.html">
      <span class="featured-cat">Tecnologia</span>
      <h3 class="featured-title">GHOSTDAG: l'algoritmo di Kaspa spiegato in modo semplice</h3>
      <p class="featured-excerpt">Un blocco al secondo, zero blocchi orfani. Come l'algoritmo BlockDAG di Kaspa risolve il trilemma della blockchain (sicurezza, scalabilità, decentralizzazione) e perché conta per il commercio digitale.</p>
      <span class="featured-link">Leggi l'articolo →</span>
    </a>

    <a class="featured-card" href="/blog/fair-airdrop-cosa-significa-davvero.html">
      <span class="featured-cat">Filosofia</span>
      <h3 class="featured-title">Fair airdrop: cosa significa davvero e come AIROOBI lo realizza</h3>
      <p class="featured-excerpt">Niente bot, niente whale, niente insider. Come l'algoritmo deterministico di AIROOBI garantisce equità strutturale tramite scoring concavo, fairness guard server-side e backing Treasury con PEG ratio bands.</p>
      <span class="featured-link">Leggi l'articolo →</span>
    </a>

    <a class="featured-card" href="/blog/come-funziona-fondo-comune-airoobi.html">
      <span class="featured-cat">Backing economico</span>
      <h3 class="featured-title">Il Fondo Comune di AIROOBI: come funziona la garanzia per tutti</h3>
      <p class="featured-excerpt">Il 22% di ogni airdrop alimenta il Fondo Comune. Cresce automaticamente con ogni completamento, protegge il valore dei ROBI con un peg minimo del 95% in KAS. Buono fruttifero anti-inflazione, totalmente trasparente.</p>
      <span class="featured-link">Leggi l'articolo →</span>
    </a>

  </div>

  <div class="featured-cta">
    <a href="/blog" class="btn-secondary" style="font-size:11px;padding:10px 28px">Tutti gli articoli del blog →</a>
  </div>
</section>
```

**Word count della section:** ~450 parole rendered. Combinato con hero + come-funziona + carousel labels = landing totale ~900-1000 parole crawlable senza JS. **Sopra soglia AdSense richiesta.**

**Article selection rationale:** ho scelto 6 articoli che coprono i 6 angoli core (intro · how-it-works · ROBI tokenomics · Kaspa tech · fair-airdrop philosophy · Fondo Comune backing). Tutti sono articoli "evergreen" da 1.300-1.600 parole — il crawler vede signal sostanziale.

---

## PATCH A5 — JSON-LD structured data

### Dove inserire

Dentro `<head>` di `landing.html` airoobi.app, **dopo** il `<link rel="canonical">` e **prima** del `<script async src="https://pagead2..."` AdSense.

### Block 1 — Organization (cross-page reusable)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AIROOBI",
  "alternateName": "Dream Robe E-Commerce",
  "url": "https://www.airoobi.app",
  "logo": "https://airoobi.com/AIROOBI_Symbol_White.png",
  "description": "AIROOBI è un fair-airdrop marketplace su Kaspa. Gli utenti partecipano ad airdrop con scoring matematicamente verificabile. Il valore economico è ancorato al PEG ratio Treasury KAS ≥0.95.",
  "foundingDate": "2026-03-11",
  "founder": {
    "@type": "Person",
    "name": "Tommaso Pecorella"
  },
  "sameAs": [
    "https://airoobi.com",
    "https://airoobi.app"
  ]
}
</script>
```

### Block 2 — WebSite + SearchAction

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AIROOBI · dApp Marketplace",
  "url": "https://www.airoobi.app",
  "inLanguage": ["it-IT", "en-US"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.airoobi.app/blog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

### Block 3 — Blog (solo per landing.html, signal "qui c'è un blog ricco")

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": "https://www.airoobi.app/blog",
  "name": "Blog AIROOBI",
  "description": "Approfondimenti su airdrop equi, blockchain Kaspa, NFT come garanzia e il futuro del commercio digitale.",
  "publisher": {
    "@type": "Organization",
    "name": "AIROOBI"
  },
  "url": "https://www.airoobi.app/blog"
}
</script>
```

---

## PATCH A5 bis — JSON-LD per article pages (template)

Da inserire nel `<head>` di **ogni article HTML** in `04_blog_articles/*.html`. Variabili `{{...}}` da sostituire per articolo.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{ARTICLE_TITLE}}",
  "description": "{{ARTICLE_META_DESCRIPTION}}",
  "image": "https://airoobi.com/og-image.png",
  "author": {
    "@type": "Organization",
    "name": "AIROOBI"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AIROOBI",
    "logo": {
      "@type": "ImageObject",
      "url": "https://airoobi.com/AIROOBI_Symbol_White.png"
    }
  },
  "datePublished": "{{PUBLISH_DATE_ISO}}",
  "dateModified": "{{LAST_MODIFIED_ISO}}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.airoobi.app/blog/{{ARTICLE_SLUG}}.html"
  },
  "inLanguage": "it-IT"
}
</script>
```

**Bash bulk-insert script** (CCP scope, ~20min):

```bash
#!/bin/bash
# Bulk-insert JSON-LD Article schema into all blog articles
# Usage: ./bulk_insert_jsonld.sh

BLOG_DIR="04_blog_articles"
TEMPLATE_FILE="/tmp/article-jsonld-template.json"

for article in $BLOG_DIR/*.html; do
  filename=$(basename "$article" .html)
  
  # Extract <title> as ARTICLE_TITLE
  title=$(grep -oP '(?<=<title>).*?(?=</title>)' "$article" | head -1)
  # Extract meta description
  desc=$(grep -oP '<meta name="description" content="\K[^"]+' "$article" | head -1)
  # Use filename as slug (already SEO-friendly)
  slug="$filename"
  # Default dates (override per file if needed)
  pub_date="2026-03-11T10:00:00Z"
  mod_date="2026-05-02T10:00:00Z"
  
  # Generate JSON-LD block
  jsonld=$(cat <<EOF
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"$title","description":"$desc","image":"https://airoobi.com/og-image.png","author":{"@type":"Organization","name":"AIROOBI"},"publisher":{"@type":"Organization","name":"AIROOBI","logo":{"@type":"ImageObject","url":"https://airoobi.com/AIROOBI_Symbol_White.png"}},"datePublished":"$pub_date","dateModified":"$mod_date","mainEntityOfPage":{"@type":"WebPage","@id":"https://www.airoobi.app/blog/$slug.html"},"inLanguage":"it-IT"}
</script>
EOF
)
  
  # Insert before </head>
  sed -i "s|</head>|$jsonld\n</head>|" "$article"
  
  echo "✓ Updated $filename"
done
```

CCP può rifinire dates per articolo (mapping data-pubblicazione → JSON-LD `datePublished`) post-bulk se necessario. Asset value: AdSense crawler riconosce ogni articolo come Article schema.org → boost per content quality signal.

---

## Cosa ottieni con questi 2 patch

| Metrica | Prima | Dopo |
|---|---|---|
| Word count crawlable landing.html (no JS) | ~400 | ~900-1000 |
| Carousel placeholders vuoti percepiti | YES | Mitigato (static section sotto) |
| Schema.org markup | minimal | Organization + WebSite + Blog + Article (per ogni articolo) |
| AdSense "thin content" risk | HIGH | MEDIUM (still helped da #A1 redirect 301 + #A6 framing audit) |

---

## Dependencies

- Patch A4 dipende solo da landing.html airoobi.app — può essere applicato indipendentemente
- Patch A5 (Organization + WebSite + Blog) idem, solo `<head>` injection
- Patch A5bis (Article schema su 38 articoli) dipende dal bash script — testarlo su 1 articolo prima del bulk

## Cosa NON è incluso in questo deliverable

- ❌ AdSense ad units placement (richiede AdSense approval + slot-IDs from console — Action A7)
- ❌ Static featured articles per airoobi.com — non serve, .com è institutional puro post-Skeezu directive
- ❌ Audit terminology "AdSense-friendly" sui 5-7 articoli (Action A6) — separato deliverable

---

## Closing peer-to-peer

CCP, questi sono patch additivi (no break risk). Skeezu deploya direttamente Day 7 mattina o W2 Day 1. Order suggerito:

1. Apply Patch A4 (static featured) + A5 (JSON-LD home) in `landing.html` → deploy → verify live (~10min)
2. Run bash bulk-insert A5bis su 38 articoli → deploy → verify 1 articolo random (~25min)
3. Configure Vercel redirect 307 → 301 (paralllel) → verify ads.txt (~5min)
4. Skeezu submit `airoobi.app` come AdSense property (NEW or re-submission) (~10min)

ETA AdSense re-crawl: 3-7 giorni. **Total time investment Skeezu+CCP: ~50min.**

---

— **ROBY**

*Versione 1.0 · 2 Mag 2026 · canale ROBY→CCP (AdSense fix landing patch + JSON-LD)*
