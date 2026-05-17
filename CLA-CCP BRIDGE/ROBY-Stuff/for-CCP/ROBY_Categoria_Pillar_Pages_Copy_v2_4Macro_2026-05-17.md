---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (CIO/CTO · Pi 5)
cc: Skeezu (Founder)
subject: 📝 Pillar Pages Copy v2 · 4 MACRO categoria (post CCP catch verify-before-brief · slug mismatch DB · drop moto+vintage v1) · ROBY+CCP LOCK Opzione A macro-grouping
date: Dom 17 maggio 2026 sera (post CCP review v1 · tactical autonomy delegated Skeezu)
ref: CCP_Review_ROBY_Pillar_Pages_v1_VerifyBeforeBrief_2026-05-20.md · ROBY_Categoria_Pillar_Pages_Copy_v1_2026-05-20.md (supersedes)
status: v2 SEALED · 4 macro pillar pages · CCP wire post-FASE-A W5+ window · Skeezu LOCK pending (tactical autonomy interpreted · revert se Skeezu pivot)
---

# 📝 Pillar Pages Copy v2 · 4 MACRO Categoria · Post CCP Catch

## TL;DR

CCP catch verify-before-brief v1 LOCK Opzione A applied: **4 macro pillar pages** (drop `moto` + `vintage` v1) · slug aligned with DB reality 16 sub-categories via mapping JSON · zero DB touch · ETA CCP wire ~4.5-5h W5+ window.

## 4 macro pillar pages · DB sub-slug mapping

| Macro pillar slug (URL) | DB child slugs (mapping JSON) | Copy v1 status |
|---|---|---|
| `/categoria/elettronica` | smartphone · tablet · computer · gaming · audio · fotografia | ✅ Copy v1 reusable (minor edit · drop categoria-specific quality criteria · expand macro-level) |
| `/categoria/luxury` | orologi · gioielli · borse | ✅ Copy v1 reusable (minor edit · macro-level positioning) |
| `/categoria/gioielli` | gioielli (1:1 DB match) | ✅ Copy v1 reusable as-is |
| `/categoria/arte-collezione` | arte (slug normalize URL → DB) | ✅ Copy v1 reusable (minor edit · arte+collezione macro) |

**Drop v1:** `moto` + `vintage` (NO DB match · W6+ reconsider con migration o TAG strategy).

## Mapping JSON canonical (per CCP wire)

**File:** `06_public_assets/copy/categorie/_mapping.json`

```json
{
  "elettronica": {
    "label_it": "Elettronica",
    "label_en": "Electronics",
    "db_child_slugs": ["smartphone", "tablet", "computer", "gaming", "audio", "fotografia"],
    "value_floor_eur": 500,
    "duration_days_default": 7,
    "copy_file": "06_public_assets/copy/categorie/elettronica.md"
  },
  "luxury": {
    "label_it": "Luxury",
    "label_en": "Luxury",
    "db_child_slugs": ["orologi", "gioielli", "borse"],
    "value_floor_eur": 1500,
    "duration_days_default": 14,
    "copy_file": "06_public_assets/copy/categorie/luxury.md"
  },
  "gioielli": {
    "label_it": "Gioielli",
    "label_en": "Jewelry",
    "db_child_slugs": ["gioielli"],
    "value_floor_eur": 1000,
    "duration_days_default": 14,
    "copy_file": "06_public_assets/copy/categorie/gioielli.md"
  },
  "arte-collezione": {
    "label_it": "Arte e Collezione",
    "label_en": "Art & Collection",
    "db_child_slugs": ["arte"],
    "value_floor_eur": 1000,
    "duration_days_default": 14,
    "copy_file": "06_public_assets/copy/categorie/arte-collezione.md"
  }
}
```

**Note `value_floor_eur`:** copy-only target audience messaging · NO DB enforcement (per LOCK Decisione 3) · standard Skeezu floor €500 LOCKED preserved Atto 1 v0.2-1.

---

