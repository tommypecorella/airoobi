// AIROOBI EVALOBI public SSR · Area 6 pollution layer
// Vercel Serverless Function (Node runtime)
// Route: /evalobi/:token_id (via vercel.json rewrite to /api/evalobi-ssr?token_id=:token_id)
// Decision #17 LOCKED: Vercel SSR (NOT Cloudflare Worker)

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vuvlmlpuhovipfwtquux.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTUyMjEsImV4cCI6MjA1NjY5MTIyMX0.7Hd6JsB4PfcoIaSepW0DkmpzlxFhcz4eMpqo4lr8KX0';

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatPriceRange(pr) {
  if (!pr || typeof pr !== 'object') return null;
  const min = pr.min_eur;
  const max = pr.max_eur;
  const suggested = pr.suggested_eur;
  if (suggested) return `€${suggested}`;
  if (min && max) return `€${min} – €${max}`;
  if (min) return `da €${min}`;
  if (max) return `fino a €${max}`;
  return null;
}

function outcomeLabel(outcome) {
  switch (outcome) {
    case 'GO': return { label: 'Approvato', color: '#4CAF50', desc: 'Oggetto idoneo al marketplace AIROOBI' };
    case 'NO_GO': return { label: 'Non idoneo', color: '#E57373', desc: 'Oggetto non ha superato i criteri di qualità AIROOBI · resta certificato di valutazione' };
    case 'NEEDS_REVIEW': return { label: 'Da rivedere', color: '#FFB74D', desc: 'Servono informazioni aggiuntive per finalizzare la valutazione' };
    default: return { label: outcome, color: '#9E9E9E', desc: '' };
  }
}

