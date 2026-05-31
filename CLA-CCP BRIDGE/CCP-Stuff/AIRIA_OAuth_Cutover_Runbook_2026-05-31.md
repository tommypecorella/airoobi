# Runbook · AIRIA → OAuth/Max (decisione A) + igiene segreti

**Autore:** CCP (CIO/CTO) · **Data:** 31 May 2026 · **Stato:** PRONTO — la fase di cutover va eseguita **con Skeezu presente** (login OAuth interattivo + verifica round-trip Telegram). Gli step reversibili/sicuri sono già stati fatti da CCP (vedi §0).

> Perché serve Skeezu: il cutover cambia *come AIRIA si autentica*. L'unica prova vera è "AIRIA risponde ancora su Telegram". Se si rompe a operatore assente, il canale-relay di Skeezu va giù **senza nessuno che se ne accorga**. ROBY ha messo il gate esplicito: «Test OAuth funzionante PRIMA di rimuovere la key». Questo runbook lo rispetta.

---

## 0. Già fatto da CCP (sicuro/reversibile, on-host 31 May)
- ✅ **Backup** pre-cutover (perms preservati, chmod 600):
  - `~/.openclaw/agents/main/agent/auth-profiles.json.bak.pre-oauth-2026-05-31`
  - `~/.openclaw/openclaw.json.bak.pre-oauth-2026-05-31`
  - `~/.bashrc.bak.pre-keyscope-2026-05-31`
- ✅ **Igiene segreti — paid key fuori dal global export di `~/.bashrc`** (riga 115). Ora la chiave **non** è più esportata a ogni shell; caricabile on-demand con `load_anthropic_key`. Verificato: shell nuova → key assente; loader → key valida. Belt-and-suspenders per `claude -p` e anti-uso-accidentale.
- ✅ `openclaw.json` è **già `chmod 600`** (la richiesta "trattare come file segreto" è già soddisfatta at-rest).

## Fatti verificati on-host (baseline del cutover)
- Il **servizio gateway** (`openclaw-gateway.service`, systemd user) **NON ha `ANTHROPIC_API_KEY` nel suo env** (nessun `Environment=`/`EnvironmentFile=`). → "togliere la key dall'env del servizio" è **già vero / no-op**: il servizio non l'ha mai avuta.
- Il costo di AIRIA viene da **`auth-profiles.json` → profilo `anthropic:default` `type:api_key`** (la paid key inline). È **questo** il rubinetto, non l'env di bashrc.
- **Verificato:** anche con `env -u ANTHROPIC_API_KEY`, il modello di default `anthropic/claude-sonnet-4-6` risolve **ancora** sul profilo `api_key` (paid). → *Rimuovere l'env key da sola NON basta*. Serve un profilo OAuth nello store **oppure** spostare il runtime su `claude-cli`.
- **`claude` CLI native auth è sana:** `subscriptionType: max`, scope `user:inference`, **refreshToken presente** (auto-refresh). È la credenziale che `claude-cli` riuserebbe.

---

## Scegliere il path (A)

### Path A1 — OAuth nativo nello store OpenClaw  *(quello che ROBY descrive)*
Aggiunge un profilo **oauth** al provider `anthropic`; il default risolve su subscription.
```bash
# 1) login OAuth (INTERATTIVO: apre URL/device code → Skeezu autorizza)
openclaw models auth login            # provider: anthropic → flusso OAuth
# 2) verifica: oauth deve diventare > 0
openclaw models auth list
openclaw models status | grep -iE 'oauth|api_key|source|default'
#    atteso: profiles=… (oauth>0 …) e default che risolve su subscription, non su api_key
```
- **Caveat:** token subscription scade → re-login `claude/openclaw` a mano ogni tanto; no prompt-caching; auth per-agente.

### Path A2 — runtime `claude-cli`  *(reco CCP: nessun login nuovo)*
Riusa la OAuth/Max già presente in `~/.claude/.credentials.json` puntando il runtime di AIRIA su `claude-cli` (provider `synthetic=plugin-owned · source=Claude CLI native auth`). **Niente login interattivo**, ma va **testato** che gli agent-turn del gateway funzionino via claude-cli.
```bash
# imposta il runtime/modello su claude-cli (verifica nomi esatti prima):
openclaw models list                  # trova l'id modello claude-cli
openclaw models set <claude-cli-model-id>   # oppure agentRuntime.id=claude-cli in openclaw.json
openclaw models status | grep -iE 'claude-cli|native|source|default'
```
- **Pro:** zero login, riusa Max esistente (auto-refresh). **Contro:** comportamento runtime diverso da provider API; va validato un turn reale.

---

## Procedura di cutover (con Skeezu) — entrambi i path
1. **Pre-check:** `openclaw status` (gateway active), AIRIA risponde su Telegram **adesso** (baseline "prima").
2. **Applica** A1 *oppure* A2 (sopra). **NON** toccare ancora `auth-profiles.json`.
3. **Riavvia il gateway:** `systemctl --user restart openclaw-gateway.service` → `openclaw status`.
4. **VERIFICA (il gate di ROBY):** manda un messaggio a AIRIA su Telegram → **deve rispondere**. Conferma su Console→Usage che non parte una chiamata sulla paid key.
5. **Solo se 4 OK** → rendi permanente / rimuovi il profilo paid:
   - A1: lascia oauth come default; puoi tenere `api_key` come **failover scoped** (non globale, non in chiaro) o rimuoverlo da `auth-profiles.json`.
   - tieni il **valore della key in backup sicuro** (è già nel `.bak` chmod 600). È reversibile.
6. **Igiene Telegram (opzionale, stessa sessione):** OpenClaw supporta `TELEGRAM_BOT_TOKEN` via env (verificato nel dist).
   - sposta il `botToken` da `openclaw.json` a env del servizio (es. `EnvironmentFile=` chmod 600), svuota il campo nel json, **restart**, **ri-verifica Telegram**.

## Rollback (se la verifica #4 fallisce)
```bash
cp ~/.openclaw/agents/main/agent/auth-profiles.json.bak.pre-oauth-2026-05-31 \
   ~/.openclaw/agents/main/agent/auth-profiles.json
cp ~/.openclaw/openclaw.json.bak.pre-oauth-2026-05-31 ~/.openclaw/openclaw.json
systemctl --user restart openclaw-gateway.service
openclaw models status            # torna su api_key
# (bashrc: cp ~/.bashrc.bak.pre-keyscope-2026-05-31 ~/.bashrc  — solo se serve ripristinare il global export)
```

## Nota quota (vale per A1 e A2)
Con (A), AIRIA + ROBLOCK + CCP + dispatcher `/ago` finiscono **tutti sulla stessa quota Max** → soffitto condiviso più carico. I freni del dispatcher (`cap wake/ora`, flock, batch, RAM-guard, toggle OFF) contano di più. Dosare.

---
— **CCP** · 31 May 2026 · backup+igiene fatti; cutover OAuth gated su Skeezu-presente (login interattivo + verifica Telegram).
