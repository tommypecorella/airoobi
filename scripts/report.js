#!/usr/bin/env node
// ══════════════════════════════════════════════════
// AIROOBI — Bi-Hourly Report Email
// Cron: 0 */2 * * * node /home/drskeezu/projects/airoobi/scripts/report.js
//
// Env vars required (in .env at project root):
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY
//   POSTMARK_TOKEN
//   REPORT_TO (default: ceo@airoobi.com)
// ══════════════════════════════════════════════════

const https = require('https');
const path = require('path');

// ── Load .env ──
const envPath = path.join(__dirname, '..', '.env');
try {
  const fs = require('fs');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  });
} catch (e) {
  console.error('Cannot read .env:', e.message);
  process.exit(1);
}

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
const PM_TOKEN = process.env.POSTMARK_TOKEN;
const REPORT_TO = process.env.REPORT_TO || 'ceo@airoobi.com';

if (!SB_URL || !SB_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}
if (!PM_TOKEN) {
  console.error('Missing POSTMARK_TOKEN');
  process.exit(1);
}

// ── HTTP helpers ──
function sbGet(endpoint) {
  return new Promise((resolve, reject) => {
    const u = new URL(SB_URL + '/rest/v1/' + endpoint);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Accept': 'application/json'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Parse error: ' + data.substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

function sendEmail(to, subject, htmlBody) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      From: 'noreply@airoobi.com',
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound'
    });
    const options = {
      hostname: 'api.postmarkapp.com',
      path: '/email',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': PM_TOKEN,
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
        else reject(new Error('Postmark ' + res.statusCode + ': ' + data));
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(payload);
    req.end();
  });
}

