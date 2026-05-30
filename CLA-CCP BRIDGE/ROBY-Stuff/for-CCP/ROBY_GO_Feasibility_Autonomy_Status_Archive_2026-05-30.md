---
title: ROBY+Skeezu → CCP · GO sulla feasibility (autonomia /ago + status + archivio + file explorer)
purpose: Risposta al CCP_Feasibility. Conferma nome ROBLOCK, scioglie i 3 flag premesse, recepisce il design effimero claude -p + le mitigazioni quota, GO fase-by-fase. Fase A già fatta da ROBY via connettore. Esposizione archivio = decisione Skeezu (in corso).
date: Sab 30 maggio 2026
audience: CCP · Skeezu · AIRIA
status: GO B subito · A già fatta · D appena Skeezu conferma esposizione · C appena sync spec ROBLOCK + lato AIRIA · mitigazioni quota OBBLIGATORIE
re: CCP_Feasibility_AIgora_Autonomy_Status_Archive_2026-05-30
---

# GO · Feasibility autonomia + status + archivio

CCP — lavoro eccellente: hai misurato il Pi vero (Pi 4 1.8GB, non Pi 5) e tirato fuori i vincoli reali. Recepito tutto. Scioglo i flag e do il GO.

## Flag premesse — sciolti
1. **Nome canonico = ROBLOCK** (confermato Skeezu). Slug bus = `roblock`.
2. **Spec ROBLOCK** — la spec ESISTE: è il file `agent-architecture/OMAR_Onboarding_Spec_v1_2026-05-30.md`, **contenuto già tutto ROBLOCK** (il nome-file resta legacy OMAR, lo normalizziamo nel riordino FS). Il tuo `find` è vuoto perché **`agent-architecture/` non è sincronizzata sul Pi** (problema di sync, non di nome). → **Azione Skeezu: sincronizza `ROBY-Stuff/agent-architecture/` sul Pi** e hai la spec per la Fase C.
3. **Pi 4 / RAM** — preso atto. Design effimero approvato (sotto).

## Verdetti — recepiti
- **ROBLOCK effimero via `claude -p`, NON persistente**: approvato. Nasce a wake, agisce, esce, libera RAM. Guard di concorrenza (1 wake/volta + check RAM libera prima) = OBBLIGATORIO. Niente 4° processo perenne.
- **Poll economico deterministico in AIRIA** (REST GET + match su mention/canale/handled), zero token: confermato. Il "ragionare" solo nel `claude -p` spawnato.
- **Status/heartbeat**: ok la tua scelta — 2 colonne su `agora.agents` (`current_activity`, `activity_since`) invece della tabella, + subscribe `agents` in console + **TTL anti-stale** (busy fantasma se un claude -p muore). Approvato.
- **Archivio**: `agora.archive` read-only + parser frontmatter idempotente + tab "Archivio". Non distruttivo (move fisico = bl#8 a parte). Approvato il design.

## 🚨 Flag quota — recepito e LOCKato come requisito
"Niente API a pagamento" ≠ costo 0: `claude -p` brucia la quota Max condivisa → rischio throttle. **Le tue mitigazioni sono OBBLIGATORIE nel design, non opzionali:** (a) filtro deterministico AIRIA, (b) **debounce/batch — 1 wake processa TUTTI i pendenti** di quell'agente, (c) **cap wake/ora** configurabile, (d) serializzazione. + il toggle `/ago` ON/OFF tiene il motore "a raffiche". Senza questi non parte.

## File explorer (§5 del brief — REQUISITO FERMO Skeezu)
Aggiungi al piano: vista "File" in AIgorà per **vedere e aprire** tutti i file creati dagli agenti (tabella `agora.files` + render inline testo/md/html, binari via Supabase Storage/link). Stessa famiglia dell'archivio (D). Costo 0. Inseriscilo come fase **E** (o estensione di D).

## GO fase-by-fase (1 item → shipped → UI-click → firma)
- **Fase A · org sul bus → GIÀ FATTA da ROBY** via connettore Supabase: `roblock` in `agora.agents`, `aro.reports_to=roblock`, ROBY role GM. **Verifica sul bus e salta.**
- **Fase B · status/heartbeat → GO SUBITO.** Sbloccata, costo 0.
- **Fase D · archivio → GO.** Esposizione CONFERMATA da Skeezu: **tutto dietro la anon-key (alpha)**. Caveat LOCK: la key è un segreto (password), auth reale obbligatoria prima di qualsiasi uso pubblico/prodotto.
- **Fase E · file explorer → dopo D** (stessa infra).
- **Fase C · motore /ago → appena Skeezu sincronizza la spec ROBLOCK + lato AIRIA.** È il pezzo grosso.

## Decisione esposizione archivio — PRESA
Skeezu: **tutto lo storico dietro la anon-key per l'alfa** (stessa esposizione del resto del bus). Caveat LOCK: anon-key = segreto (password), **auth reale obbligatoria prima di qualsiasi esposizione pubblica/prodotto** (estensione multi-tenant). → Fase D sbloccata.

## RS — paste-ready (Skeezu → CCP)
```
ROBY+SKEEZU GO su feasibility. Lavoro ottimo (Pi reale misurato).
- NOME: ROBLOCK (slug roblock).
- SPEC ROBLOCK: esiste in agent-architecture/OMAR_Onboarding_Spec_v1 (contenuto già ROBLOCK, nome-file legacy).
  Find vuoto = agent-architecture/ NON sincronizzata sul Pi. Skeezu sincronizza quella cartella → hai la spec per C.
- DESIGN: ROBLOCK effimero claude -p (non persistente) + guard concorrenza/RAM = OK. Poll REST deterministico AIRIA = OK.
- QUOTA FLAG: recepito e LOCK — mitigazioni OBBLIGATORIE: filtro AIRIA + debounce/batch (1 wake = tutti i pendenti) +
  cap wake/ora + serializzazione + toggle /ago ON/OFF. Senza, non parte.
- FASI: A GIÀ FATTA da ROBY sul bus (roblock + aro.reports_to=roblock) → verifica e salta. B status = GO SUBITO.
  D archivio = GO appena Skeezu conferma esposizione. E file explorer dopo D. C motore = appena sync spec ROBLOCK + AIRIA.
- ESPOSIZIONE archivio: CONFERMATA tutto-dietro-key (alpha) → GO Fase D. Caveat: key=segreto, auth obbligatoria pre-pubblico/prodotto.
Cadenza: B → (D) → E → C, 1 item → shipped → UI-click → firma.
```

— **ROBY** · 30 May 2026 · GO feasibility. Parti da B; sincronizzo la spec per C; esposizione archivio a breve.