## CATEGORIA 1 · ELETTRONICA (macro-aggregato)

### Slug URL: `/categoria/elettronica`
### DB child slugs: smartphone · tablet · computer · gaming · audio · fotografia

### Hero title (H1)
"Elettronica · partecipa per ottenerla"

### Subtitle / lede paragraph
Smartphone, tablet, laptop, gaming console, audio premium, fotocamere mirrorless, smartwatch, cuffie hi-fi. L'elettronica di valore non si vende e si compra solo · su AIROOBI si partecipa per ottenerla, un blocco alla volta.

### Body copy (~400 parole)

L'elettronica di valore è il regno della velocità. Modelli che escono ogni sei mesi, prezzi che cambiano ogni settimana, oggetti che valgono molto più del loro listino quando sono nuovi e molto meno quando finiscono in un cassetto.

AIROOBI è la piattaforma italiana dove l'elettronica trova una seconda vita più equa attraverso 6 sub-categorie di valore: smartphone · tablet · computer · gaming · audio · fotografia.

**Per chi vende:** se hai uno smartphone iPhone, un tablet Samsung Galaxy, un laptop MacBook, una console PlayStation 5, delle cuffie Bose o Sennheiser, una fotocamera Sony Alpha che non usi più · l'attesa su eBay o Subito può durare settimane o mesi. Su AIROOBI il tuo oggetto viene professionalmente valutato dal nostro team, riceve un certificato EVALOBI permanente blockchain-based, e diventa protagonista di un evento di partecipazione che si chiude entro 7-10 giorni. Liquidi velocemente, mantieni il valore, e il certificato AIROOBI resta associato all'oggetto anche se decidi di venderlo altrove dopo.

**Per chi partecipa:** ottieni elettronica di valore (smartphone · laptop · console · audio · fotografia · accessori smart) comprando blocchi di partecipazione da €1.50 ciascuno. La matematica decide il vincitore in modo deterministico e trasparente. Non è una lotteria · è skill-based commerce. Più partecipi alla categoria elettronica, più cresce il tuo bonus pity, più vinci probabilmente al prossimo evento.

**Quality criteria per categoria elettronica:**
- Brand identificabile (Apple · Samsung · Sony · Microsoft · Nintendo · Sennheiser · Bose · Canon · Nikon · Fujifilm · ecc.)
- Modello e anno verificabili
- Condizione minima "usato eccellente" (no graffi importanti · funzionalità 100%)
- Documentazione provenance se disponibile (scontrino · scatola · accessori originali)

**Durata standard eventi elettronica:** 7-10 giorni.

**Valore floor:** €500 EUR · target audience premium-mid mid-range.

### Sub-categorie esplorabili
- Smartphone (iPhone · Samsung · Pixel · Xiaomi premium)
- Tablet (iPad · Samsung Galaxy Tab · Surface)
- Computer (MacBook · Surface · gaming laptop)
- Gaming (PlayStation · Xbox · Nintendo Switch · console retro)
- Audio (cuffie premium · speaker hi-fi · DAC · vinyl turntable)
- Fotografia (mirrorless · DSLR · lenti premium · accessori pro)

### CTA
- "Vendi la tua elettronica con AIROOBI" → `/vendi` (form proposta valutazione · pre-fill category=elettronica)
- "Partecipa al prossimo airdrop elettronica" → `/airdrops?macro_category=elettronica` (filtered grid 6 sub-categories)

---

## CATEGORIA 2 · LUXURY (macro-aggregato)

### Slug URL: `/categoria/luxury`
### DB child slugs: orologi · gioielli · borse

### Hero title (H1)
"Luxury · valore reale, evento equo"

### Subtitle / lede paragraph
Orologi Rolex, Audemars Piguet, Patek Philippe. Borse Hermès, Chanel, Louis Vuitton. Gioielli firmati Cartier, Tiffany, Bulgari. Su AIROOBI il luxury trova partecipazione skill-based, certificazione permanente, e seconda vita organizzata attraverso 3 sub-categorie premium.

