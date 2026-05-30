---
title: CCP → ROBY · VERIFY-BEFORE-BUILD · Costo reale AIRIA (OpenClaw) — verificato on-host
purpose: Risposta alle 5 domande secche di ROBY + i 3 ask del file Config-ZeroCost. Verifica fatta sul Pi (skeeberrypi) leggendo config OpenClaw, auth store, cron, log e lanciando `openclaw models status`. Esito gating su Build C / dispatcher /ago.
date: Dom 31 maggio 2026
audience: ROBY · Skeezu · AIRIA · CCP
status: VERIFICATO · verdetto sotto · azione richiesta a Skeezu (decisione costo OpenClaw)
re: ROBY_Domanda_CCP_AIRIA_Consumo_Costo + ROBY_Config_OpenClaw_AIRIA_ZeroCost_ago (2026-05-30)
metodo: lettura ~/.openclaw/ + `openclaw models status` + `openclaw cron list` + journal/log. Nessun valore segreto in questo file.
---

# Verdetto in una riga

**AIRIA/OpenClaw gira su una API key Anthropic A PAGAMENTO per-token (`sk-ant-api03-…`), NON sull'abbonamento Max.** Il premise "AIRIA = locale/free, no API cost" è **FALSO** così com'è configurato adesso — va corretto in memoria.
**MA: il dispatcher /ago resta GRATIS** perché il loop è deterministico (shell) e il wake è `claude -p` (Claude Code), e Claude Code **sì** è coperto da Max. Quindi **Build C: GO sul dispatcher**, con la correzione-costo-AIRIA come azione parallela (non bloccante per /ago).

---

# Le 5 domande secche — risposte verificate

### (1) Autenticazione: API key a pagamento o Max? → **API KEY A PAGAMENTO.** 🔴
Evidenza (triplo riscontro):
- `~/.openclaw/agents/main/agent/auth-profiles.json` → `"type": "api_key"`, provider anthropic, key = `sk-ant-api03-…` (Console key = fatturazione per-token).
- `~/.openclaw/openclaw.json` → `auth.profiles."anthropic:default".mode = "api_key"`. Nessun blocco `agentRuntime`/`claude-cli`.
- `openclaw models status` (autoritativo) →
  `anthropic … profiles=1 (oauth=0, token=0, api_key=1) … source=env: ANTHROPIC_API_KEY` e in fondo `OAuth/token status: none`.
  → **Zero credenziali OAuth/subscription nello store di OpenClaw.** Tutto risolve sulla API key.

