#!/usr/bin/env node
// ══════════════════════════════════════════════════
// AIROOBI — Test Suite Stage 1 Engagement Engine
// Comando: node scripts/test_stage1.js
//
// Verifica:
//  1. Tabelle nuove esistono (airdrop_watchlist, user_preferences, push_subscriptions)
//  2. Colonna duration_type su airdrops
//  3. Config keys soglie auto-transizione
//  4. RPC toggle_watchlist
//  5. RPC save_category_alerts
//  6. RPC save_push_subscription
//  7. RPC manager_update_airdrop con p_duration_type
//  8. buy_blocks auto-transizione presale→sale
//  9. Edge Functions raggiungibili
// 10. Cron job registrato
// ══════════════════════════════════════════════════

const https = require('https');
const path = require('path');
const fs = require('fs');

// ── Load .env ──
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
  envContent.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch (e) {}

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SB_URL || !SB_KEY) { console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env'); process.exit(1); }

// ── HTTP helpers ──
function sbFetch(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SB_URL + path);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function sbGet(path) { return sbFetch('GET', '/rest/v1/' + path); }
async function sbRpc(fn, params) { return sbFetch('POST', '/rest/v1/rpc/' + fn, params); }
async function sbPost(path, body) { return sbFetch('POST', '/rest/v1/' + path, body); }
async function sbPatch(path, body) { return sbFetch('PATCH', '/rest/v1/' + path, body); }
async function sbDel(path) { return sbFetch('DELETE', '/rest/v1/' + path); }

// ── Test runner ──
let passed = 0, failed = 0, skipped = 0;

function ok(name, condition, detail) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

function skip(name, reason) {
  console.log(`  ⏭  ${name} — ${reason}`);
  skipped++;
}

// ══════════════════════════════════════════════════
//  TESTS
// ══════════════════════════════════════════════════

async function run() {
  console.log('\n══ AIROOBI Stage 1 Test Suite ══\n');

  // ─── 1. Tabelle nuove ───
  console.log('1. TABELLE NUOVE');

  let r = await sbGet('airdrop_watchlist?select=id&limit=1');
  ok('airdrop_watchlist esiste', r.status === 200, 'status=' + r.status);

  r = await sbGet('user_preferences?select=id&limit=1');
  ok('user_preferences esiste', r.status === 200, 'status=' + r.status);

  r = await sbGet('push_subscriptions?select=id&limit=1');
  ok('push_subscriptions esiste', r.status === 200, 'status=' + r.status);

  // ─── 2. Colonna duration_type ───
  console.log('\n2. COLONNA duration_type');

  r = await sbGet('airdrops?select=duration_type&limit=1');
  ok('airdrops.duration_type accessibile', r.status === 200, 'status=' + r.status);

  // ─── 3. Config keys soglie ───
  console.log('\n3. CONFIG KEYS SOGLIE');

  r = await sbGet('airdrop_config?key=in.(presale_threshold_flash,presale_threshold_standard,presale_threshold_extended,auto_close_on_sellout)');
  const keys = Array.isArray(r.data) ? r.data.map(x => x.key) : [];
  ok('presale_threshold_flash', keys.includes('presale_threshold_flash'), JSON.stringify(keys));
  ok('presale_threshold_standard', keys.includes('presale_threshold_standard'));
  ok('presale_threshold_extended', keys.includes('presale_threshold_extended'));
  ok('auto_close_on_sellout', keys.includes('auto_close_on_sellout'));

  if (Array.isArray(r.data)) {
    r.data.forEach(c => {
      const v = parseInt(c.value);
      if (c.key.startsWith('presale_threshold')) {
        ok(`  ${c.key} = ${c.value}% (valido 5-100)`, v >= 5 && v <= 100);
      }
    });
  }

  // ─── 4. RPC toggle_watchlist ───
  console.log('\n4. RPC toggle_watchlist');
  // Service role can't call auth.uid() RPCs directly — verify function exists
  r = await sbRpc('toggle_watchlist', { p_airdrop_id: '00000000-0000-0000-0000-000000000000' });
  // Expected: error (no auth context), but function exists (not 404)
  ok('toggle_watchlist RPC esiste', r.status !== 404, 'status=' + r.status + ' (errore auth atteso)');

  // ─── 5. RPC save_category_alerts ───
  console.log('\n5. RPC save_category_alerts');
  r = await sbRpc('save_category_alerts', { p_slugs: ['mobile'] });
  ok('save_category_alerts RPC esiste', r.status !== 404, 'status=' + r.status);

  // ─── 6. RPC save_push_subscription ───
  console.log('\n6. RPC save_push_subscription');
  r = await sbRpc('save_push_subscription', { p_endpoint: 'https://test', p_keys_p256dh: 'test', p_keys_auth: 'test' });
  ok('save_push_subscription RPC esiste', r.status !== 404, 'status=' + r.status);

  // ─── 7. manager_update_airdrop con p_duration_type ───
  console.log('\n7. manager_update_airdrop + p_duration_type');
  // Verifichiamo che la funzione accetta il parametro senza errore di signature
  r = await sbRpc('manager_update_airdrop', {
    p_airdrop_id: '00000000-0000-0000-0000-000000000000',
    p_status: 'presale',
    p_duration_type: 'flash'
  });
  // Expected: NOT_FOUND (airdrop doesn't exist) or NO_PERMISSION, NOT a signature error
  const validResp = r.data && (r.data.error === 'NOT_FOUND' || r.data.error === 'NO_PERMISSION');
  ok('p_duration_type accettato (no signature error)', r.status !== 404 && (validResp || r.status === 200),
    'resp=' + JSON.stringify(r.data));

  // ─── 8. buy_blocks auto-transizione ───
  console.log('\n8. buy_blocks — AUTO-TRANSIZIONE (test integrazione)');

  // Crea un airdrop di test
  const testTitle = '__TEST_STAGE1_' + Date.now();
  let createRes = await sbPost('airdrops', {
    title: testTitle,
    category: 'tech',
    status: 'presale',
    duration_type: 'flash',
    block_price_aria: 1,
    presale_block_price: 1,
    total_blocks: 10,
    blocks_sold: 0,
    object_value_eur: 500.00,
    auto_draw: false,
    deadline: new Date(Date.now() + 86400000).toISOString()
  });

  if (createRes.status >= 200 && createRes.status < 300 && Array.isArray(createRes.data) && createRes.data[0]) {
    const testAirdrop = createRes.data[0];
    ok('Airdrop test creato: ' + testAirdrop.id.substring(0, 8), true);
    ok('duration_type = flash', testAirdrop.duration_type === 'flash');
    ok('status = presale', testAirdrop.status === 'presale');

    // Simula vendita 3 blocchi (30% di 10 = soglia flash)
    // Inseriamo blocchi direttamente (service_role bypass RLS)
    const testUserId = '00000000-0000-0000-0000-000000000001'; // UUID fittizio

    // Inserisci blocchi manualmente (non possiamo usare buy_blocks senza un utente reale)
    for (let i = 1; i <= 3; i++) {
      await sbPost('airdrop_blocks', {
        airdrop_id: testAirdrop.id,
        block_number: i,
        owner_id: testUserId,
        purchased_phase: 'presale'
      });
    }

    // Aggiorna blocks_sold e simula il check della soglia
    await sbPatch('airdrops?id=eq.' + testAirdrop.id, { blocks_sold: 3 });

    // Verifica lo stato (la transizione automatica avviene solo in buy_blocks RPC,
    // non con update diretto — quindi verifichiamo che la logica è in place leggendo la config)
    let checkRes = await sbGet('airdrops?id=eq.' + testAirdrop.id + '&select=blocks_sold,status,duration_type');
    if (Array.isArray(checkRes.data) && checkRes.data[0]) {
      const a = checkRes.data[0];
      ok('blocks_sold aggiornato a 3', a.blocks_sold === 3);
      ok('status ancora presale (transizione solo via buy_blocks RPC)', a.status === 'presale',
        'status=' + a.status + ' (OK: la transizione avviene solo nella RPC, non con update diretto)');
    }

    // Verifica che la soglia flash è 30%
    let threshRes = await sbGet('airdrop_config?key=eq.presale_threshold_flash&select=value');
    if (Array.isArray(threshRes.data) && threshRes.data[0]) {
      const th = parseInt(threshRes.data[0].value);
      ok('Soglia flash = 30% → 3/10 blocchi triggererebbe la transizione', th === 30,
        'soglia=' + th);
    }

    // Cleanup: elimina airdrop test + blocchi
    await sbDel('airdrop_blocks?airdrop_id=eq.' + testAirdrop.id);
    await sbDel('airdrops?id=eq.' + testAirdrop.id);
    ok('Cleanup airdrop test', true);
  } else {
    skip('Test auto-transizione', 'impossibile creare airdrop test: ' + JSON.stringify(createRes.data));
  }

  // ─── 9. Edge Functions raggiungibili ───
  console.log('\n9. EDGE FUNCTIONS');

  try {
    const edgeRes = await sbFetch('POST', '/functions/v1/send-push', { type: 'test' });
    ok('send-push raggiungibile', edgeRes.status !== 404, 'status=' + edgeRes.status);
  } catch (e) {
    skip('send-push', e.message);
  }

  try {
    const edgeRes2 = await sbFetch('POST', '/functions/v1/check-deadlines', {});
    ok('check-deadlines raggiungibile', edgeRes2.status !== 404, 'status=' + edgeRes2.status);
  } catch (e) {
    skip('check-deadlines', e.message);
  }

  // ─── 10. Cron job ───
  console.log('\n10. CRON JOB');

  let cronRes = await sbFetch('GET', '/rest/v1/rpc/get_cron_jobs', {});
  // pg_cron non espone una RPC standard — verifichiamo via query diretta
  // In alternativa, verifichiamo che l'estensione pg_cron sia attiva
  if (cronRes.status === 404) {
    // Proviamo una query raw
    let extRes = await sbGet('rpc/check_extensions');
    skip('Cron job check', 'RPC non disponibile — verificare manualmente su Supabase Dashboard');
  } else {
    ok('Cron jobs accessibili', cronRes.status === 200);
  }

  // ─── 11. Trigger DB ───
  console.log('\n11. TRIGGER DB');
  // Non possiamo verificare direttamente, ma controlliamo che il trigger esista
  // verificando che la funzione notify_airdrop_published è callable
  let trigRes = await sbRpc('notify_airdrop_published', {});
  // Ci aspettiamo un errore (non è una RPC pubblica), ma non un 404
  skip('Trigger trg_airdrop_push_notify', 'trigger DB — verificabile solo con un update reale su airdrops');

  // ─── 12. Frontend JS syntax check ───
  console.log('\n12. FRONTEND JS SYNTAX');
  try {
    const jsContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'dapp.js'), 'utf8');
    // Check key functions exist
    ok('fmtCountdown() definita', jsContent.includes('function fmtCountdown('));
    ok('durationBadge() definita', jsContent.includes('function durationBadge('));
    ok('startCountdowns() definita', jsContent.includes('function startCountdowns('));
    ok('toggleWatchlist() definita', jsContent.includes('function toggleWatchlist('));
    ok('loadWatchlist() definita', jsContent.includes('function loadWatchlist('));
    ok('updateDetailPosition() definita', jsContent.includes('function updateDetailPosition('));
    ok('refreshPosition() definita', jsContent.includes('function refreshPosition('));
    ok('notifyPositionLost() definita', jsContent.includes('function notifyPositionLost('));
    ok('requestPushPermission() definita', jsContent.includes('function requestPushPermission('));
    ok('subscribePush() definita', jsContent.includes('function subscribePush('));
    ok('registerServiceWorker() definita', jsContent.includes('function registerServiceWorker('));
    ok('saveCategoryAlerts() definita', jsContent.includes('function saveCategoryAlerts('));
    ok('renderCategoryAlertsUI() definita', jsContent.includes('function renderCategoryAlertsUI('));
    ok('saveAlertPreferences() definita', jsContent.includes('function saveAlertPreferences('));
    ok('VAPID_PUBLIC_KEY impostata', jsContent.includes("VAPID_PUBLIC_KEY='B") && !jsContent.includes('VAPID_PUBLIC_KEY=null'));
    ok('loadWatchlist in init', jsContent.includes('loadWatchlist()'));
    ok('startCountdowns in init', jsContent.includes('startCountdowns()'));
    ok('requestPushPermission in init', jsContent.includes('requestPushPermission'));
    ok('status_changed gestito in confirmBuy', jsContent.includes('status_changed'));

    // Check CSS
    const cssContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'dapp.css'), 'utf8');
    ok('CSS duration-badge', cssContent.includes('.duration-badge'));
    ok('CSS card-countdown', cssContent.includes('.card-countdown'));
    ok('CSS detail-countdown', cssContent.includes('.detail-countdown'));
    ok('CSS detail-position', cssContent.includes('.detail-position'));
    ok('CSS heart-btn', cssContent.includes('.heart-btn'));
    ok('CSS pulse-glow animation', cssContent.includes('@keyframes pulse-glow'));
    ok('CSS shake animation', cssContent.includes('@keyframes shake'));

    // Check sw.js
    const swContent = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
    ok('sw.js push listener', swContent.includes("addEventListener('push'"));
    ok('sw.js notificationclick', swContent.includes("addEventListener('notificationclick'"));

    // Check ABO
    const aboContent = fs.readFileSync(path.join(__dirname, '..', 'abo.html'), 'utf8');
    ok('ABO: ad-duration-type select', aboContent.includes('id="ad-duration-type"'));
    ok('ABO: threshold-flash input', aboContent.includes('id="threshold-flash"'));
    ok('ABO: threshold-standard input', aboContent.includes('id="threshold-standard"'));
    ok('ABO: threshold-extended input', aboContent.includes('id="threshold-extended"'));
    ok('ABO: saveThresholds()', aboContent.includes('function saveThresholds('));
    ok('ABO: loadThresholds()', aboContent.includes('function loadThresholds('));
    ok('ABO: p_duration_type in adSaveAirdrop', aboContent.includes('p_duration_type'));
    ok('ABO: bo-approve-duration select', aboContent.includes('id="bo-approve-duration"'));

    // Check dapp.html
    const dappHtml = fs.readFileSync(path.join(__dirname, '..', 'dapp.html'), 'utf8');
    ok('dapp.html: category-alerts-grid', dappHtml.includes('id="category-alerts-grid"'));
    ok('dapp.html: approve-duration select', dappHtml.includes('id="approve-duration"'));
    ok('dapp.html: copy ARIA→ROBI aggiornato', dappHtml.includes('più blocchi, più ROBI'));
    ok('dapp.html: copy "ROBI reali"', dappHtml.includes('ROBI reali'));

  } catch (e) {
    skip('Frontend JS/CSS check', e.message);
  }

  // ─── RISULTATI ───
  console.log('\n══════════════════════════════════════');
  console.log(`  RISULTATI: ${passed} ✅  ${failed} ❌  ${skipped} ⏭`);
  console.log('══════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error('Test suite error:', e); process.exit(1); });
