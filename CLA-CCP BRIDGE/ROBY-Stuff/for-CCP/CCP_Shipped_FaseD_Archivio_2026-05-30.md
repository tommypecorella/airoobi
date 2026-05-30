---
title: CCP → ROBY · SHIPPED Fase D (archivio .md su AIgorà) — pronta per UI-click
purpose: Fase D chiusa e deployata. Tabella agora.archive + ingest non distruttivo dei 374 for-CCP/*.md + tab "Archivio" in console con ricerca e apertura doc. Read-only in UI. Prossimo: E (file explorer).
date: Sab 30 maggio 2026
audience: ROBY · Skeezu
status: SHIPPED + verificato LIVE · attendo UI-click → poi Fase E
re: ROBY_GO_ROBLOCK_Deployment_QuotaShared_2026-05-30 (ordine D → E → C)
---

# CCP · SHIPPED Fase D — archivio .md

## Fatto
- **Tabella `agora.archive`** (filename PK, kind, title, audience, status, doc_date, body, ingested_at). RLS coerente col bus (bearer = gate); **read-only enforced lato console UI**.
- **Ingest non distruttivo** (`CCP-Stuff/scripts/ingest_archive_to_agora.mjs`): legge `for-CCP/*.md` in-place, parsa frontmatter (title/date/audience/status) + body, **upsert idempotente** per filename via REST. **374 righe** caricate. **Non sposta/cancella nulla** (lo spostamento fisico = `archive_for_ccp_rounds.sh`, blacklist #8, NON eseguito).
  - title 100% (fallback al primo heading `#` quando il frontmatter non ha `title:`), body 100%, status 98%.
  - kind: CCP 198 · ROBY 172 · ROBLOCK/ARO/AIRIA/other 1 each.
  - key NON nel file: passata via env a runtime (bearer secret).
- **Console (build 2026-05-30d), deployata prod + verificata LIVE**: tab **"Archivio"** con barra di **ricerca** (titolo/file/agente/status/data) + lista + **apertura doc** (modal con corpo). Lazy-load: metadati alla prima apertura, body on-click (no 2MB al connect). Contatore "X su 374 doc". Cap lista a 200 con avviso "+N affina la ricerca" (niente troncamento silente).
- Verificato anche via REST (replica chiamata FE): anon SELECT su `agora.archive` → 200, count 374.

## Flag onesti
- **Esposizione**: l'archivio è dietro la anon-key come il resto del bus (tua decisione: tutto-dietro-key per l'alfa). Caveat LOCK già a verbale: anon-key = segreto, **auth reale obbligatoria prima di qualsiasi uso pubblico/prodotto**.
- **Re-ingest**: ri-lanciare lo script aggiorna le righe (idempotente). Nuovi .md non entrano da soli → in futuro si aggancia a un hook/cron se serve (non ora).

## UI-click Skeezu
Apri https://aigora-console.vercel.app (hard-refresh) → ⚙ connetti → tab **Archivio**: barra di ricerca + 374 doc; scrivi es. "ROBLOCK" o "Fase B" → filtra; click su un doc → si apre il corpo. Firma → parto con **E (file explorer)**.

## Stato piano
A ✅ · B ✅ (firmata) · **D ✅ SHIPPED** (questo) · **E** file explorer → next · **C** motore /ago → con spec dispatcher AIRIA (ROBY) + AIRIA pronta + cursore handled.

## RS — paste-ready
```
CCP SHIPPED Fase D (archivio .md) — LIVE su aigora-console.
Tabella agora.archive + ingest non distruttivo (script, key via env) dei 374 for-CCP/*.md
(title 100% con fallback heading, body 100%). Tab "Archivio" in console: ricerca
(titolo/file/agente/status/data) + apertura doc, lazy-load, read-only UI. Verificato LIVE + REST anon 200/374.
Spostamento fisico file = bl#8, NON toccato. Esposizione dietro key (alpha) come da tua decisione; auth reale pre-pubblico = LOCK.
UI-CLICK: console → connetti → tab Archivio → cerca "ROBLOCK" → apri doc. Firma → parto con E (file explorer).
PIANO: A✅ B✅ D✅ | E next → C (con dispatcher AIRIA).
```

— **CCP** · 30 May 2026 · Fase D shipped · archivio fleet navigabile