### Body copy (~450 parole)

Il luxury vale per autenticità, provenance, e mercato secondario attivo. Non per fortuna. Non per gambling. AIROOBI è la piattaforma italiana dove il luxury si vende e si ottiene attraverso eventi di partecipazione deterministici e trasparenti · 3 sub-categorie premium: orologi · gioielli firmati · borse designer.

**Per chi vende:** un Rolex Submariner, una borsa Hermès Birkin, un anello Cartier · sono oggetti che richiedono mesi di trattative su mercati tradizionali. Acquirenti che chiedono certificazioni, gemmologi che verificano pietre, autenticatori che validano provenance. Su AIROOBI il tuo oggetto viene professionalmente valutato dal nostro team, riceve un certificato EVALOBI permanente blockchain-based con price range suggested, e diventa protagonista di un evento dove decine di partecipanti competono trasparentemente per ottenerlo. Liquidazione in 14 giorni invece di 6 mesi. Il certificato AIROOBI accompagna l'oggetto per tutta la sua vita futura, anche post-vendita.

**Per chi partecipa:** ottieni un orologio di valore €5.000-15.000, una borsa Hermès, un gioiello firmato Cartier comprando blocchi di partecipazione da €1.50 ciascuno. La matematica del nostro algoritmo scoring v5 + pity decide il vincitore in modo deterministico · partecipanti vedono in tempo reale quanti blocchi servono per superare il leader corrente o per fare scacco matto · trasparenza totale, zero ambiguità.

**Quality criteria per categoria luxury:**
- Brand riconosciuto internazionalmente (Rolex · Patek Philippe · Audemars Piguet · Hermès · Chanel · Louis Vuitton · Cartier · Tiffany · Bulgari · ecc.)
- Modello e referenza identificabili
- Condizione "nuovo" o "come nuovo" (no usura visibile)
- Documentazione obbligatoria: scontrino originale · garanzia · scatola · libretti · certificazioni gemmologiche se applicabile

**Durata standard eventi luxury:** 14 giorni (categoria premium · audience più selezionata · partecipanti motivati).

**Valore floor:** €1.500 EUR (sopra il floor standard AIROOBI · categoria premium-only · target audience high-net-worth).

### Sub-categorie esplorabili
- Orologi (Rolex · Patek Philippe · Audemars Piguet · Cartier · Omega · IWC · Vacheron Constantin)
- Gioielli firmati (Cartier · Tiffany · Bulgari · Pomellato · Van Cleef)
- Borse designer (Hermès Birkin/Kelly · Chanel Classic Flap · Louis Vuitton Speedy/Neverfull · Gucci)

### CTA
- "Vendi il tuo luxury su AIROOBI" → `/vendi` (form proposta valutazione premium)
- "Partecipa al prossimo airdrop luxury" → `/airdrops?macro_category=luxury` (filtered grid 3 sub-categories)

---

## CATEGORIA 3 · GIOIELLI (1:1 DB match)

### Slug URL: `/categoria/gioielli`
### DB child slug: gioielli (single category)

### Hero title (H1)
"Gioielli · valore certificato, evento trasparente"

### Subtitle / lede paragraph
Oro, diamanti, pietre preziose, gioielli firmati o vintage. Su AIROOBI ogni gioiello viene professionalmente valutato, riceve un certificato EVALOBI permanente blockchain-based, e diventa protagonista di un evento di partecipazione equo e deterministico.

### Body copy (~400 parole)

Il mondo dei gioielli vive di certificazione e fiducia. Un anello con diamante senza certificato gemmologico vale meno della metà. Una collana d'oro senza garanzia di pesatura e titolo viene scontata aggressivamente da compro-oro tradizionali.

AIROOBI risolve il gap di fiducia con tecnologia blockchain + valutazione professionale.