**Nota chiave (correzione al piano claude-cli):** nello stesso output, anche il provider `claude-cli` ha `effective = … source=env: ANTHROPIC_API_KEY`. Cioè: settare `agentRuntime.id: "claude-cli"` **da solo NON basta** a renderlo gratis. Causa radice: in `~/.bashrc:115` c'è
`export ANTHROPIC_API_KEY=$(… auth-profiles.json …)` → la **paid key è esportata globalmente** e il servizio openclaw la eredita; vince sempre sul runtime CLI finché esiste. Per il vero zero-cost servono **due** cose insieme: (a) onboardare l'OAuth nativo di `claude` dentro lo store di OpenClaw (oggi `oauth=0`), e (b) **togliere/azzerare `ANTHROPIC_API_KEY` dall'ambiente del servizio openclaw** (altrimenti l'env key sovrascrive). Solo il flag che proponevi non chiude il rubinetto.

### (2) Modello + quando chiama Claude → **`claude-sonnet-4-6` CONFERMATO.** ✅
- `openclaw.json` → `model.primary = "anthropic/claude-sonnet-4-6"`; alias `sonnet`. `openclaw models status` lo dà come Default.
- **Quando consuma:** ad ogni *agent turn* (= AIRIA "ragiona"): messaggi Telegram in ingresso, sessioni interattive, e — quando attivo — ogni run di cron. **NON** consuma Claude per la memoria/ricerca: `memorySearch.provider = "ollama"` → embeddings/recall girano in **locale (Ollama)**, zero token Claude. Quindi il "routine" non-ragionante è gratis; il costo è solo sul ragionamento.

### (3) Costo reale dal 17 May → **architetturalmente SÌ è fatturabile; volume finora basso. Cifra € autoritativa = solo Console.** 🟡
Quello che posso provare dal host (NON ho accesso alla tab Usage/Console dal Pi):
- C'era un cron "AIROOBI Bridge Monitor" che ha girato **~da 16/17 May a 18 May ~14:45** (lo state file `airoobi-bridge-state.json` si congela a `2026-05-18T14:44`, il run-log si ferma il 18 May). ~1,5 giorni, run brevi tutte `summary: HEARTBEAT_OK` (nessun file nuovo → turno corto). Volume: decine di turni brevi, non migliaia.
- Dopo il 18 May: **nessun run di cron** scritto. AIRIA ha consumato solo su sessioni reali (es. sessioni agent 25 May, 31 May) — input-driven, costo limitato.
- 30 May 23:24: crash (`unhandled_rejection`, modulo `provider-discovery.runtime.js` rotto) con 7 run cron `model_call:started` in volo ma **senza** finished/log → probabilmente chiamate fallite, non turni completi fatturati.
- **Il tuo "$0.00 osservato" è coerente con "uso genuinamente piccolo + arrotondamento/filtro data"**, NON con "è gratis perché claude-cli" (è su API key, vedi #1). Conferma autoritativa: Console → Usage, **range = All**, filtrato sulla key `…vx2yxQAA`, dal 16 May. Quella è la fonte di verità sul € — io dal Pi non la vedo.

### (4) Cron che la fanno ragionare in continuo → **ADESSO NESSUNO.** ✅
- `openclaw cron list` → **"No cron jobs."** `cron/jobs.json` = `{"jobs": []}`.
- Il "Bridge Monitor" (every 5 min = 288 turni/giorno, un agent turn vero ad ogni giro) **è stato rimosso** — è l'eco che Skeezu vede nello screenshot. Era esattamente l'anti-pattern: cron-agente OpenClaw = sveglia l'agente = consuma. Bene che sia spento.
- **Regola da fissare:** mai rimettere il poll come cron-agente OpenClaw. (Vedi #5.)

### (5) Loop dispatcher /ago NON usa Claude + wake `claude -p` coperto da Max → **CONFERMATO.** ✅✅
- **Loop deterministico** (cron/script di SISTEMA sul Pi: poll REST `agora.messages` + filtro in shell/JS) = **zero LLM → zero costo**. Corretto: va come cron di sistema, **non** cron-agente OpenClaw.
- **Wake `claude -p`** = Claude Code, e Claude Code **è coperto da Max**: verificato →
  `~/.claude/.credentials.json` ha `subscriptionType:"max"` + OAuth valido; e in `~/.claude.json` la paid env-key è nella lista **`rejected`** (`approved: []`) → **Claude Code ignora la API key a pagamento e usa l'abbonamento.** Per-token cost = 0.
- ⚠️ **Caveat hardening (importante):** siccome `ANTHROPIC_API_KEY` è esportata globalmente, anche `claude -p` la eredita. Oggi è "rejected" → ok. Ma è fragile (un re-login `claude` con "yes", o un reset di `customApiKeyResponses`, lo ribalta su paid in silenzio). **Garanzia hard: il dispatcher lancia `env -u ANTHROPIC_API_KEY claude -p …`** → Claude Code non vede mai la paid key → sempre subscription. Belt-and-suspenders, costo zero blindato.
- ⚠️ **Tetto quota (non €):** Max ha un cap d'uso condiviso (stesso discorso ROBLOCK). `claude -p` del dispatcher compete con la quota di CCP. Non è costo in €, ma è un soffitto reale — da dosare.

---

# Risposte ai 3 ask del file Config-ZeroCost

1. **`openclaw models status` → claude-cli o API key?** → **API key** (oauth=0/token=0/none). NON è già su claude-cli. Lo switch a zero-cost richiede OAuth-onboarding in OpenClaw **+** rimozione dell'env key dal servizio (non solo il flag `agentRuntime`).
2. **/ago a livello shell/cron di sistema, non cron-agente OpenClaw?** → **Confermato**, coerente con harness `roblock_wake.sh`. È l'unica via cost-safe.
3. **Costo storico Usage range All?** → da leggere in Console (io non ho accesso). Local evidence: volume basso (~1,5gg di cron breve + poche sessioni). $0.00 plausibile come "molto piccolo", non come "gratis by design".

---

# Azioni

**Per il dispatcher /ago (Build C) — sbloccato, procediamo:**
- [ ] Loop = cron/script di sistema (shell), zero LLM. ✅ design confermato.
- [ ] Wake con `env -u ANTHROPIC_API_KEY claude -p …` (garanzia subscription).
- [ ] Mai poll come cron-agente OpenClaw.

**Per il costo AIRIA/OpenClaw — decisione Skeezu (parallela, non blocca /ago):**
- [ ] **Leggere Console → Usage (range All)** per il € reale dal 16 May.
- [ ] Decidere il modello d'esercizio: **(A)** vero claude-cli zero-cost = OAuth-onboard `claude` in OpenClaw **+** togliere `ANTHROPIC_API_KEY` dall'env del servizio (caveat: token subscription scade → re-login `claude` a mano ogni tanto; no prompt-caching; auth per-agente); **(B)** restare su API key ma con cron a zero e uso parsimonioso (accettare micro-costo); **(C)** modello locale (Ollama) per il routine, Claude solo quando serve davvero.
- [ ] **Igiene segreti (a parte):** la paid key è esportata in `~/.bashrc` (globale) e il `botToken` Telegram è in chiaro in `openclaw.json`. Consiglio: scoping della key al solo servizio openclaw (non global export) + trattare `openclaw.json` come file segreto. Nessun segreto è in questo report.

**Memoria:** correggo "AIRIA free" → "AIRIA su paid API key; dispatcher cost-safe via `claude -p`/Max".

— **CCP** (CIO/CTO Airoobi) · 31 May 2026 · verify-before-build su costo AIRIA, on-host. Build C dispatcher: GO. Correzione costo OpenClaw: a Skeezu.
