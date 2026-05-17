// AIROOBI Winner Story public SSR · Atto 6 pollution layer
// Vercel Serverless Function (Node runtime)
// Routes:
//   /storie-vincitori/:id → /api/winner-story-ssr?id=:id
//   /storie-vincitori     → /api/winner-story-ssr (archive)
// Decision #17 LOCKED: Vercel SSR (NOT Cloudflare Worker)

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vuvlmlpuhovipfwtquux.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';

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
.share-row { display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:28px 0 8px;padding:14px 16px;background:#0a0a0a;border:1px solid #222;border-radius:10px }
.share-label { font-size:11px;color:#888;letter-spacing:.5px;text-transform:uppercase;margin-right:4px }
.share-btn { display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:6px;background:#111;color:#fff;text-decoration:none;font-size:12px;border:1px solid #222;transition:border-color .2s,background .2s }
.share-btn:hover { border-color:#B8960C;background:#1a1a1a }
.share-btn.wa svg { color:#25D366 }
.share-btn.tg svg { color:#26A5E4 }
.share-btn.x svg { color:#fff }
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
  <div class="share-row" aria-label="Condividi questa storia">
    <span class="share-label">Condividi questa storia</span>
    <a class="share-btn wa" href="https://wa.me/?text=${encodeURIComponent(`Storia AIROOBI · ${d.title} (€${d.object_value_eur}) · ${d.total_participants} partecipanti · ${canonical}`)}" target="_blank" rel="noopener" aria-label="WhatsApp">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z"/></svg> WhatsApp</a>
    <a class="share-btn tg" href="https://t.me/share/url?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(`Storia AIROOBI · ${d.title} (€${d.object_value_eur})`)}" target="_blank" rel="noopener" aria-label="Telegram">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.07-3.01-1.96 1.85c-.23.23-.42.42-.83.42z"/></svg> Telegram</a>
    <a class="share-btn x" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`Storia AIROOBI · ${d.title} · ${d.total_participants} partecipanti`)}&url=${encodeURIComponent(canonical)}" target="_blank" rel="noopener" aria-label="X">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X</a>
  </div>
  <div class="cta">
    <a href="https://www.airoobi.app/airdrops">Vedi gli airdrop attivi su AIROOBI →</a>
  </div>
  <p style="color:#888;font-size:13px;margin-top:24px">Hai un oggetto di valore (min €500) da vendere? <a href="https://www.airoobi.com/vendi.html" style="color:#B8960C">Scopri come funziona</a>.</p>
</div>
<footer>AIROOBI &copy; 2026 · <a href="https://www.airoobi.com">airoobi.com</a> · <a href="https://www.airoobi.app">airoobi.app</a></footer>
</body></html>`;
}

function renderArchive(items, category, page, perPage, hasMore) {
  const title = category ? `Storie vincitori · ${escapeHtml(category)} · AIROOBI` : 'Archivio storie vincitori · AIROOBI';
  const pageLabel = page > 1 ? ` · pagina ${page}` : '';
  const fullTitle = title + pageLabel;
  const description = `Tutti gli airdrop completati su AIROOBI${category ? ' categoria ' + escapeHtml(category) : ''}. Storia, valori, partecipazione.`;
  // W4 Day 12 · clean URL pattern /storie-vincitori/cat/{category} (BreadcrumbList SEO depth)
  const basePath = category
    ? `/storie-vincitori/cat/${encodeURIComponent(category)}`
    : '/storie-vincitori';
  const pageQs = (p) => (p && p !== 1) ? '?page=' + p : '';
  const canonical = `https://www.airoobi.com${basePath}${pageQs(page)}`;
  const prevHref = page > 2 ? `${basePath}${pageQs(page - 1)}` : (page === 2 ? `${basePath}${pageQs(1)}` : null);
  const nextHref = hasMore ? `${basePath}${pageQs(page + 1)}` : null;
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

  const ldJson = {
    "@context":"https://schema.org","@type":"CollectionPage","name": fullTitle,
    "description": description, "url": canonical,
    "isPartOf": { "@type":"WebSite","name":"AIROOBI","url":"https://www.airoobi.com" }
  };
  if (items.length) {
    ldJson.mainEntity = {
      "@type":"ItemList",
      "itemListElement": items.map((d, i) => ({
        "@type":"ListItem",
        "position": (page - 1) * perPage + i + 1,
        "url": d.story_public_url,
        "name": d.title
      }))
    };
  }
  // Schema.org BreadcrumbList · SEO depth navigation (Day 11)
  const breadcrumbItems = [
    { "@type":"ListItem","position":1,"name":"AIROOBI","item":"https://www.airoobi.com" },
    { "@type":"ListItem","position":2,"name":"Storie vincitori","item":"https://www.airoobi.com/storie-vincitori" }
  ];
  if (category) {
    breadcrumbItems.push({
      "@type":"ListItem","position":3,
      "name": category,
      "item": `https://www.airoobi.com/storie-vincitori/cat/${encodeURIComponent(category)}`
    });
  }
  const breadcrumbLd = {
    "@context":"https://schema.org","@type":"BreadcrumbList",
    "itemListElement": breadcrumbItems
  };

  const linkRel = [];
  if (prevHref) linkRel.push(`<link rel="prev" href="https://www.airoobi.com${prevHref}">`);
  if (nextHref) linkRel.push(`<link rel="next" href="https://www.airoobi.com${nextHref}">`);

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
${linkRel.join('\n')}
<meta property="og:type" content="website">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${description}">
<script type="application/ld+json">${JSON.stringify(ldJson)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
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
.pagination { display:flex;gap:14px;justify-content:center;align-items:center;margin:40px 0 0;flex-wrap:wrap }
.page-btn { padding:10px 22px;background:#111;border:1px solid #222;border-radius:8px;color:#fff;text-decoration:none;font-family:'DM Mono',monospace;font-size:12px;letter-spacing:1px;text-transform:uppercase;transition:border-color .2s,background .2s;cursor:pointer }
.page-btn:hover { border-color:#B8960C;background:#1a1a1a }
.page-indicator { font-family:'DM Mono',monospace;color:#888;font-size:11px;letter-spacing:1px }
.page-jump { display:inline-flex;gap:8px;align-items:center;margin:0 8px;font-family:'DM Mono',monospace;font-size:11px;color:#888 }
.page-jump input { width:60px;padding:9px 10px;background:#0a0a0a;color:#fff;border:1px solid #222;border-radius:6px;font-family:'DM Mono',monospace;font-size:12px;text-align:center }
.page-jump input:focus { outline:none;border-color:#B8960C }
.page-jump button { padding:9px 14px;background:#111;border:1px solid #222;border-radius:6px;color:#B8960C;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.5px;cursor:pointer;transition:border-color .2s,background .2s }
.page-jump button:hover { border-color:#B8960C;background:#1a1a1a }
footer { color:#666;font-size:11px;text-align:center;padding:24px;border-top:1px solid #222;margin-top:40px }
footer a { color:#B8960C;text-decoration:none }
.empty { text-align:center;padding:60px;color:#888 }
</style>
</head>
<body>
<div class="wrap">
  <h1>Storie vincitori AIROOBI</h1>
  <p class="intro">Gli airdrop completati su AIROOBI · partecipazione e risultati pubblici${pageLabel}.</p>
  ${items.length === 0 ? '<div class="empty">Nessuna storia disponibile per ora.</div>' : `<div class="grid">${cards}</div>`}
  ${(prevHref || nextHref) ? `<nav class="pagination" aria-label="Paginazione storie">
    ${prevHref ? `<a class="page-btn" href="${prevHref}" rel="prev">← Pagina precedente</a>` : ''}
    <span class="page-indicator">Pagina ${page}</span>
    <form class="page-jump" action="${basePath}" method="get" aria-label="Vai a pagina">
      <label for="page-jump-input">Vai a:</label>
      <input id="page-jump-input" type="number" name="page" min="1" value="${page}" aria-label="Numero pagina">
      <button type="submit">VAI →</button>
    </form>
    ${nextHref ? `<a class="page-btn" href="${nextHref}" rel="next">Pagina successiva →</a>` : ''}
  </nav>` : ''}
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
      const perPage = 20;
      const pageRaw = parseInt(req.query?.page, 10);
      const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
      // Fetch perPage+1 to detect hasMore without separate count query
      const items = await fetchSupabase('get_winner_stories_archive', {
        p_category: category, p_limit: perPage + 1, p_offset: (page - 1) * perPage
      });
      const arr = Array.isArray(items) ? items : [];
      const hasMore = arr.length > perPage;
      const pageItems = hasMore ? arr.slice(0, perPage) : arr;
      res.setHeader('Content-Type','text/html; charset=utf-8');
      res.setHeader('Cache-Control','public, max-age=900, stale-while-revalidate=86400');
      res.setHeader('X-Robots-Tag','index, follow');
      res.status(200).send(renderArchive(pageItems, category, page, perPage, hasMore));
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