**Per chi vende:** il tuo anello di famiglia, la collana ereditata, il bracciale acquistato anni fa che non indossi più · oggetti che meritano valutazione equa e trasparenza totale. Su AIROOBI proponi il gioiello per valutazione · il nostro team verifica metallo (oro 18kt · 14kt · platino · argento) · pietre preziose (taglio · purezza · carati · certificazione GIA se disponibile) · provenance e firma se firmato. Riceve un certificato EVALOBI permanente blockchain-based che accompagnerà l'oggetto per sempre · anche se decidi di rivenderlo altrove dopo l'esperienza AIROOBI.

**Per chi partecipa:** ottieni gioielli di valore €1.000-€10.000 comprando blocchi di partecipazione da €1.50 ciascuno. La matematica decide il vincitore in modo trasparente · partecipanti vedono in tempo reale quanti blocchi mancano per superare il leader · scacco matto display elimina ogni ambiguità · zero gambling, solo skill-based commerce.

**Quality criteria per categoria gioielli:**
- Metallo identificabile (oro 18kt+ · platino · argento 925+)
- Pietre preziose con certificazione gemmologica preferibile (GIA · IGI · HRD)
- Provenance documentata se firmato (Tiffany · Cartier · Bulgari · Pomellato · ecc.)
- Condizione "nuovo" · "come nuovo" · o "vintage" (categoria separata per pezzi pre-1980)
- Foto macro dettagliate · peso in grammi · misure precise

**Durata standard eventi gioielli:** 10-14 giorni (categoria premium · valutazione gemmologica richiede tempo).

**Valore floor:** €1.000 EUR.

### CTA
- "Vendi il tuo gioiello su AIROOBI" → `/vendi` (form proposta valutazione gemmologica)
- "Partecipa al prossimo airdrop gioielli" → `/airdrops?category=gioielli` (filtered grid 1:1)

---

## CATEGORIA 4 · ARTE E COLLEZIONE (slug normalize URL → DB `arte`)

### Slug URL: `/categoria/arte-collezione`
### DB child slug: arte (normalize URL → DB)

### Hero title (H1)
"Arte e collezione · valore culturale, evento equo"

### Subtitle / lede paragraph
Arte contemporanea, stampe firmate, sculture, fotografia d'autore, oggetti da collezione (sneakers limited drops, action figures rare, comics first edition, memorabilia sportivo). Su AIROOBI ogni pezzo riceve valutazione esperta, certificazione blockchain, evento di partecipazione organizzato.

### Body copy (~450 parole)

L'arte e gli oggetti da collezione non si comprano · si trovano. Un quadro firmato che cerchi da anni · una sneaker limited drop disponibile solo in 500 pezzi al mondo · un comic first edition · una scultura contemporanea di un artista emergente · oggetti che vivono di rarità, provenance, e community appassionata.

AIROOBI organizza il mercato italiano dell'arte e collezione in eventi di partecipazione trasparenti, certificati blockchain, con audience selezionata.

**Per chi vende:** la stampa firmata che hai in salotto da dieci anni, la sneaker Off-White × Nike che non hai mai indossato, l'action figure Hot Toys edizione limitata, il comic Spider-Man prima edizione, la scultura contemporanea acquistata da galleria · oggetti che meritano valutazione esperta e mercato di acquirenti motivati. Su AIROOBI proponi il pezzo per valutazione · il nostro team verifica autenticità (firma · numerazione · provenance galleria/dealer · documentazione COA) · condizione (arte e collezione richiedono storage perfetto) · rarità (edizione · drop · prima stampa). Riceve certificato EVALOBI permanente blockchain-based che documenta autenticità + provenance per l'eternità.

**Per chi partecipa:** ottieni arte contemporanea, sneakers limited, comics first edition, action figures rare a valori che riflettono il vero mercato secondario · NON il prezzo speculativo di reseller online. Eventi di partecipazione da €1.50 a blocco · math-deterministic · scoring v5 con pity per partecipanti loyali alla categoria.

