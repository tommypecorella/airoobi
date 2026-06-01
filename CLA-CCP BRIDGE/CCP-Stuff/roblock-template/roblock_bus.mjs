#!/usr/bin/env node
/* =====================================================================
 * CCP harness · roblock_bus.mjs — contratto bus AIgorà per ROBLOCK (Fase C)
 * Wrapper REST su agora.* per: leggere pendenti, postare, heartbeat, marcare handled.
 * Key via env (.env accanto o export). NESSUN segreto nel file.
 *
 * Uso:
 *   node roblock_bus.mjs pending                  # messaggi non gestiti (JSON)
 *   node roblock_bus.mjs post <canale> <testo>    # posta un messaggio come SLUG
 *   node roblock_bus.mjs activity <testo>         # heartbeat: busy + current_activity
 *   node roblock_bus.mjs done                     # heartbeat: idle + clear activity
 *   node roblock_bus.mjs handled <id> [<id>...]   # marca messaggi handled_by=SLUG
 * Env: AGORA_KEY (obblig.), AGORA_URL (default agora), ROBLOCK_SLUG (default 'roblock')
 * ===================================================================== */
const URL_BASE = process.env.AGORA_URL || 'https://tktuwboayqqimdhsrnap.supabase.co';
const KEY = process.env.AGORA_KEY;
const SLUG = process.env.ROBLOCK_SLUG || 'roblock';
if (!KEY) { console.error('ERRORE: manca AGORA_KEY (anon key agora) via env.'); process.exit(1); }

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json',
            'Content-Profile': 'agora', 'Accept-Profile': 'agora' };
async function rest(path, opts = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { ...opts, headers: { ...H, ...(opts.headers || {}) } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const t = await res.text(); return t ? JSON.parse(t) : null;
}

const [cmd, ...args] = process.argv.slice(2);
try {
  switch (cmd) {
    case 'pending':
      console.log(JSON.stringify(await rest('messages?handled_at=is.null&order=created_at&select=id,channel_slug,sender_slug,kind,body,created_at'), null, 2));
      break;
    case 'post': {
      const [channel, ...rest_] = args;
      if (!channel || !rest_.length) { console.error('uso: post <canale> <testo>'); process.exit(1); }
      await rest('messages', { method: 'POST', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ channel_slug: channel, sender_slug: SLUG, kind: 'message', body: rest_.join(' ') }) });
      console.log('posted'); break;
    }
    case 'activity':
      await rest(`agents?slug=eq.${SLUG}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'busy', current_activity: args.join(' '), activity_since: new Date().toISOString(), last_seen: new Date().toISOString() }) });
      console.log('activity set'); break;
    case 'done':
      await rest(`agents?slug=eq.${SLUG}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'idle', current_activity: null, last_seen: new Date().toISOString() }) });
      console.log('done'); break;
    case 'handled': {
      if (!args.length) { console.error('uso: handled <id> [<id>...]'); process.exit(1); }
      await rest(`messages?id=in.(${args.join(',')})`, { method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ handled_at: new Date().toISOString(), handled_by: SLUG }) });
      console.log(`marked ${args.length} handled`); break;
    }
    default:
      console.log('uso: node roblock_bus.mjs <pending|post <canale> <testo>|activity <testo>|done|handled <id...>>');
  }
} catch (e) { console.error(String(e)); process.exit(1); }
