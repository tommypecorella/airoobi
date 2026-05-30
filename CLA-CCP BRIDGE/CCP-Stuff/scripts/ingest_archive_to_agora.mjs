#!/usr/bin/env node
/* =====================================================================
 * CCP · ingest_archive_to_agora.mjs — Fase D (archivio AIgorà)
 * Legge for-CCP/*.md, parsa il frontmatter (title/date/audience/status)
 * + corpo, e fa UPSERT in agora.archive (PK=filename) via REST.
 *
 * NON DISTRUTTIVO: legge i file in-place, non sposta/cancella nulla.
 * (Lo spostamento fisico è archive_for_ccp_rounds.sh = blacklist #8, a parte.)
 * Idempotente: ri-eseguibile, aggiorna le righe esistenti per filename.
 *
 * Uso:  AGORA_KEY="<anon key agora>" node ingest_archive_to_agora.mjs [--dir <path>]
 * La key NON è nel file (bearer secret): si passa via env a runtime.
 * ===================================================================== */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const URL_BASE = process.env.AGORA_URL || 'https://tktuwboayqqimdhsrnap.supabase.co';
const KEY = process.env.AGORA_KEY;
if (!KEY) { console.error('ERRORE: manca AGORA_KEY (anon key agora) via env.'); process.exit(1); }

const here = dirname(fileURLToPath(import.meta.url));
const dirArg = process.argv.indexOf('--dir');
const SRC = dirArg > -1 ? process.argv[dirArg + 1]
                        : join(here, '..', '..', 'ROBY-Stuff', 'for-CCP');

function kindOf(fn) {
  const p = fn.split('_')[0].toUpperCase();
  return ['CCP', 'ROBY', 'ARO', 'AIRIA', 'ROBLOCK'].includes(p) ? p : 'other';
}

// title fallback: primo heading markdown del corpo se manca nel frontmatter
function firstHeading(body) {
  const m = (body || '').match(/^#{1,3}\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

// parse YAML-ish frontmatter (--- ... ---) -> {meta, body}
function parse(raw) {
  const meta = {};
  let body = raw;
  if (raw.startsWith('---')) {
    const end = raw.indexOf('\n---', 3);
    if (end > -1) {
      const fm = raw.slice(3, end).trim();
      body = raw.slice(end + 4).replace(/^\s*\n/, '');
      for (const line of fm.split('\n')) {
        const m = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
        if (m) meta[m[1].toLowerCase()] = m[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return { meta, body };
}

const files = readdirSync(SRC, { withFileTypes: true })
  .filter(d => d.isFile() && d.name.endsWith('.md'))
  .map(d => d.name);

console.log(`SRC = ${SRC}\nfile .md trovati: ${files.length}`);

const rows = files.map(fn => {
  const { meta, body } = parse(readFileSync(join(SRC, fn), 'utf8'));
  return {
    filename: fn,
    kind: kindOf(fn),
    title: meta.title || firstHeading(body) || null,
    audience: meta.audience || null,
    status: meta.status || null,
    doc_date: meta.date || null,
    body,
  };
});

async function upsertBatch(batch) {
  const res = await fetch(`${URL_BASE}/rest/v1/archive?on_conflict=filename`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      'Content-Profile': 'agora',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(batch),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
}

const SIZE = 50;
let done = 0;
for (let i = 0; i < rows.length; i += SIZE) {
  const batch = rows.slice(i, i + SIZE);
  await upsertBatch(batch);
  done += batch.length;
  console.log(`upsert ${done}/${rows.length}`);
}
console.log(`✓ ingest completato: ${done} righe in agora.archive`);