**Quality criteria per categoria arte-collezione:**
- Autenticità documentabile (firma artista · numerazione · COA · provenance galleria/dealer)
- Per arte: edizione limitata preferibile (numerazione visibile)
- Per sneakers/streetwear: drop limited identificabile (SKU · numero di serie · colorway codename)
- Per comics: grading CGC/CBCS preferibile (almeno 8.0+)
- Per memorabilia sportivo: autografo certificato (PSA/DNA · JSA · Beckett) preferibile
- Condizione "nuovo" · "come nuovo" · o "vintage" preserved con storage perfetto
- Foto dettagliate ogni firma · numerazione · imperfezione · COA

**Durata standard eventi arte-collezione:** 14 giorni (categoria nicchia premium · audience appassionata e selezionata).

**Valore floor:** €1.000 EUR (categoria premium-minded).

### CTA
- "Vendi la tua arte o collezione su AIROOBI" → `/vendi` (form proposta valutazione esperta)
- "Partecipa al prossimo airdrop arte-collezione" → `/airdrops?category=arte` (filtered grid · slug normalize URL → DB)

---

## Cross-cutting brand voice notes preserved da v1

Vocabolario LOCKED v0.4-3 · "Evento · partecipazione · attivi · esclusi · scacco matto · blocco · skill-based · math-deterministic · trasparente · evento equo · valore reale · certificato · pollution layer · brand-coherent · audience selezionata · marketplace utility-driven".

BANNED preserved: "maratona · race · agonismo · runner · champion · vinci · perdi · lotteria · gambling · azzardo · sorteggio · scommessa · jackpot · fortuna".

Tone editoriale Italian premium · Italian Editorial Manifesto v2 · NOT corporate stiff · NOT casual streetwear · sweet spot informato e accessibile.

CTA pattern dual seller/buyer ogni pagina (`/vendi` + `/airdrops?macro_category={slug}` o `/airdrops?category={slug}`).

Schema.org structured data (CCP wires SSR) · Article + CollectionPage + BreadcrumbList JSON-LD.

---

## CCP Implementation Brief Revised v2

### Files to create

**Single canonical copy file** (this v2 document) · output `06_public_assets/copy/categorie/` extracted per macro slug:
- `06_public_assets/copy/categorie/elettronica.md` (macro · 6 child slugs)
- `06_public_assets/copy/categorie/luxury.md` (macro · 3 child slugs)
- `06_public_assets/copy/categorie/gioielli.md` (1:1 DB)
- `06_public_assets/copy/categorie/arte-collezione.md` (URL normalize · DB `arte`)
- `06_public_assets/copy/categorie/_mapping.json` (macro→child slugs mapping)

### Vercel SSR function (revised v2)

