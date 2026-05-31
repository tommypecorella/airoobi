#!/usr/bin/env node
/* =====================================================================
 * CCP harness · ago_bus.mjs — contratto bus per il DISPATCHER /ago (Fase C)
 * Layer DETERMINISTICO: poll + routing a regole di stringa. ZERO Claude, zero token.
 * Wrapper REST su agora.* (progetto airoobi-agora). Key via env (.env accanto). NESSUN segreto nel file.
 *
 * Uso:
 *   node ago_bus.mjs pending                       # messaggi non gestiti (JSON)
 *   node ago_bus.mjs route                         # filtro §3 → {slug:[ids...]} (deterministico)
 *   node ago_bus.mjs busy   <slug> <attivita...>   # heartbeat: status=busy + current_activity
 *   node ago_bus.mjs idle   <slug>                 # heartbeat: status=idle + clear activity
 *   node ago_bus.mjs handled <id> [<id>...]        # marca messaggi handled (handled_by=dispatcher)
 * Env: AGORA_KEY (obblig. per i comandi REST), AGORA_URL (default agora),
 *      AGO_WAKEABLE (default 'roblock,aro'), AGO_CH_ROBLOCK (default 'marketing'), AGO_CH_ARO (default ''),
 *      HANDLED_BY (default 'dispatcher')
 * (Le funzioni pure mentions/route sono esportate e testabili senza key.)
 * ===================================================================== */
const URL_BASE = process.env.AGORA_URL || 'https://tktuwboayqqimdhsrnap.supabase.co';
const HANDLED_BY = process.env.HANDLED_BY || 'dispatcher';
const WAKEABLE = (process.env.AGO_WAKEABLE || 'roblock,aro').split(',').map(s => s.trim()).filter(Boolean);
const COMPETENCE = {
  roblock: (process.env.AGO_CH_ROBLOCK ?? 'marketing').split(',').map(s => s.trim()).filter(Boolean),
  aro:     (process.env.AGO_CH_ARO ?? '').split(',').map(s => s.trim()).filter(Boolean),
};

// Mention deterministica: '@slug' o lo slug come parola intera (word-boundary) → niente falsi positivi tipo "lavoro"/"amaro".
export function mentions(body, slug) {
  return new RegExp(`(^|[^a-z0-9_])@?${slug}([^a-z0-9_]|$)`, 'i').test(body || '');
}

// §3 filtro deterministico. Regola: mention ha precedenza; in mancanza, canale di competenza.
// Mai auto-risveglio (sender stesso). Mai 'system'. Conservativo: nel dubbio NON instrada.
export function route(msgs, wakeable = WAKEABLE, competence = COMPETENCE) {
  const out = Object.fromEntries(wakeable.map(s => [s, []]));
  for (const m of msgs || []) {
    if (m.kind === 'system') continue;
    const mentioned = wakeable.filter(s => mentions(m.body, s));
    let targets = mentioned.length
      ? mentioned
      : wakeable.filter(s => (competence[s] || []).includes(m.channel_slug));
    targets = targets.filter(s => s !== m.sender_slug); // no self-wake a catena
    for (const t of targets) out[t].push(m.id);
  }
  return out;
}

function H() {
  const KEY = process.env.AGORA_KEY;
  if (!KEY) { console.error('ERRORE: manca AGORA_KEY (anon key agora) via env.'); process.exit(1); }
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json',
           'Content-Profile': 'agora', 'Accept-Profile': 'agora' };
}
async function rest(path, opts = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { ...opts, headers: { ...H(), ...(opts.headers || {}) } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const t = await res.text(); return t ? JSON.parse(t) : null;
}
const pending = () => rest('messages?handled_at=is.null&order=created_at&select=id,channel_slug,sender_slug,kind,body,created_at');

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  switch (cmd) {
    case 'pending': console.log(JSON.stringify(await pending(), null, 2)); break;
    case 'route':   console.log(JSON.stringify(route(await pending()))); break;
    case 'busy': {
      const [slug, ...act] = args;
      if (!slug) { console.error('uso: busy <slug> <attivita>'); process.exit(1); }
      await rest(`agents?slug=eq.${slug}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'busy', current_activity: act.join(' ') || null, activity_since: new Date().toISOString() }) });
      console.log(`busy:${slug}`); break;
    }
    case 'idle': {
      const [slug] = args;
      if (!slug) { console.error('uso: idle <slug>'); process.exit(1); }
      await rest(`agents?slug=eq.${slug}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'idle', current_activity: null }) });
      console.log(`idle:${slug}`); break;
    }
    case 'handled': {
      if (!args.length) { console.error('uso: handled <id> [<id>...]'); process.exit(1); }
      await rest(`messages?id=in.(${args.join(',')})`, { method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ handled_at: new Date().toISOString(), handled_by: HANDLED_BY }) });
      console.log(`marked ${args.length} handled`); break;
    }
    default: console.log('uso: node ago_bus.mjs <pending|route|busy <slug> <act>|idle <slug>|handled <id...>>');
  }
}

// CLI solo se invocato direttamente (così import per i test non esegue REST né richiede key).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(String(e)); process.exit(1); });
}