// ── Main ──
async function main() {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const todayStart = now.toISOString().split('T')[0] + 'T00:00:00';

  // Fetch data in parallel
  const [
    allUsers,
    newUsers,
    waitlist,
    allPoints,
    recentCheckins,
    recentVideos,
    confirmedReferrals,
    recentEvents
  ] = await Promise.all([
    sbGet('profiles?select=id'),
    sbGet('profiles?select=id,email,created_at&created_at=gte.' + twoHoursAgo + '&order=created_at.desc'),
    sbGet('waitlist?select=id'),
    sbGet('points_ledger?select=amount'),
    sbGet('checkins?select=id&checked_at=gte.' + todayStart.split('T')[0]),
    sbGet('video_views?select=id&viewed_at=gte.' + twoHoursAgo),
    sbGet('referral_confirmations?select=id&status=eq.confirmed'),
    sbGet('events?select=action,created_at&order=created_at.desc&limit=5')
  ]);

  const totalUsers = Array.isArray(allUsers) ? allUsers.length : 0;
  const newUsersCount = Array.isArray(newUsers) ? newUsers.length : 0;
  const waitlistCount = Array.isArray(waitlist) ? waitlist.length : 0;
  const totalAria = Array.isArray(allPoints) ? allPoints.reduce((a, b) => a + (b.amount || 0), 0) : 0;
  const checkinsToday = Array.isArray(recentCheckins) ? recentCheckins.length : 0;
  const videosRecent = Array.isArray(recentVideos) ? recentVideos.length : 0;
  const referralsTotal = Array.isArray(confirmedReferrals) ? confirmedReferrals.length : 0;

  // ── Suggestions ──
  const suggestions = [];
  if (newUsersCount < 1) {
    suggestions.push('Nessuna nuova registrazione nelle ultime 2 ore. Valuta di condividere il link referral sui tuoi canali.');
  }
  if (totalUsers > 0 && checkinsToday < Math.round(totalUsers * 0.3)) {
    suggestions.push('Engagement basso: check-in oggi < 30% degli utenti. Considera una notifica push o un reminder social.');
  }
  // Check if any referral confirmed today
  const todayRefs = Array.isArray(confirmedReferrals) ? confirmedReferrals.length : 0;
  // We can't easily filter today-only from total, so check new users as proxy
  if (newUsersCount === 0) {
    suggestions.push('Nessun referral confermato di recente. Promuovi il programma referral.');
  }

  // ── Format date ──
  const dateStr = now.toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome'
  });

  // ── Recent events table ──
  let eventsHtml = '';
  if (Array.isArray(recentEvents) && recentEvents.length > 0) {
    eventsHtml = recentEvents.map(e => {
      const d = new Date(e.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' });
      return `<tr><td style="padding:6px 12px;border-bottom:1px solid #333;color:#ccc;font-size:13px">${e.action || '—'}</td><td style="padding:6px 12px;border-bottom:1px solid #333;color:#888;font-size:13px">${d}</td></tr>`;
    }).join('');
  } else {
    eventsHtml = '<tr><td colspan="2" style="padding:6px 12px;color:#888">Nessun evento recente.</td></tr>';
  }

  // ── Suggestions HTML ──
  let suggestionsHtml = '';
  if (suggestions.length > 0) {
    suggestionsHtml = suggestions.map(s =>
      `<div style="padding:12px 16px;margin-bottom:8px;background:rgba(184,150,12,.08);border-left:3px solid #B8960C;font-size:13px;color:#ccc;line-height:1.6">${s}</div>`
    ).join('');
  } else {
    suggestionsHtml = '<div style="padding:12px 16px;background:rgba(73,181,131,.08);border-left:3px solid #49b583;font-size:13px;color:#49b583">Tutto nella norma. Nessuna azione richiesta.</div>';
  }

  // ── New users list ──
  let newUsersHtml = '';
  if (Array.isArray(newUsers) && newUsers.length > 0) {
    newUsersHtml = '<h3 style="color:#B8960C;font-size:14px;margin:24px 0 8px;letter-spacing:1px">NUOVI UTENTI (2h)</h3>';
    newUsersHtml += newUsers.map(u => {
      const d = new Date(u.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' });
      return `<div style="padding:6px 0;font-size:13px;color:#ccc;border-bottom:1px solid #222">${u.email || '—'} <span style="color:#888;margin-left:8px">${d}</span></div>`;
    }).join('');
  }

  // ── Build email HTML ──
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:40px 24px">
  <div style="text-align:center;margin-bottom:32px">
    <div style="font-size:24px;letter-spacing:4px;color:#B8960C;font-weight:300">AIROOBI</div>
    <div style="font-size:11px;color:#888;letter-spacing:2px;margin-top:4px">REPORT · ${dateStr}</div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <tr>
      <td style="padding:16px;background:#111;border:1px solid #222;text-align:center;width:33%">
        <div style="font-size:28px;color:#B8960C;font-weight:300">${totalUsers}</div>
        <div style="font-size:10px;color:#888;letter-spacing:1px;margin-top:4px">UTENTI TOTALI</div>
      </td>
      <td style="padding:16px;background:#111;border:1px solid #222;text-align:center;width:33%">
        <div style="font-size:28px;color:${newUsersCount > 0 ? '#49b583' : '#888'};font-weight:300">${newUsersCount}</div>
        <div style="font-size:10px;color:#888;letter-spacing:1px;margin-top:4px">NUOVI (2H)</div>
      </td>
      <td style="padding:16px;background:#111;border:1px solid #222;text-align:center;width:33%">
        <div style="font-size:28px;color:#B8960C;font-weight:300">${waitlistCount}</div>
        <div style="font-size:10px;color:#888;letter-spacing:1px;margin-top:4px">WAITLIST</div>
      </td>
    </tr>
    <tr>
      <td style="padding:16px;background:#111;border:1px solid #222;text-align:center">
        <div style="font-size:28px;color:#4A9EFF;font-weight:300">${totalAria.toLocaleString()}</div>
        <div style="font-size:10px;color:#888;letter-spacing:1px;margin-top:4px">ARIA TOTALI</div>
      </td>
      <td style="padding:16px;background:#111;border:1px solid #222;text-align:center">
        <div style="font-size:28px;color:#B8960C;font-weight:300">${checkinsToday}</div>
        <div style="font-size:10px;color:#888;letter-spacing:1px;margin-top:4px">CHECK-IN OGGI</div>
      </td>
      <td style="padding:16px;background:#111;border:1px solid #222;text-align:center">
        <div style="font-size:28px;color:#B8960C;font-weight:300">${videosRecent}</div>
        <div style="font-size:10px;color:#888;letter-spacing:1px;margin-top:4px">VIDEO (2H)</div>
      </td>
    </tr>
    <tr>
      <td colspan="3" style="padding:16px;background:#111;border:1px solid #222;text-align:center">
        <div style="font-size:28px;color:#B8960C;font-weight:300">${referralsTotal}</div>
        <div style="font-size:10px;color:#888;letter-spacing:1px;margin-top:4px">REFERRAL CONFERMATI (TOTALE)</div>
      </td>
    </tr>
  </table>

  ${newUsersHtml}

  <h3 style="color:#B8960C;font-size:14px;margin:24px 0 8px;letter-spacing:1px">SUGGERIMENTI</h3>
  ${suggestionsHtml}

  <h3 style="color:#B8960C;font-size:14px;margin:24px 0 8px;letter-spacing:1px">ULTIMI 5 EVENTI</h3>
  <table style="width:100%;border-collapse:collapse">
    <thead><tr><th style="text-align:left;padding:6px 12px;border-bottom:1px solid #444;color:#B8960C;font-size:10px;letter-spacing:1px">AZIONE</th><th style="text-align:left;padding:6px 12px;border-bottom:1px solid #444;color:#B8960C;font-size:10px;letter-spacing:1px">ORA</th></tr></thead>
    <tbody>${eventsHtml}</tbody>
  </table>

  <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #222">
    <div style="font-size:10px;color:#666;letter-spacing:1px">AIROOBI · Report automatico ogni 2 ore</div>
    <div style="font-size:10px;color:#444;margin-top:4px">airoobi.com</div>
  </div>
</div>
</body>
</html>`;

  // ── Send ──
  const subject = `AIROOBI Report — ${dateStr}`;
  try {
    await sendEmail(REPORT_TO, subject, html);
    console.log(`[${now.toISOString()}] Report sent to ${REPORT_TO}`);
  } catch (e) {
    console.error(`[${now.toISOString()}] Failed to send report:`, e.message);
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Report error:', e);
  process.exit(1);
});