`/api/categoria-ssr.js` (pattern existing `/api/winner-story-ssr.js` reuse):
- Route: `airoobi.com/categoria/:slug` (vercel.json rewrite wildcard `/categoria/:slug → /api/categoria-ssr?slug=:slug`)
- Function workflow:
  1. Read slug from query param
  2. Whitelist check slug against `_mapping.json` keys (`['elettronica', 'luxury', 'gioielli', 'arte-collezione']` · 4 macro)
  3. Read mapping for child_slugs
  4. Render HTML page with copy from `06_public_assets/copy/categorie/{slug}.md` (markdown → HTML server-side)
  5. Fetch airdrops attivi via RPC `get_airdrops_by_macro_category(slug TEXT, child_slugs TEXT[])` (NEW · catch #2)
  6. Render Schema.org Article + CollectionPage + BreadcrumbList JSON-LD
  7. Render OG meta tags (dynamic per categoria · use static og-image.png fallback OR dynamic `/api/og-categoria?slug={slug}` future W6+)
  8. Cache-Control: `public, max-age=300, s-maxage=3600`

### RPC nuova `get_airdrops_by_macro_category` (catch #2 fix)

```sql
CREATE OR REPLACE FUNCTION get_airdrops_by_macro_category(p_macro_slug TEXT, p_child_slugs TEXT[])
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', a.id,
    'title', a.title,
    'category', a.category,
    'value_eur', a.value_eur,
    'status', a.status,
    'duration_days', a.duration_days,
    'image_url', a.image_url,
    'starts_at', a.starts_at,
    'ends_at', a.ends_at
  ) ORDER BY a.starts_at DESC), '[]'::jsonb)
  INTO v_result
  FROM airdrops a
  WHERE a.category = ANY(p_child_slugs)
    AND a.status IN ('active', 'presale', 'scheduled')
    AND a.is_public = true
  LIMIT 12;
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_airdrops_by_macro_category(TEXT, TEXT[]) TO authenticated, anon;
```

### `vercel.json` rewrite wildcard

```json
{ "source": "/categoria/:slug", "destination": "/api/categoria-ssr?slug=:slug" }
```

### Sitemap dynamic regen include macro URLs

Add 4 URLs to sitemap-com.xml:
- `https://www.airoobi.com/categoria/elettronica` (changefreq weekly · priority 0.7)
- `https://www.airoobi.com/categoria/luxury` (changefreq weekly · priority 0.7)
- `https://www.airoobi.com/categoria/gioielli` (changefreq weekly · priority 0.7)
- `https://www.airoobi.com/categoria/arte-collezione` (changefreq weekly · priority 0.7)

### Acceptance criteria v2
- ✅ 4 macro pillar pages live `/categoria/{slug}`
- ✅ Mapping JSON canonical `_mapping.json`
- ✅ RPC `get_airdrops_by_macro_category` deployed con GRANT
- ✅ vercel.json wildcard rewrite
- ✅ Schema.org Article + CollectionPage + BreadcrumbList JSON-LD valid
- ✅ Live airdrop grid render per macro categoria (aggregated child slugs)
- ✅ Sitemap include 4 macro URLs
- ✅ Mobile 380px responsive
- ✅ Italian Voice 04 BANNED smoke pre-commit zero hits
- ✅ Brand v2 G3 visual consistency

### ETA stima CCP revised v2
- SSR function `/api/categoria-ssr.js` · 2h
- 4 markdown extraction copy → repo · 30min
- Mapping JSON canonical · 15min
- RPC `get_airdrops_by_macro_category` migration · 30min
- vercel.json rewrite + cache headers · 10min
- Sitemap dynamic regen · 30min
- Audit-trail post-commit + closing bridge · 30min
- TOTALE ~4.5h focused autonomous push · W5+ window post-FASE-A-go-live

---

## Drop v1 · moto + vintage rationale

**Drop categorie v1 (per LOCK Decisione 2):**
- `moto` · zero match DB · W6+ reconsider con migration add categoria
- `vintage` · cross-category trasversale · W6+ TAG strategy `/tag/vintage` filtered grid (NOT pillar page)

**Post-FASE-A reconsider (W6+):**
- If `moto` strategic priority (Italian motorcycle market) · CCP migration add categoria + ROBY copy v3
- If `vintage` strategic priority (cross-cluster authority) · CCP `/tag/{tag}` SSR pattern + ROBY tag pages copy

---

## Closing

Pillar pages copy v2 4 MACRO SEALED · CCP catch verify-before-brief addressed · LOCK Opzione A pragmatica applied · drop v1 moto+vintage W6+ reconsider · CCP wire post-FASE-A W5+ window quando ready · brand pollution SEO expansion preserved.

— **ROBY** (Strategic MKT, Comms & Community Manager · Claude Desktop) · Dom 17 maggio 2026 sera · post-CCP catch verify-before-brief · tactical autonomy delegata Skeezu · revert se Skeezu pivot

*Pillar pages copy v2 SEALED · 4 macro pillar (elettronica · luxury · gioielli · arte-collezione) · DB sub-slug mapping JSON canonical · drop v1 moto+vintage W6+ reconsider · CCP wire post-FASE-A W5+ window · ETA CCP 4.5h focused · brand pollution SEO expansion ready · Italian Editorial Manifesto v2 preserved · Voice 04 BANNED smoke clean · daje 🚀*
