// AIROOBI LAB · hub interno riservato (SSR gate + schedine servizi)
// Vercel Serverless Function · /hub on airoobi.com (vercel.json rewrite -> /api/hub)
// Auth server-side: password (env HUB_PASSWORD) -> cookie HttpOnly firmato HMAC.
// Servizi: Glassatore (/glassatore) e Bottarella (env BOTTARELLA_URL, via Cloudflare).
import crypto from 'node:crypto';

const HUB_PASSWORD = process.env.HUB_PASSWORD || '';
const HUB_SECRET = process.env.HUB_SECRET || HUB_PASSWORD || 'airoobi-lab-dev';
const BOTTARELLA_URL = process.env.BOTTARELLA_URL || 'https://bottarella.airoobi.com';
const SESSION_HOURS = 12;
const VERSION = 'alfa-2026.06.27-hub.1.0';

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function sign(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verify(token, secret) {
  try {
    if (!token) return null;
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    const expect = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    const a = Buffer.from(sig), b = Buffer.from(expect);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch { return null; }
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

async function readPassword(req) {
  if (req.body && typeof req.body === 'object' && req.body.password != null) return String(req.body.password);
  if (typeof req.body === 'string') return new URLSearchParams(req.body).get('password') || '';
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  return new URLSearchParams(raw).get('password') || '';
}

const HEAD = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>AIROOBI LAB</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Instrument+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');
:root{--bg:#0a0a09;--card:#131211;--line:#242420;--white:#f4f2ec;--muted:#8c8c82;
--red:#e0473c;--red-dim:#7a2620;--red-bg:rgba(224,71,60,.08)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--white);font-family:'Instrument Sans',system-ui,sans-serif;
line-height:1.55;-webkit-font-smoothing:antialiased;min-height:100vh}
a{color:inherit;text-decoration:none}
.mark{font-family:'Cormorant Garamond',serif;font-weight:500;letter-spacing:2px;color:var(--white)}
.mark b{color:var(--red);font-weight:600}
.mono{font-family:'DM Mono',monospace}
.wrap{max-width:880px;margin:0 auto;padding:0 22px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:'DM Mono',monospace;
font-size:13px;font-weight:500;color:#0a0a09;background:var(--red);border:none;border-radius:8px;
padding:11px 18px;cursor:pointer;transition:filter .15s}
.btn:hover{filter:brightness(1.08)}
.foot{margin:40px 0 24px;text-align:center;color:#5c5c54;font-family:'DM Mono',monospace;font-size:11px}
</style></head><body>`;

const FOOT = `<div class="foot">airoobi lab · accesso riservato · ${VERSION}</div></body></html>`;

function renderGate(error) {
  const needsConfig = !HUB_PASSWORD;
  return HEAD + `
<div class="wrap" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:90vh">
  <div style="text-align:center;margin-bottom:30px">
    <div class="mark" style="font-size:46px;line-height:1">AIROOBI <b>LAB</b></div>
    <div style="color:var(--muted);font-size:14px;margin-top:8px">Laboratorio interno — accesso riservato</div>
  </div>
  <form method="post" action="/hub" autocomplete="off"
    style="width:100%;max-width:340px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px">
    <label class="mono" style="display:block;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Password</label>
    <input type="password" name="password" autofocus
      style="width:100%;background:#0c0c0b;border:1px solid var(--line);color:var(--white);border-radius:8px;padding:12px 13px;font-family:'DM Mono',monospace;font-size:15px;margin-bottom:14px;outline:none">
    ${error ? `<div style="color:var(--red);font-size:13px;margin-bottom:12px">${esc(error)}</div>` : ''}
    ${needsConfig ? `<div style="color:#caa46a;font-size:12px;margin-bottom:12px;line-height:1.5">Config: imposta la variabile <span class="mono">HUB_PASSWORD</span> su Vercel per attivare il gate.</div>` : ''}
    <button class="btn" type="submit" style="width:100%">Entra nel Lab</button>
  </form>
</div>` + FOOT;
}

function card({ icon, name, desc, status, statusColor, href, external }) {
  const target = external ? ' target="_blank" rel="noopener"' : '';
  const arrow = external ? '&#8599;' : '&#8594;';
  return `
  <a href="${href}"${target} style="display:flex;flex-direction:column;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;transition:border-color .15s" onmouseover="this.style.borderColor='var(--red-dim)'" onmouseout="this.style.borderColor='var(--line)'">
    <div style="width:40px;height:40px;border-radius:10px;border:1px solid var(--red-dim);background:var(--red-bg);display:flex;align-items:center;justify-content:center;color:var(--red);font-size:20px;margin-bottom:14px">${icon}</div>
    <div class="mark" style="font-size:26px;color:var(--white)">${esc(name)}</div>
    <div style="color:var(--muted);font-size:13.5px;margin:4px 0 14px;flex:1">${esc(desc)}</div>
    <div class="mono" style="display:flex;align-items:center;gap:7px;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px">
      <span style="width:7px;height:7px;border-radius:50%;background:${statusColor}"></span>${esc(status)}</div>
    <div class="btn" style="width:100%">Accedi <span style="font-size:15px">${arrow}</span></div>
  </a>`;
}

function ghost(label) {
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0d0d0c;border:1px dashed #2a2a26;border-radius:14px;padding:20px;min-height:170px;color:#5c5c54;font-size:13px;text-align:center">
    <div style="font-size:24px;color:#3f3f3a;margin-bottom:8px">+</div>${esc(label)}</div>`;
}

function renderHub() {
  return HEAD + `
<div class="wrap" style="padding-top:34px">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:6px">
    <div class="mark" style="font-size:38px">AIROOBI <b>LAB</b></div>
    <div style="display:flex;align-items:center;gap:12px">
      <span class="mono" style="display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--red);border:1px solid var(--red-dim);background:var(--red-bg);border-radius:20px;padding:5px 12px">&#9679; sessione attiva</span>
      <a class="mono" href="/hub?logout=1" style="font-size:11px;color:var(--muted)">esci</a>
    </div>
  </div>
  <div style="color:var(--muted);font-size:14px;margin-bottom:26px">Laboratorio interno — servizi riservati</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
    ${card({ icon: '&#9683;', name: 'Glassatore', desc: 'Try-on occhiali AI multi-angolo. Motore ibrido geometrico + HD.', status: 'live', statusColor: '#49b88a', href: '/glassatore', external: false })}
    ${card({ icon: '&#9650;', name: 'Bottarella', desc: 'Accumulatore KAS su Gate. Grid bot — paper + live, con kill-switch.', status: 'paper + live', statusColor: 'var(--red)', href: BOTTARELLA_URL, external: true })}
    ${ghost('prossimo servizio')}
    ${ghost('in incubazione')}
  </div>
</div>` + FOOT;
}

function sendHtml(res, status, html) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.status(status).send(html);
}

function setCookie(res, value, maxAgeSec) {
  res.setHeader('Set-Cookie',
    `hub_auth=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSec}`);
}

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);

  if (req.method === 'GET' && (req.query?.logout != null || /[?&]logout/.test(req.url || ''))) {
    setCookie(res, 'deleted', 0);
    return sendHtml(res, 200, renderGate(''));
  }

  if (req.method === 'POST') {
    const pw = await readPassword(req);
    if (HUB_PASSWORD && safeEqual(pw, HUB_PASSWORD)) {
      const token = sign({ exp: Date.now() + SESSION_HOURS * 3600 * 1000 }, HUB_SECRET);
      setCookie(res, token, SESSION_HOURS * 3600);
      res.statusCode = 302;
      res.setHeader('Location', '/hub');
      return res.end();
    }
    return sendHtml(res, 401, renderGate('Password errata.'));
  }

  const session = verify(cookies.hub_auth, HUB_SECRET);
  return sendHtml(res, 200, session ? renderHub() : renderGate(''));
}
