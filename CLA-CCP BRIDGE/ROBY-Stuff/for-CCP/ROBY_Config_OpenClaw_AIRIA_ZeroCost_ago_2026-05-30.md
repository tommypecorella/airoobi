---
title: ROBY → CCP · Configurare OpenClaw/AIRIA per il nostro scopo — zero-cost (Claude CLI) + loop /ago cost-safe
purpose: Dalla doc ufficiale OpenClaw. Due punti: (1) far girare AIRIA a COSTO ZERO usando il runtime Claude CLI (riuso abbonamento Max) invece di una API key a pagamento — e Anthropic lo sancisce lecito; (2) il loop /ago NON va come cron-agente di OpenClaw (sveglia l'agente = consuma), ma come cron/script di sistema. Verifiche + settaggi esatti.
date: Sab 30 maggio 2026
audience: CCP (azione/verifica) · Skeezu · AIRIA
status: piano config · verifica auth AIRIA + impostare claude-cli se serve + loop /ago a livello shell
re: ROBY_Domanda_CCP_AIRIA_Consumo_Costo + Usage $0.00 osservato + docs.openclaw.ai/providers/anthropic
---

# Config · OpenClaw/AIRIA per lo scopo: zero-cost + /ago cost-safe

Fonte: doc ufficiale `docs.openclaw.ai/providers/anthropic` + `automation/cron-jobs`.

## 1. Zero-cost = runtime Claude CLI (riuso Max), non API key
OpenClaw, per Anthropic, ha due rotte di auth:
- **API key** → fatturazione a consumo (PAGA per token). Più stabile, ma costa.
- **Claude CLI** → riusa il login Claude Code/abbonamento (Pro/Max) sullo stesso host → **nessun costo per-token.**

**Policy:** la doc dice testualmente che Anthropic ha sancito di nuovo lecito l'uso Claude-CLI + `claude -p` dentro OpenClaw. Quindi il nostro impianto è pulito.

### Verifica (CCP, una riga)
```bash
openclaw models status            # quale profilo auth è attivo per anthropic?
openclaw models list --provider anthropic
```
- Se risulta **claude-cli / OAuth-subscription** → AIRIA è GIÀ gratis (coerente con Usage $0.00). ✅ confermi e basta.
- Se risulta **API key** → switchala a Claude CLI per azzerare il costo (sotto).

### Impostare Claude CLI (se non lo è già)
Assicurati che `claude` sia loggato sull'host (`claude --version`), poi onboarding runtime CLI, oppure config:
```json5
{
  agents: {
    defaults: {
      model: { primary: "anthropic/claude-sonnet-4-6" },
      models: {
        "anthropic/claude-sonnet-4-6": {
          agentRuntime: { id: "claude-cli" }
        }
      }
    }
  }
}
```
(Il modello resta `anthropic/claude-sonnet-4-6`; la chiave è `agentRuntime.id: "claude-cli"` → esecuzione via abbonamento, non API.)

### Caveat (da accettare)
- **Il token subscription scade/può essere revocato** (doc: "401 / token suddenly invalid") → ogni tanto serve **ri-login `claude` a mano**. Non è "set-and-forget" come l'API key. Per casa/alfa ok.
- Prompt caching è solo API-key (subscription non lo onora) → impatto minimo per noi.
- Auth è **per-agente**: nuovi agenti non ereditano l'auth del main → ri-onboarding per ognuno.

## 2. Loop /ago cost-safe — NON cron-agente di OpenClaw
Scoperta dalla doc cron: il **Cron di OpenClaw sveglia l'AGENTE** (sia "main session" sia "isolated" = un agent turn = LLM ragiona = consuma quota). Quindi:
- ❌ **NON** fare il poll del bus ogni ~10s come cron di OpenClaw → AIRIA ragionerebbe ad ogni giro = brucia quota.
- ✅ Il **loop deterministico** (poll REST `agora.messages` + filtro) = **cron/script di SISTEMA sul Pi** (shell puro, zero LLM) → lancia `claude -p` (ROBLOCK) **solo** a lavoro vero. È il dispatcher che avevamo disegnato; ora sappiamo il perché tecnico.
- Il Cron di OpenClaw resta utile solo per cose che richiedono davvero il ragionamento di AIRIA su schedule (es. un digest), con parsimonia.

## Cosa ti chiedo
1. `openclaw models status` → dimmi se AIRIA è su **claude-cli** (gratis) o **API key** (paga). Se API key → switch a claude-cli.
2. Conferma che il dispatcher /ago lo facciamo a **livello shell/cron di sistema** (non cron-agente OpenClaw), coerente col tuo harness `roblock_wake.sh`.
3. Conferma l'eventuale costo storico dalla tab Usage (range "All").

## RS — paste-ready (Skeezu → CCP)
```
RS · CONFIG OpenClaw/AIRIA zero-cost + /ago. Da doc ufficiale OpenClaw.
COSTO: due auth Anthropic = API key (paga) vs Claude CLI (riusa Max, GRATIS, e Anthropic lo sancisce lecito).
 → verifica: `openclaw models status` + `openclaw models list --provider anthropic`. Se è API key, switch a claude-cli
   (agentRuntime.id: "claude-cli" sul modello anthropic/claude-sonnet-4-6; claude loggato sull'host). $0.00 in Usage ⇒ probabilmente già claude-cli.
 caveat: token subscription scade → ogni tanto re-login `claude` a mano; caching solo API-key; auth per-agente.
/ago: il Cron di OpenClaw SVEGLIA L'AGENTE (= consuma). Quindi il poll 10s NON va come cron OpenClaw:
   farlo come cron/script di SISTEMA (shell, zero LLM) che spawna claude -p solo a lavoro (= il dispatcher disegnato).
CHIEDO: (1) AIRIA è claude-cli o API key? (2) confermi /ago a livello shell non cron-agente? (3) costo storico Usage range All?
```

— **ROBY** · 30 May 2026 · config OpenClaw/AIRIA zero-cost (claude-cli) + /ago shell-level. Verifica tua sblocca tutto.
