---
title: ROBY+Skeezu → CCP · Costo AIRIA agli atti ($12.13) + GO (A) OAuth/Max + igiene segreti
purpose: Letta la Console→Usage (range All). Numero autoritativo agli atti. Decisione Skeezu: (A) passare AIRIA a OAuth/Max (zero-cost per-token) + igiene segreti. Direttiva esecutiva a CCP. Dispatcher /ago invariato (GO, cost-safe).
date: Dom 31 maggio 2026
audience: CCP (esecuzione) · Skeezu · AIRIA
status: GO esecutivo · (A) OAuth/Max + igiene segreti · numero costo agli atti
re: CCP_Verify_Costo_AIRIA_OpenClaw_PaidKey + screenshot Console Usage (range All)
---

# Costo AIRIA agli atti + GO (A) OAuth/Max + igiene segreti

## 📊 Numero autoritativo (Console → Usage, range All) — AGLI ATTI
- **Totale: $12.13** (~€11) da metà maggio a oggi. 10.0M token. Provider **anthropic**, modello **claude-sonnet-4-6**.
- **Concentrazione:** **17 mag 6.2M + 18 mag 2.1M = ~8.3M dei 10M** (burst di setup, soprattutto la sessione webchat lunga: 3.1M / $5.32). Consumo **corrente minuscolo** (31 mag = 57K token). Niente cron attivi.
- Cache hit 76.2% (7.6M cache-read) ha tenuto basso il costo. Error rate 11.13% (65 errori) — nota stabilità, non costo.
→ **Costo storico piccolo, quasi tutto una-tantum di setup. Nessuna emergenza.** Ma è paid key → si decide (A).

## ✅ Decisione Skeezu: (A) OAuth/Max + igiene segreti — ESEGUI
### (A) AIRIA su OAuth/Max (zero-cost per-token)
- **OAuth-onboard `claude` in OpenClaw** → profilo oauth/subscription, AIRIA primary su abbonamento (per-token = 0).
- **Togliere `ANTHROPIC_API_KEY` dall'ambiente del servizio openclaw** (il global export in `~/.bashrc` lo fa vincere sul runtime → da solo il flag non basta, come hai verificato). **Test OAuth funzionante PRIMA di rimuovere la key** (tieni il valore in backup sicuro, è reversibile). Decidi tu se rimuoverla del tutto o tenerla **scoped come failover** (non globale, non in chiaro).
- **Verifica post:** `openclaw models status` → `oauth>0` e default che risolve su subscription, non su `env: ANTHROPIC_API_KEY`.
- **Caveat accettati:** token subscription scade → re-login `claude` a mano ogni tanto; no prompt-caching; auth per-agente.
- ⚠️ **Nota quota (importante):** con (A), AIRIA + ROBLOCK + CCP + ROBY finiscono **tutti sulla stessa quota Max** → soffitto condiviso più carico. I freni del dispatcher (cap wake/ora, serializzazione, batch) contano ancora di più. Dosare. (È il prezzo non-monetario dello zero-budget.)

### Igiene segreti (a prescindere — sicurezza)
- **Paid key:** via dal global export in `~/.bashrc`. Se la tieni come failover → scoped al solo servizio + non in chiaro.
- **Telegram botToken:** oggi in chiaro in `openclaw.json` → spostare in env/`.env` con permessi ristretti; trattare `openclaw.json` come file segreto (chmod 600, fuori da repo/backup pubblici). Per un prodotto vendibile questo è obbligatorio.

## Dispatcher /ago — invariato, GO
Resta cost-safe (loop shell zero-LLM + wake `env -u ANTHROPIC_API_KEY claude -p` su Max). Procede in parallelo, non aspetta (A).

## RS — paste-ready (Skeezu → CCP)
```
ROBY+SKEEZU · costo AIRIA agli atti + GO (A) OAuth/Max + igiene segreti.
NUMERO (Console Usage All): $12.13 totali, 10M token, anthropic/claude-sonnet-4-6. ~8.3M = burst 17-18 mag (setup); ora cents/giorno. Niente emergenza.
DECISIONE: (A) OAuth/Max + igiene segreti. ESEGUI:
 (A) OAuth-onboard `claude` in OpenClaw (subscription) + TOGLIERE ANTHROPIC_API_KEY dall'env del servizio (il global export ~/.bashrc vince → flag da solo non basta). Test OAuth ok PRIMA di rimuovere (backup key, reversibile). Verifica: `openclaw models status` oauth>0, default su subscription. Caveat: token scade→re-login manuale; no caching; auth per-agente.
 QUOTA: con (A) AIRIA+ROBLOCK+CCP+ROBY tutti su quota Max condivisa → freni dispatcher contano di più, dosare.
 IGIENE: paid key fuori dal global export (scoped+segreta se failover); botToken Telegram da cleartext openclaw.json → env/.env chmod600.
DISPATCHER /ago: invariato, GO (claude -p/Max + env -u), procede in parallelo.
```

— **ROBY** · 31 May 2026 · costo agli atti $12.13 · GO (A) OAuth/Max + igiene segreti · dispatcher in parallelo.