function renderHtml(data) {
  const outcome = outcomeLabel(data.evaluation_outcome);
  const priceRange = formatPriceRange(data.evaluation_price_range);
  const photos = Array.isArray(data.object_photo_hashes) ? data.object_photo_hashes : [];
  const firstPhoto = photos.length > 0 ? photos[0] : null;
  const evaluatedDate = data.evaluated_at ? new Date(data.evaluated_at).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const title = `EVALOBI #${data.token_id} · ${escapeHtml(data.object_brand)} ${escapeHtml(data.object_model)} · AIROOBI`;
  const description = `Certificato di valutazione AIROOBI per ${escapeHtml(data.object_title)} · esito ${outcome.label}${priceRange ? ' · ' + priceRange : ''}. Pollution layer: allegabile come prova di valutazione su Subito, Vinted, eBay.`;
  const ogImage = data.public_image_url || `https://www.airoobi.com/og-image.png?v=4.13.5`;
  const canonical = `https://www.airoobi.com/evalobi/${data.token_id}`;

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${data.object_brand} ${data.object_model}`,
    description: data.object_title,
    brand: { '@type': 'Brand', name: data.object_brand },
    model: data.object_model,
    productionDate: data.object_year ? String(data.object_year) : undefined,
    itemCondition: data.object_condition === 'nuovo' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
    offers: priceRange && data.evaluation_outcome === 'GO' ? {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: data.evaluation_price_range?.min_eur,
      highPrice: data.evaluation_price_range?.max_eur,
      availability: 'https://schema.org/InStock'
    } : undefined,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'AIROOBI Token ID', value: String(data.token_id) },
      { '@type': 'PropertyValue', name: 'Evaluation Outcome', value: data.evaluation_outcome },
      { '@type': 'PropertyValue', name: 'Evaluated At', value: data.evaluated_at }
    ].filter(p => p.value)
  };

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">

  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:locale" content="it_IT">
  <meta property="og:site_name" content="AIROOBI">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">

  <script type="application/ld+json">${JSON.stringify(schemaOrg)}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

  <style>
    :root {
      --black: #000000; --gold: #B8960C; --white: #FFFFFF;
      --gray-900: #0a0a0a; --gray-800: #1a1a1a; --gray-700: #2a2a2a;
      --gray-500: #8b8b8b; --gray-300: #d4d4d4;
      --outcome: ${outcome.color};
      --font-h: 'Cormorant Garamond', serif;
      --font-b: 'Instrument Sans', sans-serif;
      --font-m: 'DM Mono', monospace;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: var(--black); color: var(--white); font-family: var(--font-b); line-height: 1.5; }
    body { min-height: 100vh; display: flex; flex-direction: column; }
    .container { max-width: 880px; margin: 0 auto; padding: 24px 20px; width: 100%; }
    header.brand { padding: 32px 0 24px; border-bottom: 1px solid var(--gray-700); margin-bottom: 32px; }
    header.brand .logo { font-family: var(--font-h); font-size: 32px; font-weight: 700; letter-spacing: 4px; color: var(--gold); text-decoration: none; }
    header.brand .tag { display: block; font-family: var(--font-m); font-size: 11px; letter-spacing: 2px; color: var(--gray-500); margin-top: 4px; text-transform: uppercase; }
    .token-id { font-family: var(--font-m); font-size: 14px; color: var(--gray-500); margin-bottom: 8px; letter-spacing: 1px; }
    h1.title { font-family: var(--font-h); font-size: 48px; font-weight: 500; line-height: 1.1; margin-bottom: 16px; color: var(--white); }
    .brand-model { font-family: var(--font-b); font-size: 18px; color: var(--gray-300); margin-bottom: 32px; font-weight: 500; }
    .outcome-badge { display: inline-flex; align-items: center; gap: 12px; padding: 12px 20px; background: rgba(255,255,255,0.04); border-left: 4px solid var(--outcome); border-radius: 4px; margin-bottom: 24px; }
    .outcome-badge .label { font-family: var(--font-m); font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--outcome); font-weight: 600; }
    .outcome-desc { font-size: 15px; color: var(--gray-300); margin-bottom: 32px; font-style: italic; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1px; background: var(--gray-700); border: 1px solid var(--gray-700); margin-bottom: 32px; }
    .detail { background: var(--gray-900); padding: 16px 20px; }
    .detail dt { font-family: var(--font-m); font-size: 11px; letter-spacing: 1.5px; color: var(--gray-500); text-transform: uppercase; margin-bottom: 6px; }
    .detail dd { font-family: var(--font-b); font-size: 16px; color: var(--white); font-weight: 500; }
    .price-range { font-family: var(--font-h); font-size: 28px; color: var(--gold); font-weight: 500; }
    .photos { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 32px; }
    .photos img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; background: var(--gray-800); ${data.photo_blur_enabled ? 'filter: blur(8px);' : ''} }
    .reasoning { background: var(--gray-900); padding: 24px; border-left: 2px solid var(--gold); margin-bottom: 32px; font-size: 15px; color: var(--gray-300); }
    .reasoning .label { font-family: var(--font-m); font-size: 11px; letter-spacing: 1.5px; color: var(--gray-500); text-transform: uppercase; margin-bottom: 12px; }
    .meta-row { display: flex; justify-content: space-between; gap: 16px; font-family: var(--font-m); font-size: 12px; color: var(--gray-500); letter-spacing: 1px; padding: 16px 0; border-top: 1px solid var(--gray-700); border-bottom: 1px solid var(--gray-700); margin-bottom: 32px; }
    .cta-section { padding: 32px 0; text-align: center; margin-top: auto; }
    .cta-section h2 { font-family: var(--font-h); font-size: 28px; color: var(--gold); margin-bottom: 12px; font-weight: 500; }
    .cta-section p { color: var(--gray-300); margin-bottom: 24px; max-width: 480px; margin-left: auto; margin-right: auto; }
    .cta-btn { display: inline-block; background: var(--gold); color: var(--black); padding: 14px 32px; text-decoration: none; font-family: var(--font-m); font-size: 13px; letter-spacing: 2px; text-transform: uppercase; border-radius: 2px; font-weight: 600; transition: opacity .15s; }
    .cta-btn:hover { opacity: 0.85; }
    footer { padding: 24px 0; text-align: center; border-top: 1px solid var(--gray-700); margin-top: 40px; font-family: var(--font-m); font-size: 11px; letter-spacing: 1.5px; color: var(--gray-500); }
    footer a { color: var(--gold); text-decoration: none; }
    @media (max-width: 600px) {
      h1.title { font-size: 32px; }
      .price-range { font-size: 22px; }
      .cta-section h2 { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="brand">
      <a class="logo" href="https://www.airoobi.com">AIROOBI</a>
      <span class="tag">Certificato di valutazione · pollution layer</span>
    </header>

    <div class="token-id">EVALOBI #${data.token_id}${data.version > 1 ? ` · v${data.version}` : ''}</div>
    <h1 class="title">${escapeHtml(data.object_title)}</h1>
    <p class="brand-model">${escapeHtml(data.object_brand)} · ${escapeHtml(data.object_model)}${data.object_year ? ' · ' + data.object_year : ''}</p>

    <div class="outcome-badge">
      <span class="label">${outcome.label}</span>
    </div>
    <p class="outcome-desc">${outcome.desc}</p>

    <dl class="detail-grid">
      <div class="detail">
        <dt>Categoria</dt>
        <dd>${escapeHtml(data.object_category)}</dd>
      </div>
      <div class="detail">
        <dt>Condizione</dt>
        <dd>${escapeHtml(data.object_condition.replace(/_/g, ' '))}</dd>
      </div>
      ${data.object_year ? `<div class="detail"><dt>Anno</dt><dd>${data.object_year}</dd></div>` : ''}
      ${priceRange ? `<div class="detail"><dt>Valutazione AIROOBI</dt><dd class="price-range">${priceRange}</dd></div>` : ''}
    </dl>

    ${photos.length > 0 ? `
    <div class="photos">
      ${photos.map(h => `<img src="${escapeHtml(h.url || h)}" alt="${escapeHtml(data.object_title)}" loading="lazy">`).join('')}
    </div>` : ''}

    ${data.evaluation_reasoning ? `
    <div class="reasoning">
      <div class="label">Note valutazione</div>
      <p>${escapeHtml(data.evaluation_reasoning)}</p>
    </div>` : ''}

    <div class="meta-row">
      <span>Valutato il ${evaluatedDate}</span>
      <span>Token #${data.token_id}</span>
    </div>

    <div class="cta-section">
      <h2>Scopri AIROOBI</h2>
      <p>Marketplace airdrop decentralizzato su Kaspa. Vendi oggetti di valore a prezzo di mercato garantito · realizza il tuo desiderio partecipando ad airdrop.</p>
      <a class="cta-btn" href="https://www.airoobi.com">Visita airoobi.com</a>
    </div>
  </div>

  <footer>
    AIROOBI &copy; 2026 · <a href="https://www.airoobi.com">airoobi.com</a> · <a href="https://www.airoobi.app">airoobi.app</a><br>
    Certificato verificabile · alfa-2026.05.13-4.13.5
  </footer>
</body>
</html>`;
}

