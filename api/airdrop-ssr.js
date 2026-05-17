// AIROOBI airdrop public SSR · Area 8 SEO quick win
// Vercel Serverless Function · /airdrops/:id (SEO-friendly · OG tags · Schema.org Event/Product)
// Route: /airdrops/:id → /api/airdrop-ssr?id=:id (vercel.json rewrite host-aware airoobi.app)

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vuvlmlpuhovipfwtquux.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';

const UUID_RE = /^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/;

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function statusLabel(status) {
  switch (status) {
    case 'active': return { label: 'Live ora', color: '#49EACB' };
    case 'in_valutazione': return { label: 'In valutazione', color: '#B8960C' };
    case 'accettato': return { label: 'In partenza', color: '#4A9EFF' };
    case 'presale': return { label: 'Presale aperta', color: '#B8960C' };
    case 'completed':
    case 'settled': return { label: 'Concluso', color: '#8b8b8b' };
    case 'closed': return { label: 'Chiuso', color: '#8b8b8b' };
    default: return { label: status || '', color: '#8b8b8b' };
  }
}

function renderHtml(data) {
  const st = statusLabel(data.status);
  const sold = Number(data.blocks_sold) || 0;
  const total = Number(data.total_blocks) || 1;
  const progress = Math.min(100, Math.round((sold / total) * 100));
  const value = data.object_value_eur ? `€${Number(data.object_value_eur).toLocaleString('it-IT')}` : null;
  const blockPrice = data.block_price_aria ? `${data.block_price_aria} ARIA` : null;
  const productBrand = data.product_info?.brand || '';
  const productModel = data.product_info?.model || '';
  const image = data.image_url || 'https://www.airoobi.app/og-image.png?v=4.20.0';
  const title = `${escapeHtml(data.title)}${productBrand ? ' · ' + escapeHtml(productBrand) : ''} · AIROOBI Airdrop`;
  const description = `${escapeHtml(data.title)}${value ? ' · valore stimato ' + value : ''}${blockPrice ? ' · blocco a ' + blockPrice : ''} · ${escapeHtml(data.description || '').slice(0, 140)}`;
  const canonical = `https://www.airoobi.app/airdrops/${data.id}`;

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.title,
    description: data.description,
    image: data.image_url,
    brand: productBrand ? { '@type': 'Brand', name: productBrand } : undefined,
    category: data.category,
    offers: data.object_value_eur ? {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: data.object_value_eur,
      availability: data.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: canonical
    } : undefined
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

  <meta property="og:type" content="product">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:locale" content="it_IT">
  <meta property="og:site_name" content="AIROOBI">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${escapeHtml(image)}">

  <script type="application/ld+json">${JSON.stringify(schemaOrg)}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

  <style>
    :root {
      --black: #000000; --gold: #B8960C; --white: #FFFFFF;
      --gray-900: #0a0a0a; --gray-800: #1a1a1a; --gray-700: #2a2a2a;
      --gray-500: #8b8b8b; --gray-300: #d4d4d4;
      --status: ${st.color};
      --font-h: 'Cormorant Garamond', serif;
      --font-b: 'Instrument Sans', sans-serif;
      --font-m: 'DM Mono', monospace;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: var(--black); color: var(--white); font-family: var(--font-b); line-height: 1.6; -webkit-font-smoothing: antialiased; }
    body { min-height: 100vh; display: flex; flex-direction: column; }
    .container { max-width: 900px; margin: 0 auto; padding: 24px 20px; width: 100%; }

    header.brand { padding: 28px 0; border-bottom: 1px solid var(--gray-700); display: flex; justify-content: space-between; align-items: center; }
    header.brand .logo { font-family: var(--font-h); font-size: 28px; font-weight: 700; letter-spacing: 4px; color: var(--gold); text-decoration: none; }
    header.brand .tag { font-family: var(--font-m); font-size: 11px; letter-spacing: 2px; color: var(--gray-500); text-transform: uppercase; }

    .status-badge { display: inline-flex; padding: 6px 14px; background: rgba(255,255,255,0.04); border-left: 3px solid var(--status); font-family: var(--font-m); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--status); margin: 32px 0 12px; }
    h1.title { font-family: var(--font-h); font-size: 48px; font-weight: 500; line-height: 1.1; margin-bottom: 8px; }
    .category { font-family: var(--font-m); font-size: 12px; letter-spacing: 2px; color: var(--gray-500); text-transform: uppercase; margin-bottom: 24px; }

    .hero-image { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; margin-bottom: 24px; background: var(--gray-800); }

    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1px; background: var(--gray-700); border: 1px solid var(--gray-700); border-radius: 8px; overflow: hidden; margin-bottom: 32px; }
    .metric { background: var(--gray-900); padding: 20px 24px; }
    .metric .label { font-family: var(--font-m); font-size: 10px; letter-spacing: 1.5px; color: var(--gray-500); text-transform: uppercase; margin-bottom: 8px; }
    .metric .value { font-family: var(--font-h); font-size: 28px; color: var(--white); font-weight: 500; }
    .metric .value.gold { color: var(--gold); }

    .progress-section { padding: 24px; background: var(--gray-900); border-radius: 8px; margin-bottom: 32px; }
    .progress-label { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
    .progress-label .l { font-family: var(--font-m); font-size: 11px; letter-spacing: 1.5px; color: var(--gray-500); text-transform: uppercase; }
    .progress-label .r { font-family: var(--font-m); font-size: 14px; color: var(--gold); }
    .progress-bar { height: 8px; background: var(--gray-800); border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--gold); width: ${progress}%; }

    .description { color: var(--gray-300); margin: 24px 0; font-size: 16px; line-height: 1.7; }

    .cta-section { padding: 40px 0; text-align: center; margin-top: 32px; border-top: 1px solid var(--gray-700); }
    .cta-section h2 { font-family: var(--font-h); font-size: 28px; color: var(--gold); margin-bottom: 12px; font-weight: 500; }
    .cta-section p { color: var(--gray-300); margin-bottom: 24px; max-width: 480px; margin-left: auto; margin-right: auto; }
    .cta-btn { display: inline-block; background: var(--gold); color: var(--black); padding: 14px 36px; text-decoration: none; font-family: var(--font-m); font-size: 13px; letter-spacing: 2px; text-transform: uppercase; border-radius: 2px; font-weight: 600; margin: 0 6px; }
    .cta-btn.outline { background: transparent; color: var(--gold); border: 1.5px solid var(--gold); }

    footer { padding: 24px 0; text-align: center; border-top: 1px solid var(--gray-700); margin-top: auto; font-family: var(--font-m); font-size: 11px; letter-spacing: 1.5px; color: var(--gray-500); }
    footer a { color: var(--gold); text-decoration: none; }

    @media (max-width: 600px) {
      h1.title { font-size: 32px; }
      .metric .value { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="brand">
      <a class="logo" href="/">AIROOBI</a>
      <span class="tag">Airdrop · Marketplace</span>
    </header>

    <div class="status-badge">${st.label}</div>
    <h1 class="title">${escapeHtml(data.title)}</h1>
    <p class="category">${escapeHtml(data.category)}${productBrand ? ' · ' + escapeHtml(productBrand) : ''}${productModel ? ' ' + escapeHtml(productModel) : ''}</p>

    ${data.image_url ? `<img class="hero-image" src="${escapeHtml(data.image_url)}" alt="${escapeHtml(data.title)}">` : ''}

    <div class="metrics">
      ${value ? `<div class="metric"><div class="label">Valore stimato</div><div class="value gold">${value}</div></div>` : ''}
      ${blockPrice ? `<div class="metric"><div class="label">Costo blocco</div><div class="value">${blockPrice}</div></div>` : ''}
      <div class="metric"><div class="label">Blocchi totali</div><div class="value">${total}</div></div>
      <div class="metric"><div class="label">Blocchi venduti</div><div class="value">${sold}</div></div>
    </div>

    <div class="progress-section">
      <div class="progress-label">
        <span class="l">Avanzamento airdrop</span>
        <span class="r">${progress}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill"></div></div>
    </div>

    ${data.description ? `<div class="description">${escapeHtml(data.description)}</div>` : ''}

    <section class="cta-section">
      <h2>Partecipa all'airdrop</h2>
      <p>Acquista uno o più blocchi · partecipa al draw equo · ottieni l'oggetto a una frazione del valore.</p>
      <a class="cta-btn" href="/signup">Inizia ora</a>
      <a class="cta-btn outline" href="/come-funziona-airdrop">Come funziona</a>
    </section>
  </div>

  <footer>
    AIROOBI &copy; 2026 · <a href="https://www.airoobi.com">airoobi.com</a> · <a href="https://www.airoobi.app">airoobi.app</a>
  </footer>
</body>
</html>`;
}

function render404(id) {
  return `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>Airdrop non trovato · AIROOBI</title><style>body{background:#000;color:#fff;font-family:sans-serif;padding:40px;text-align:center}h1{color:#B8960C}a{color:#B8960C}</style></head><body><h1>Airdrop non trovato</h1><p>L'airdrop richiesto non esiste o non è pubblicamente visibile.</p><p><a href="https://www.airoobi.app/airdrops">Vedi tutti gli airdrop</a></p></body></html>`;
}

export default async function handler(req, res) {
  const idRaw = req.query?.id || (req.url && req.url.match(/\/airdrops\/([a-f0-9-]+)/i)?.[1]);

  if (!idRaw || !UUID_RE.test(idRaw)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.status(400).send(render404(idRaw));
    return;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_airdrop_public`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ p_airdrop_id: idRaw })
    });

    if (!response.ok) {
      console.error('Airdrop SSR RPC error', response.status, await response.text());
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.status(502).send(render404(idRaw));
      return;
    }

    const rows = await response.json();
    const data = Array.isArray(rows) ? rows[0] : rows;

    if (!data || !data.id) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.status(404).send(render404(idRaw));
      return;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=3600');
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.status(200).send(renderHtml(data));
  } catch (err) {
    console.error('Airdrop SSR handler error', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(render404(idRaw));
  }
}
