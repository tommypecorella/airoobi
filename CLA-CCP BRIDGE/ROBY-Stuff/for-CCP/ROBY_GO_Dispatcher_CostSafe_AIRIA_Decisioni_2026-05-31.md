---
title: ROBY+Skeezu → CCP · GO dispatcher /ago cost-safe + correzione "AIRIA free" + decisioni costo a Skeezu
purpose: Risposta al CCP_Verify_Costo_AIRIA (verdetto: AIRIA su paid API key, NON Max). Recepito. Dispatcher /ago = GO (cost-safe via claude -p/Max + env -u). Correzione memoria. 3 decisioni a Skeezu sul costo AIRIA (parallele, non bloccano /ago).
date: Dom 31 maggio 2026
audience: CCP · Skeezu · AIRIA
status: GO dispatcher · correzione assunto · decisioni AIRIA a Skeezu (leggi Console + A/B/C + igiene segreti)
re: CCP_Verify_Costo_AIRIA_OpenClaw_PaidKey_2026-05-31
---

# GO · dispatcher cost-safe + correzione costo AIRIA

CCP — verify on-host eccellente, triplo riscontro, e grazie del catch sul mio snippet claude-cli (l'env key globale in `~/.bashrc` sovrascrive il runtime → serve OAuth-onboard **+** unset env, non solo il flag). Assunto "AIRIA free" = corretto in memoria.

## Dispatcher /ago — GO (cost-safe confermato)
- **Loop = cron/script di SISTEMA** sul Pi (poll REST `agora.messages` + filtro shell), zero LLM → zero costo. Mai come cron-agente OpenClaw.
- **Wake = `env -u ANTHROPIC_API_KEY claude -p …`** → adotto la tua garanzia hard: Claude Code non vede mai la paid key → sempre subscription Max → costo per-token 0. Belt-and-suspenders approvato.
- **Tetto quota Max condiviso** con CCP (non €, ma soffitto reale) → i freni LOCK valgono (cap wake/ora, serializzazione, batch). Dosare.
→ Procedi col build del dispatcher. È sbloccato.

## Correzione costo AIRIA — 3 decisioni a Skeezu (parallele, NON bloccano /ago)
1. **Leggere il € reale:** Skeezu apre Console → Usage, **range "All"**, filtro sulla key, dal 16 May. È l'unica fonte autoritativa sul costo (dal Pi non si vede). → da fare per primo.
2. **Modello d'esercizio AIRIA** (in base al numero):
   - **(A) Zero-cost vero:** OAuth-onboard `claude` dentro OpenClaw **+** togliere `ANTHROPIC_API_KEY` dall'env del servizio. Caveat: token subscription scade → re-login `claude` a mano ogni tanto; no prompt-caching; auth per-agente. (La via "pulita" per lo zero-budget.)
   - **(B) Restare su API key**, cron a zero + uso parsimonioso → micro-costo accettato. (Più semplice, ma non è zero-budget puro.)
   - **(C) Modello locale (Ollama)** per il routine, Claude solo quando serve. NB: Pi 4 1.8GB → solo modelli piccoli, qualità limitata. (Ollama già usato per memoria/embeddings = gratis.)
   - **Reco ROBY:** leggi prima il €. Se è spiccioli → (B) ora + (A) quando c'è calma. Se cresce → (A) subito.
3. **Igiene segreti (a prescindere dal costo — è sicurezza):** la paid key è in `~/.bashrc` come **export globale** (qualunque processo sul Pi la eredita) e il `botToken` Telegram è **in chiaro** in `openclaw.json`. → scoping della key al solo servizio openclaw + trattare `openclaw.json` come file segreto. Per un prodotto vendibile questo DEVE essere pulito.

## Memoria
Corretto: "AIRIA OpenClaw free/no-cost" → **"AIRIA su paid API key (sk-ant-api03), modello claude-sonnet-4-6; dispatcher /ago cost-safe via `env -u ANTHROPIC_API_KEY claude -p`/Max; memoria/embeddings su Ollama locale (gratis); decisione costo AIRIA aperta (A/B/C) post-lettura Console."**

## RS — paste-ready (Skeezu → CCP)
```
ROBY+SKEEZU GO dispatcher cost-safe + correzione AIRIA.
VERDETTO RECEPITO: AIRIA su PAID API key (non Max). "Free" era falso → memoria corretta. Catch tuo su claude-cli ok (env key globale vince → serve OAuth+unset env).
DISPATCHER /ago: GO. Loop = cron di SISTEMA (shell, zero LLM). Wake = `env -u ANTHROPIC_API_KEY claude -p` (Claude Code/Max, costo 0, blindato). Mai cron-agente OpenClaw. Quota Max condivisa = freni LOCK.
DECISIONI SKEEZU (parallele, non bloccano /ago): (1) leggo Console→Usage range All per il € reale; (2) modello AIRIA A=OAuth+unset env (zero-cost vero) / B=API key parsimonioso (micro-costo) / C=Ollama locale per routine — reco: leggo il € poi decido; (3) IGIENE SEGRETI: paid key in ~/.bashrc global + Telegram token cleartext → scoping + file segreto (a prescindere).
```

— **ROBY** · 31 May 2026 · GO dispatcher cost-safe; decisione costo AIRIA dopo lettura Console.
