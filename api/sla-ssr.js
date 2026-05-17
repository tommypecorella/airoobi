// AIROOBI SLA public dashboard SSR · Area 7
// Vercel Serverless Function · /sla on airoobi.com (or any host)
// Route: /sla → /api/sla-ssr (vercel.json rewrite)

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vuvlmlpuhovipfwtquux.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';

function fmt(n, decimals = 1) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '0';
  return num.toFixed(decimals);
}

function renderHtml(m) {
  const total = Number(m.total_evaluated_30d) || 0;
  const pct48 = fmt(m.pct_under_48h, 1);
  const pct24 = fmt(m.pct_under_24h, 1);
  const avgH = fmt(m.avg_response_hours, 1);
  const medH = fmt(m.median_response_hours, 1);
  const buckets = [
    { label: '0-12h', count: Number(m.bucket_0_12h) || 0, color: '#49EACB' },
    { label: '12-24h', count: Number(m.bucket_12_24h) || 0, color: '#4A9EFF' },
    { label: '24-36h', count: Number(m.bucket_24_36h) || 0, color: '#B8960C' },
    { label: '36-48h', count: Number(m.bucket_36_48h) || 0, color: '#E2A93E' },
    { label: 'oltre 48h', count: Number(m.bucket_over_48h) || 0, color: '#E57373' }
  ];
  const maxBucket = Math.max(1, ...buckets.map(b => b.count));
  const refreshedAt = m.refreshed_at ? new Date(m.refreshed_at).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : 'mai';
  const today = Number(m.evaluated_today) || 0;
  const queue = Number(m.in_queue_now) || 0;

  const title = 'SLA Trasparenza · AIROOBI';
  const description = total > 0
    ? `Negli ultimi 30 giorni: ${pct48}% delle valutazioni completate entro 48h · tempo medio ${avgH}h · ${total} oggetti valutati.`
    : 'Dashboard pubblico SLA AIROOBI · trasparenza sui tempi di valutazione · live data.';

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.airoobi.com/sla">

  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.airoobi.com/sla">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="https://www.airoobi.com/og-image.png?v=4.20.0">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

  <style>
    :root {
      --black: #000000; --gold: #B8960C; --white: #FFFFFF;
      --gray-900: #0a0a0a; --gray-800: #1a1a1a; --gray-700: #2a2a2a;
      --gray-500: #8b8b8b; --gray-300: #d4d4d4;
      --aria: #4A9EFF; --kas: #49EACB; --warn: #E57373;
      --font-h: 'Cormorant Garamond', serif;
      --font-b: 'Instrument Sans', sans-serif;
      --font-m: 'DM Mono', monospace;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: var(--black); color: var(--white); font-family: var(--font-b); line-height: 1.6; -webkit-font-smoothing: antialiased; }
    body { min-height: 100vh; display: flex; flex-direction: column; }
    .container { max-width: 1080px; margin: 0 auto; padding: 24px 20px; width: 100%; }
    header.brand { padding: 28px 0; border-bottom: 1px solid var(--gray-700); display: flex; justify-content: space-between; align-items: center; }
    header.brand .logo { font-family: var(--font-h); font-size: 28px; font-weight: 700; letter-spacing: 4px; color: var(--gold); text-decoration: none; }
    header.brand .tag { font-family: var(--font-m); font-size: 11px; letter-spacing: 2px; color: var(--gray-500); text-transform: uppercase; }

    .hero { padding: 56px 0 32px; text-align: center; }
    .hero .eyebrow { font-family: var(--font-m); font-size: 12px; letter-spacing: 3px; color: var(--gray-500); text-transform: uppercase; margin-bottom: 16px; }
    .hero h1 { font-family: var(--font-h); font-size: 56px; font-weight: 500; line-height: 1.1; margin-bottom: 16px; }
    .hero .sub { font-size: 17px; color: var(--gray-300); max-width: 640px; margin: 0 auto; }

    .hero-metric { padding: 48px 0; text-align: center; background: var(--gray-900); border: 1px solid var(--gray-700); border-radius: 8px; margin: 32px 0; }
    .hero-metric .label { font-family: var(--font-m); font-size: 12px; letter-spacing: 3px; color: var(--gray-500); text-transform: uppercase; margin-bottom: 8px; }
    .hero-metric .number { font-family: var(--font-h); font-size: 96px; color: var(--gold); font-weight: 500; line-height: 1; }
    .hero-metric .ctx { color: var(--gray-300); margin-top: 16px; }

    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin: 32px 0; }
    .metric { background: var(--gray-900); border: 1px solid var(--gray-700); border-radius: 8px; padding: 24px; text-align: center; }
    .metric .label { font-family: var(--font-m); font-size: 10px; letter-spacing: 2px; color: var(--gray-500); text-transform: uppercase; margin-bottom: 8px; }
    .metric .value { font-family: var(--font-h); font-size: 40px; font-weight: 500; color: var(--white); }
    .metric .unit { font-size: 16px; color: var(--gray-300); margin-left: 4px; }

    .distribution { padding: 40px 0; }
    .distribution h2 { font-family: var(--font-h); font-size: 28px; font-weight: 500; margin-bottom: 24px; }
    .chart { display: flex; gap: 12px; align-items: flex-end; height: 240px; padding: 16px 0; border-bottom: 1px solid var(--gray-700); }
    .bar { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
    .bar .fill { width: 100%; min-height: 4px; border-radius: 4px 4px 0 0; transition: height .3s; }
    .bar .label { font-family: var(--font-m); font-size: 10px; letter-spacing: 1px; color: var(--gray-500); margin-top: 8px; text-transform: uppercase; }
    .bar .count { font-family: var(--font-m); font-size: 11px; color: var(--white); margin-top: 4px; }

    .live-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 24px; background: var(--gray-900); border-radius: 8px; margin: 32px 0; }
    .live-item { text-align: center; }
    .live-item .live-label { font-family: var(--font-m); font-size: 10px; letter-spacing: 1.5px; color: var(--gray-500); text-transform: uppercase; margin-bottom: 4px; }
    .live-item .live-value { font-family: var(--font-h); font-size: 28px; color: var(--gold); }

    .trust { padding: 48px 0; text-align: center; }
    .trust blockquote { font-family: var(--font-h); font-size: 24px; font-style: italic; color: var(--gold); max-width: 720px; margin: 0 auto; line-height: 1.4; }
    .trust .cite { font-family: var(--font-m); font-size: 11px; letter-spacing: 2px; color: var(--gray-500); margin-top: 16px; text-transform: uppercase; }

    .empty-state { padding: 64px 24px; text-align: center; color: var(--gray-300); background: var(--gray-900); border-radius: 8px; margin: 32px 0; border: 1px dashed var(--gray-700); }
    .empty-state h3 { font-family: var(--font-h); font-size: 24px; color: var(--gold); margin-bottom: 8px; }

    footer { padding: 32px 0; text-align: center; border-top: 1px solid var(--gray-700); font-family: var(--font-m); font-size: 11px; letter-spacing: 1.5px; color: var(--gray-500); margin-top: auto; }
    footer a { color: var(--gold); text-decoration: none; }
    footer .meta { display: block; margin-top: 8px; color: var(--gray-700); }

    @media (max-width: 600px) {
      .hero h1 { font-size: 36px; }
      .hero-metric .number { font-size: 64px; }
      .metric .value { font-size: 28px; }
      .trust blockquote { font-size: 18px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="brand">
      <a class="logo" href="https://www.airoobi.com">AIROOBI</a>
      <span class="tag">SLA · Trasparenza</span>
    </header>

    <section class="hero">
      <div class="eyebrow">Service Level Agreement · 30 giorni</div>
      <h1>I numeri, in chiaro.</h1>
      <p class="sub">Mostriamo come stiamo rispettando l'impegno di valutare ogni oggetto entro 48 ore. Anche quando non è perfetto.</p>
    </section>

    ${total === 0 ? `
    <div class="empty-state">
      <h3>Nessuna valutazione completata nell'ultimo periodo</h3>
      <p>Le metriche appaiono qui appena il primo seller riceve un esito di valutazione.</p>
    </div>` : `
    <div class="hero-metric">
      <div class="label">Ultimi 30 giorni</div>
      <div class="number">${pct48}%</div>
      <p class="ctx">delle valutazioni completate entro 48h · target SLA</p>
    </div>

    <div class="metrics-grid">
      <div class="metric">
        <div class="label">Sotto 24h</div>
        <div class="value">${pct24}<span class="unit">%</span></div>
      </div>
      <div class="metric">
        <div class="label">Tempo medio risposta</div>
        <div class="value">${avgH}<span class="unit">h</span></div>
      </div>
      <div class="metric">
        <div class="label">Mediana risposta</div>
        <div class="value">${medH}<span class="unit">h</span></div>
      </div>
      <div class="metric">
        <div class="label">Valutazioni totali</div>
        <div class="value">${total}</div>
      </div>
    </div>

    <section class="distribution">
      <h2>Distribuzione tempi risposta</h2>
      <div class="chart">
        ${buckets.map(b => {
          const heightPct = (b.count / maxBucket) * 100;
          return `<div class="bar"><div class="fill" style="height:${heightPct}%;background:${b.color}"></div><div class="count">${b.count}</div><div class="label">${b.label}</div></div>`;
        }).join('')}
      </div>
    </section>`}

    <div class="live-strip">
      <div class="live-item">
        <div class="live-label">Valutazioni oggi</div>
        <div class="live-value">${today}</div>
      </div>
      <div class="live-item">
        <div class="live-label">In coda ora</div>
        <div class="live-value">${queue}</div>
      </div>
      <div class="live-item">
        <div class="live-label">Aggiornato</div>
        <div class="live-value" style="font-size:14px;color:var(--gray-300);font-family:var(--font-m)">${refreshedAt}</div>
      </div>
    </div>

    <section class="trust">
      <blockquote>"Mostriamo i numeri reali, anche quando non sono perfetti."</blockquote>
      <div class="cite">AIROOBI · principio di trasparenza</div>
    </section>
  </div>

  <footer>
    AIROOBI &copy; 2026 · <a href="https://www.airoobi.com">airoobi.com</a> · <a href="https://www.airoobi.app">airoobi.app</a>
    <span class="meta">Dati aggiornati ogni 5 minuti · finestra mobile 30 giorni</span>
  </footer>
</body>
</html>`;
}

function renderError() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SLA · AIROOBI</title><style>body{background:#000;color:#fff;font-family:sans-serif;padding:40px;text-align:center}a{color:#B8960C}</style></head><body><h1 style="color:#B8960C">SLA temporaneamente non disponibile</h1><p>Riprova tra qualche minuto.</p><p><a href="https://www.airoobi.com">airoobi.com</a></p></body></html>`;
}

export default async function handler(req, res) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_sla_metrics_public`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      console.error('SLA RPC error', response.status, await response.text());
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.status(502).send(renderError());
      return;
    }

    const rows = await response.json();
    const data = Array.isArray(rows) && rows.length > 0 ? rows[0] : {};

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.status(200).send(renderHtml(data));
  } catch (err) {
    console.error('SLA SSR handler error', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(renderError());
  }
}
