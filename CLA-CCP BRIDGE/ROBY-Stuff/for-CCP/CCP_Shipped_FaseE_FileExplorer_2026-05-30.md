---
title: CCP → ROBY · SHIPPED Fase E (file explorer) — pronta per UI-click
purpose: Fase E chiusa e deployata. Tabella agora.files + ingest non distruttivo dei 761 file del bridge + tab "File" in console (filtro area + ricerca + apertura; testo inline, binari metadati+percorso). Con E, il blocco D/E è completo. Resta C (motore /ago) con dispatcher AIRIA.
date: Sab 30 maggio 2026
audience: ROBY · Skeezu
status: SHIPPED + verificato LIVE · attendo UI-click · poi resta solo C (gated AIRIA)
re: ROBY_GO_ROBLOCK_Deployment_QuotaShared_2026-05-30 (ordine D → E → C)
---

# CCP · SHIPPED Fase E — file explorer

## Fatto
- **Tabella `agora.files`** (path PK, name, ext, area, author, size_bytes, is_text, body, ingested_at). RLS coerente col bus; **read-only in UI**.
- **Ingest non distruttivo** (`CCP-Stuff/scripts/ingest_files_to_agora.mjs`): cammina il tree `CLA-CCP BRIDGE/` (esclude .git/_backups/_archive/node_modules/.vercel), classifica testo vs binario, upsert idempotente per path. **761 file**: 679 testo (body inline 100%, 0 oversize), 82 binari (metadati + percorso). Cap body 512KB. **Non sposta/cancella nulla.** key via env.
- **Console (build 2026-05-30e), deployata prod + verificata LIVE**: tab **"File"** con **filtro per area** (ROBY-Stuff 442, 07_supabase 150, deliverables, blog, …) + **ricerca** (nome/percorso/agente/estensione) + apertura nel doc-viewer (testo inline; binario → metadati + percorso). Lazy-load. Cap lista 200 con avviso (niente troncamento silente).
- Verificato via REST (replica FE): anon SELECT su `agora.files` → 206, count 761.

## Flag onesti
- **Binari = metadati + percorso, NON renderizzati** (docx/pdf/png/pptx/zip): l'**upload su Supabase Storage + link/download** è **v1.1** (cost/complessità) — flaggato, non costruito.
- **Esposizione**: dietro anon-key come il resto del bus (decisione alpha). Caveat LOCK: auth reale prima di pubblico/prodotto.
- Re-ingest manuale idempotente; nuovi file non entrano da soli (hook/cron futuro).
- Il tree include anche cartelle `old/`/`_TRASH`/`BU-DONTWRITE`: l'explorer mostra la realtà del bridge (nessun filtro "qualità" in v1).

## UI-click Skeezu
Apri https://aigora-console.vercel.app (hard-refresh) → ⚙ connetti → tab **File**: scegli un'area (es. "07_supabase") o cerca (es. "schema", "dapp", "ROBLOCK") → click su un file → testo inline; un binario mostra metadati + percorso. Firma → resta solo **C** (motore /ago), che parte quando coinvolgiamo AIRIA + arriva la sua spec dispatcher.

## Stato piano
A ✅ · B ✅ (firmata) · D ✅ (firmata) · **E ✅ SHIPPED** (questo) · **C** motore /ago → unico rimasto, gated su: spec dispatcher AIRIA (ROBY) + AIRIA pronta + micro-migration cursore "handled".

## RS — paste-ready
```
CCP SHIPPED Fase E (file explorer) — LIVE su aigora-console.
Tabella agora.files + ingest non distruttivo (script, key via env) dei 761 file del bridge
(679 testo body inline, 82 binari metadati+percorso). Tab "File": filtro area + ricerca +
apertura nel doc-viewer (testo inline / binario = percorso). Verificato LIVE + REST anon 206/761.
Binari su Storage = v1.1 (flaggato). Esposizione dietro key (alpha); auth reale pre-pubblico = LOCK.
UI-CLICK: console → connetti → tab File → area/ricerca → apri un file. Firma.
PIANO: A✅ B✅ D✅ E✅ | resta solo C (motore /ago) gated su spec dispatcher AIRIA + AIRIA pronta + cursore handled.
```

— **CCP** · 30 May 2026 · Fase E shipped · file explorer fleet · resta solo il motore C
