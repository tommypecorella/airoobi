#!/usr/bin/env node
// ══════════════════════════════════════════════════
// AIROOBI — Auto Draw Cron
// Ogni 15 minuti controlla airdrop con auto_draw=true
// e deadline scaduta, poi esegue il draw.
//
// Comando: node /home/drskeezu/projects/airoobi/scripts/auto_draw.js
//
// Env vars required (in .env at project root):
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY
// ══════════════════════════════════════════════════

const https = require('https');
const path = require('path');
const fs = require('fs');

// ── Load .env ──
const envPath = path.join(__dirname, '..', '.env');
try {
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
  log('ERROR', 'Cannot read .env: ' + e.message);
  process.exit(1);
}

const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SB_URL || !SB_SERVICE_KEY) {
  log('ERROR', 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

function log(level, msg) {
  const ts = new Date().toISOString();
  console.log('[' + ts + '] [' + level + '] ' + msg);
}

function rpc(fnName, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(SB_URL + '/rest/v1/rpc/' + fnName);
    const body = JSON.stringify(params || {});
    const options = {
      method: 'POST',
      headers: {
        'apikey': SB_SERVICE_KEY,
        'Authorization': 'Bearer ' + SB_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(url, options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Parse error: ' + data.substring(0, 200))); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  log('INFO', '── Auto Draw check start ──');

  try {
    // Find airdrops with auto_draw=true, deadline passed, not yet drawn
    const url = new URL(SB_URL + '/rest/v1/airdrops');
    url.searchParams.set('auto_draw', 'eq.true');
    url.searchParams.set('draw_executed_at', 'is.null');
    url.searchParams.set('status', 'in.(sale,presale,active)');
    url.searchParams.set('deadline', 'lte.' + new Date().toISOString());
    url.searchParams.set('select', 'id,title,deadline,status');

    const airdrops = await new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        headers: {
          'apikey': SB_SERVICE_KEY,
          'Authorization': 'Bearer ' + SB_SERVICE_KEY
        }
      };
      const req = https.request(url, options, res => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error('Parse error')); }
        });
      });
      req.on('error', reject);
      req.end();
    });

    if (!airdrops || !airdrops.length) {
      log('INFO', 'Nessun airdrop da processare');
      return;
    }

    log('INFO', airdrops.length + ' airdrop da processare');

    for (const a of airdrops) {
      log('INFO', 'Eseguo draw per: ' + a.title + ' (id: ' + a.id + ')');
      try {
        const result = await rpc('execute_draw', { p_airdrop_id: a.id });
        if (result && result.ok) {
          log('INFO', 'Draw OK — success=' + result.success +
            ', winner=' + (result.winner_id || 'nessuno') +
            ', ARIA=' + result.aria_incassato +
            ', NFT=' + result.nft_distribuiti);
        } else {
          log('WARN', 'Draw failed: ' + JSON.stringify(result));
        }
      } catch (e) {
        log('ERROR', 'Draw error per ' + a.id + ': ' + e.message);
      }
    }
  } catch (e) {
    log('ERROR', 'Auto draw error: ' + e.message);
  }

  log('INFO', '── Auto Draw check end ──');
}

main();
