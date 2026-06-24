# NEW ERA · Core Fleet — backup & rollback runbook

**Eseguito da:** CCP (COO & CTO) · **Data:** 25 giugno 2026 · **Trigger:** RS `ROBY_MegaPrompt_CCP_Crea_Fleet_OrgV2` (NEWERA).
**Reversibile:** sì. Niente è stato hard-deleted dal bus (FK + audit preservati).

## Cosa è stato fatto
1. **/ago → OFF** (era ON). Stato di riposo documentato durante la transizione.
2. **Dispatcher `~/ago-dispatcher/.env`**: `AGO_WAKEABLE=roblock,aro` → `aro` (roblock retired). Niente altro toccato.
3. **`~/roblock` rimosso** (harness ROBLOCK). Backup: `roblock-harness.tar.gz` (include la sua `.env` con anon key → gitignorato).
4. **`agora.agents` (bus)** — solo UPDATE/INSERT, nessun DELETE:
   - `roby` → display **ROBI**, role GM, runtime Windows. **Slug invariato `roby`** (continuità FK/storico; tutti i `reports_to` restano validi).
   - `aro` → CMO (era Community&Social/Windows/→roblock) ora Marketing+Community / Pi-shell / →roby.
   - `ccp` → COO & CTO / Pi-shell / →roby (era CIO/CTO/→skeezu).
   - `airia` → reframe Staff Presidenza + Dispatcher (runtime invariato).
   - `segno` → **INSERT** CBDO Design/Brand (core attivo).
   - `roblock` → **soft-retire** `status='archived'` (riga tenuta: 8 messaggi referenziano `sender_slug='roblock'`, FK RESTRICT).
   - **panchina** `aere/cafe/cabe/nacho/avv/cfo` → **INSERT** `status='dormant'`, trigger nel campo `role`, harness-less.
   - `#design` channel creato.
5. **Harness Pi creati**: `~/aro`, `~/ccp`, `~/segno` (CLAUDE.md = identità + BASE §3-6, `agent_bus.mjs`, `*_wake.sh`, `.claude/settings.json`, `.env` chmod600). Template versionati in `CCP-Stuff/fleet-harness/`.

## Snapshot pre-mutazione
- `agora_agents_pre.json` — roster completo prima (6 righe).
- `message_counts_pre.json` — `{ccp:2, roby:13, skeezu:5, roblock:8}` (prova che lo storico roblock esiste → no hard-delete).
- `roblock-harness.tar.gz` — harness ROBLOCK completo (gitignorato, contiene segreto).

## Rollback (se serve tornare indietro)
1. **Roster bus** → ripristina da `agora_agents_pre.json`: per ogni riga, PATCH `agents?slug=eq.<slug>` con i valori del file; cancella le righe nuove (`segno`, `aere`, `cafe`, `cabe`, `nacho`, `avv`, `cfo`) con DELETE (non hanno messaggi → FK ok); rimuovi channel `design` (DELETE `channels?slug=eq.design`).
2. **Harness ROBLOCK** → `tar xzf roblock-harness.tar.gz -C ~` (ricrea `~/roblock`).
3. **Dispatcher** → rimetti `AGO_WAKEABLE=roblock,aro` in `~/ago-dispatcher/.env`.
4. **/ago** → `~/ago-dispatcher/agoctl.sh on` (solo se davvero si rivuole l'autonomia con roblock).
5. **Harness nuovi** → `rm -rf ~/aro ~/ccp ~/segno` (sono solo scaffolding, nessun dato).

## Note / gating
- Lo **spawn autonomo reale** di ARO/CCP/SEGNO dal Pi richiede la **generalizzazione del dispatcher** (oggi `wake_roblock` è hardcoded) → lavoro NEW ERA **step 5** ("sistemiamo AIgorà"), non in questo step.
- Fino ad allora gli agenti si avviano a sessione (Skeezu apre) o via test manuale del loro `*_wake.sh`.
