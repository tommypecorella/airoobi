#!/usr/bin/env node
// ══════════════════════════════════════════════════
// AIROOBI — Auto Draw Cron
// Ogni 15 minuti chiama la RPC check_auto_draw()
// che trova airdrop con auto_draw=true + deadline scaduta
// e esegue il draw per ciascuno.
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

const TIMEOUT_MS = 30000;

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
        if (res.statusCode >= 400) {
          reject(new Error('HTTP ' + res.statusCode + ': ' + data.substring(0, 300)));
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Parse error: ' + data.substring(0, 200))); }
      });
    });

    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error('Request timeout after ' + TIMEOUT_MS + 'ms'));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  log('INFO', '── Auto Draw check start ──');

  try {
    // Chiama la RPC check_auto_draw che fa tutto server-side
    // Usa p_service_call=true internamente per bypassare admin check
    const result = await rpc('check_auto_draw', {});

    if (!result || !result.ok) {
      log('WARN', 'check_auto_draw failed: ' + JSON.stringify(result));
      return;
    }

    if (result.draws_processed === 0) {
      log('INFO', 'Nessun airdrop da processare');
    } else {
      log('INFO', result.draws_processed + ' draw processati');
      if (result.results) {
        result.results.forEach(r => {
          const res = r.result || {};
          log('INFO', '  → ' + r.title + ': ' +
            (res.ok ? 'OK (success=' + res.success + ', winner=' + (res.winner_id || 'nessuno') + ')' :
             'FAILED (' + (res.error || 'unknown') + ')'));
        });
      }
    }
  } catch (e) {
    log('ERROR', 'Auto draw error: ' + e.message);
  }

  log('INFO', '── Auto Draw check end ──');
}

main().catch(e => {
  log('ERROR', 'Unhandled error: ' + e.message);
  process.exit(1);
});