function render404(tokenId) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>EVALOBI non trovato · AIROOBI</title>
<style>body{background:#000;color:#fff;font-family:sans-serif;padding:40px;text-align:center}h1{color:#B8960C;font-size:24px;margin-bottom:16px}a{color:#B8960C}</style>
</head>
<body>
<h1>EVALOBI #${escapeHtml(String(tokenId))} non trovato</h1>
<p>Il certificato richiesto non esiste o non è pubblicamente visibile.</p>
<p><a href="https://www.airoobi.com">Torna ad AIROOBI</a></p>
</body>
</html>`;
}

export default async function handler(req, res) {
  const tokenIdRaw = req.query?.token_id || (req.url && req.url.match(/\/evalobi\/(\d+)/)?.[1]);
  const tokenId = tokenIdRaw ? parseInt(tokenIdRaw, 10) : NaN;

  if (!Number.isInteger(tokenId) || tokenId <= 0) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.status(400).send(render404(tokenIdRaw || 'invalid'));
    return;
  }

  try {
    const apiUrl = `${SUPABASE_URL}/rest/v1/rpc/get_evalobi_public`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ p_token_id: tokenId })
    });

    if (!response.ok) {
      console.error('Supabase RPC error', response.status, await response.text());
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=30');
      res.status(502).send(render404(tokenId));
      return;
    }

    const rows = await response.json();
    const data = Array.isArray(rows) ? rows[0] : rows;

    if (!data || !data.evalobi_id) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.status(404).send(render404(tokenId));
      return;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.status(200).send(renderHtml(data));
  } catch (err) {
    console.error('Vercel SSR handler error', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).send(render404(tokenId));
  }
}
