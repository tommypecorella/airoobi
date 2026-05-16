// AIROOBI Winner Story public SSR · Atto 6 pollution layer
// Vercel Serverless Function (Node runtime)
// Routes:
//   /storie-vincitori/:id → /api/winner-story-ssr?id=:id
//   /storie-vincitori     → /api/winner-story-ssr (archive)
// Decision #17 LOCKED: Vercel SSR (NOT Cloudflare Worker)

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vuvlmlpuhovipfwtquux.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTUyMjEsImV4cCI6MjA1NjY5MTIyMX0.7Hd6JsB4PfcoIaSepW0DkmpzlxFhcz4eMpqo4lr8KX0';

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function renderStory(d) {
  const title = `${escapeHtml(d.title)} · Storia AIROOBI`;
  const description = `Airdrop AIROOBI completato: ${escapeHtml(d.title)} (€${d.object_value_eur}) · ${d.total_participants} partecipanti · raccolta ${d.aria_incassato} ARIA. Hai un oggetto simile? Scopri AIROOBI.`;
  const ogImage = d.image_url || 'https://www.airoobi.com/og-image.png';
  const canonical = `https://www.airoobi.com/storie-vincitori/${d.airdrop_id}`;
  const dateStr = d.draw_executed_at ? new Date(d.draw_executed_at).toLocaleDateString('it-IT', { year:'numeric', month:'long', day:'numeric' }) : '';
  const winnerLabel = d.winner_redacted ? 'Partecipante AIROOBI' : (d.winner_username ? '@' + escapeHtml(d.winner_username) : 'Partecipante AIROOBI');

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ogImage}">
<script type="application/ld+json">${JSON.stringify({
  "@context":"https://schema.org","@type":"Article",
  "headline": d.title, "image": ogImage, "datePublished": d.draw_executed_at,
  "author": {"@type":"Organization","name":"AIROOBI"},
  "publisher": {"@type":"Organization","name":"AIROOBI","logo":{"@type":"ImageObject","url":"https://www.airoobi.com/og-image.png"}},
  "description": description
})}</script>
<style>
body { background:#000;color:#fff;font-family:'Instrument Sans',sans-serif;margin:0;padding:0;line-height:1.6 }
.wrap { max-width:760px;margin:0 auto;padding:40px 20px }
h1 { font-family:'Cormorant Garamond',serif;color:#B8960C;font-size:38px;margin:0 0 12px;font-weight:500 }
.subtitle { color:#aaa;font-size:14px;margin-bottom:32px }
.hero { width:100%;border-radius:12px;margin-bottom:28px;border:1px solid #222 }
.stats { display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:28px 0;padding:20px;background:#0a0a0a;border:1px solid #222;border-radius:12px }
.stat { text-align:center }
.stat-label { color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px }
.stat-value { color:#fff;font-size:20px;font-weight:600 }
.stat-value.gold { color:#B8960C }
.winner-box { background:linear-gradient(135deg,rgba(184,150,12,0.08),transparent);border:1px solid #B8960C;border-radius:12px;padding:24px;margin:32px 0 }
.winner-box h2 { color:#B8960C;font-family:'Cormorant Garamond',serif;font-size:24px;margin:0 0 8px;font-weight:500 }
.cta { background:#B8960C;color:#000;padding:18px 24px;border-radius:8px;text-align:center;margin:40px 0 0;font-weight:600 }
.cta a { color:#000;text-decoration:none;display:block }
footer { color:#666;font-size:11px;text-align:center;padding:24px;border-top:1px solid #222;margin-top:40px }
footer a { color:#B8960C;text-decoration:none }
</style>
</head>
<body>
<div class="wrap">
  <h1>${escapeHtml(d.title)}</h1>
  <div class="subtitle">Categoria <strong>${escapeHtml(d.category)}</strong> · airdrop completato il ${dateStr}</div>
  ${d.image_url ? `<img src="${escapeHtml(d.image_url)}" alt="${escapeHtml(d.title)}" class="hero">` : ''}
  <div class="stats">
    <div class="stat"><div class="stat-label">Valore oggetto</div><div class="stat-value gold">€${d.object_value_eur}</div></div>
    <div class="stat"><div class="stat-label">Partecipanti</div><div class="stat-value">${d.total_participants}</div></div>
    <div class="stat"><div class="stat-label">Blocchi venduti</div><div class="stat-value">${d.blocks_sold}/${d.total_blocks}</div></div>
    <div class="stat"><div class="stat-label">ARIA raccolto</div><div class="stat-value">${d.aria_incassato}</div></div>
  </div>
  <div class="winner-box">
    <h2>${winnerLabel} ha ottenuto l'oggetto</h2>
    <p style="color:#ccc;margin:0">Su AIROOBI gli oggetti di valore vanno a chi accumula i blocchi giusti · ogni partecipazione conta verso le prossime occasioni della stessa categoria.</p>
  </div>
  <div class="cta">
    <a href="https://www.airoobi.app/airdrops">Vedi gli airdrop attivi su AIROOBI →</a>
  </div>
  <p style="color:#888;font-size:13px;margin-top:24px">Hai un oggetto di valore (min €500) da vendere? <a href="https://www.airoobi.com/vendi.html" style="color:#B8960C">Scopri come funziona</a>.</p>
</div>
<footer>AIROOBI &copy; 2026 · <a href="https://www.airoobi.com">airoobi.com</a> · <a href="https://www.airoobi.app">airoobi.app</a></footer>
</body></html>`;
}

function renderArchive(items, category) {
  const title = category ? `Storie vincitori · ${escapeHtml(category)} · AIROOBI` : 'Archivio storie vincitori · AIROOBI';
  const description = `Tutti gli airdrop completati su AIROOBI${category ? ' categoria ' + escapeHtml(category) : ''}. Storia, valori, partecipazione.`;
  const canonical = `https://www.airoobi.com/storie-vincitori${category ? '?category=' + encodeURIComponent(category) : ''}`;
  const cards = items.map(d => {
    const date = d.draw_executed_at ? new Date(d.draw_executed_at).toLocaleDateString('it-IT', { year:'numeric', month:'short', day:'numeric' }) : '';
    return `<a href="${escapeHtml(d.story_public_url)}" class="card">
      ${d.image_url ? `<img src="${escapeHtml(d.image_url)}" alt="${escapeHtml(d.title)}">` : '<div class="placeholder"></div>'}
      <div class="card-body">
        <div class="card-title">${escapeHtml(d.title)}</div>
        <div class="card-meta">${escapeHtml(d.category)} · €${d.object_value_eur} · ${date}</div>
      </div>
    </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<script type="application/ld+json">${JSON.stringify({
  "@context":"https://schema.org","@type":"CollectionPage","name": title,
  "description": description, "url": canonical
})}</script>
<style>
body { background:#000;color:#fff;font-family:'Instrument Sans',sans-serif;margin:0;padding:0 }
.wrap { max-width:1100px;margin:0 auto;padding:40px 20px }
h1 { font-family:'Cormorant Garamond',serif;color:#B8960C;font-size:36px;font-weight:500;margin:0 0 8px }
.intro { color:#aaa;margin-bottom:32px }
.grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px }
.card { background:#0a0a0a;border:1px solid #222;border-radius:12px;overflow:hidden;text-decoration:none;color:#fff;display:block;transition:border-color .2s }
.card:hover { border-color:#B8960C }
.card img,.card .placeholder { width:100%;aspect-ratio:4/3;object-fit:cover;background:#1a1a1a }
.card-body { padding:14px 16px }
.card-title { font-weight:600;margin-bottom:4px }
.card-meta { color:#888;font-size:12px }
footer { color:#666;font-size:11px;text-align:center;padding:24px;border-top:1px solid #222;margin-top:40px }
footer a { color:#B8960C;text-decoration:none }
.empty { text-align:center;padding:60px;color:#888 }
</style>
</head>
<body>
<div class="wrap">
  <h1>Storie vincitori AIROOBI</h1>
  <p class="intro">Gli airdrop completati su AIROOBI · partecipazione e risultati pubblici.</p>
  ${items.length === 0 ? '<div class="empty">Nessuna storia disponibile per ora.</div>' : `<div class="grid">${cards}</div>`}
</div>
<footer>AIROOBI &copy; 2026 · <a href="https://www.airoobi.com">airoobi.com</a> · <a href="https://www.airoobi.app">airoobi.app</a></footer>
</body></html>`;
}

function renderNotFound(id) {
  return `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>Storia non trovata · AIROOBI</title><style>body{background:#000;color:#fff;font-family:sans-serif;padding:40px;text-align:center}h1{color:#B8960C}a{color:#B8960C}</style></head><body><h1>Storia non trovata</h1><p>L'airdrop richiesto non esiste o non è pubblicamente visibile.</p><p><a href="https://www.airoobi.com/storie-vincitori">Torna all'archivio</a></p></body></html>`;
}

async function fetchSupabase(rpcName, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${rpcName}`, {
    method:'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type':'application/json', Accept:'application/json' },
    body: JSON.stringify(body || {})
  });
  if (!r.ok) throw new Error(`Supabase ${rpcName} ${r.status}: ${await r.text()}`);
  return r.json();
}

export default async function handler(req, res) {
  const idRaw = req.query?.id;
  const isArchive = !idRaw;

  try {
    if (isArchive) {
      const category = req.query?.category || null;
      const items = await fetchSupabase('get_winner_stories_archive', { p_category: category, p_limit: 20, p_offset: 0 });
      res.setHeader('Content-Type','text/html; charset=utf-8');
      res.setHeader('Cache-Control','public, max-age=900, stale-while-revalidate=86400');
      res.setHeader('X-Robots-Tag','index, follow');
      res.status(200).send(renderArchive(Array.isArray(items) ? items : [], category));
      return;
    }

    // Single story
    const data = await fetchSupabase('get_winner_story_public', { p_airdrop_id: idRaw });
    const obj = Array.isArray(data) ? data[0] : data;
    if (!obj || obj.error || !obj.airdrop_id) {
      res.setHeader('Content-Type','text/html; charset=utf-8');
      res.setHeader('Cache-Control','public, max-age=60');
      res.setHeader('X-Robots-Tag','noindex');
      res.status(404).send(renderNotFound(idRaw));
      return;
    }
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','public, max-age=3600, stale-while-revalidate=86400');
    res.setHeader('X-Robots-Tag','index, follow');
    res.status(200).send(renderStory(obj));
  } catch (err) {
    console.error('winner-story-ssr error', err);
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store');
    res.status(500).send(renderNotFound(idRaw || 'archive'));
  }
}
