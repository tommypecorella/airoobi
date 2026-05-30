#!/usr/bin/env node
/* =====================================================================
 * CCP · ingest_files_to_agora.mjs — Fase E (file explorer AIgorà)
 * Cammina il tree di CLA-CCP BRIDGE/ e registra OGNI file in agora.files:
 *  - testo (md/sql/html/js/css/ts/txt/json/xml/mjs/sh/...) → body inline (cap 512KB)
 *  - binari (docx/pdf/png/jpg/pptx/xlsx/zip/...) → solo metadati + percorso
 *
 * NON DISTRUTTIVO: legge in-place, non sposta/cancella nulla.
 * Idempotente: upsert per path.
 *
 * Uso:  AGORA_KEY="<anon key agora>" node ingest_files_to_agora.mjs [--root <path>]
 * La key NON è nel file (bearer secret): via env a runtime.
 * ===================================================================== */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const URL_BASE = process.env.AGORA_URL || 'https://tktuwboayqqimdhsrnap.supabase.co';
const KEY = process.env.AGORA_KEY;
if (!KEY) { console.error('ERRORE: manca AGORA_KEY (anon key agora) via env.'); process.exit(1); }

const here = dirname(fileURLToPath(import.meta.url));
const rootArg = process.argv.indexOf('--root');
const ROOT = rootArg > -1 ? process.argv[rootArg + 1] : join(here, '..', '..'); // CLA-CCP BRIDGE/

const EXCLUDE_DIRS = new Set(['.git', '_backups', '_archive', 'node_modules', '.vercel']);
const TEXT_EXT = new Set(['md','sql','html','htm','js','mjs','ts','css','txt','json','xml','sh','csv','yml','yaml','vercelignore','gitkeep','env']);
const BODY_CAP = 512 * 1024;

function authorOf(name) {
  const p = name.split('_')[0].toUpperCase();
  return ['CCP','ROBY','ARO','AIRIA','ROBLOCK'].includes(p) ? p : null;
}

function walk(dir, acc = []) {
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory()) {
      if (EXCLUDE_DIRS.has(d.name)) continue;
      walk(join(dir, d.name), acc);
    } else if (d.isFile()) {
      acc.push(join(dir, d.name));
    }
  }
  return acc;
}

const files = walk(ROOT);
console.log(`ROOT = ${ROOT}\nfile trovati: ${files.length}`);

const rows = files.map(full => {
  const rel = relative(ROOT, full).split('\\').join('/');
  const name = basename(full);
  const ext = extname(name).slice(1).toLowerCase() || (name.startsWith('.') ? name.slice(1) : '');
  const area = rel.includes('/') ? rel.split('/')[0] : 'root';
  const size = statSync(full).size;
  const isText = TEXT_EXT.has(ext);
  let body = null;
  if (isText && size <= BODY_CAP) { try { body = readFileSync(full, 'utf8'); } catch { body = null; } }
  return { path: rel, name, ext, area, author: authorOf(name), size_bytes: size, is_text: isText, body };
});

async function upsertBatch(batch) {
  const res = await fetch(`${URL_BASE}/rest/v1/files?on_conflict=path`, {
    method: 'POST',
    headers: {
      apikey: KEY, Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json', 'Content-Profile': 'agora',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(batch),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
}

const SIZE = 40;
let done = 0;
for (let i = 0; i < rows.length; i += SIZE) {
  await upsertBatch(rows.slice(i, i + SIZE));
  done += Math.min(SIZE, rows.length - i);
  console.log(`upsert ${done}/${rows.length}`);
}
console.log(`✓ ingest completato: ${done} file in agora.files`);
