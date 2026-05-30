---
title: CCP → Skeezu/ROBY/AIRIA · Accesso control UI OpenClaw — decisione (tunnel SSH ora, Tailscale dopo)
purpose: Risposta all'RS accesso LAN OpenClaw. Verificato sul Pi: l'opzione (1) allowInsecureAuth è GIÀ attiva e NON basta (il gate è lato browser: la control UI vuole un secure context). Decisione tech-ownership: tunnel SSH → localhost = secure context (cifrato, zero config, nessun restart di AIRIA); Tailscale nativo OpenClaw come opzione persistente/fuori-LAN. Token passato a Skeezu in chat (NON in repo).
date: Sab 30 maggio 2026
audience: Skeezu · ROBY · AIRIA
status: risolto via tunnel SSH (immediato) · Tailscale = follow-up se serve cifrato/remote persistente
re: RS accesso LAN OpenClaw control UI
---

# CCP · Accesso control UI OpenClaw (LAN)

## Host — risolto
`192.168.1.150` = **stesso Pi**, hostname `skeeberrypi`. È il Pi 4 dove giro io (CCP) e AIRIA. La memoria diceva `.157`: **IP cambiato** (.157 → .150), non un'altra macchina. Memoria aggiornata.

## Perché l'opzione (1) non basta (verificato)
`gateway.controlUi.allowInsecureAuth` è **già `true`** in `~/.openclaw/openclaw.json`, e `http://192.168.1.150:18789` è già negli `allowedOrigins`. Il gateway (pid attivo) è partito **dopo** l'ultimo edit della config → quei valori sono **già caricati**. Eppure il blocco persiste con *"use HTTPS or localhost"*.
→ Il gate non è server-side: è **lato browser**. La "device identity" della control UI usa API disponibili **solo in secure context** (HTTPS o localhost). Un flag del gateway non può concederlo su HTTP verso un host non-localhost. Quindi ri-flippare (1) non risolve.

## Decisione (tech-ownership): tunnel SSH → localhost
Dà un **secure context vero** senza toccare nulla sul Pi, cifrato, e **non riavvia AIRIA**. SSH è già attivo (porta 22). Da QUALSIASI PC di Skeezu:
```
ssh -L 18789:localhost:18789 drskeezu@192.168.1.150
# poi nel browser del suo PC:
http://localhost:18789      → Connect funziona (localhost = secure context)
```
Token gateway: passato a Skeezu in chat (auth.mode = token). Funziona in LAN e anche da fuori-LAN ovunque lui possa fare SSH al Pi.

## Follow-up pulito (se vuole cifrato/remote persistente): Tailscale
OpenClaw ha **supporto Tailscale nativo** (`gateway.tailscale` in config, ora `mode: off`). Con Tailscale installato + `tailscale up` (login interattivo di Skeezu) → URL HTTPS sul tailnet = secure context + accesso remoto, **senza esporre 18789 a internet**. Lift maggiore (install + auth) → lo facciamo se/quando serve.

## Sicurezza
- **18789 resta LAN/localhost-only**: NESSUN port-forward sul router verso internet. Il tunnel SSH è cifrato end-to-end.
- Il **gateway token è un bearer secret**: LAN-only, mai committato, mai in un file del bridge. (Te l'ho dato solo in chat.)
- `allowInsecureAuth:true` la lascio com'è (innocua dietro tunnel/LAN); se in futuro si va solo-Tailscale, si può rimettere `false`.

## RS — paste-ready (CCP → Skeezu)
```
CCP ACCESSO CONTROL UI OPENCLAW.
HOST: .150 = stesso Pi (skeeberrypi), IP cambiato da .157. Memoria aggiornata.
OPZIONE (1): allowInsecureAuth è GIÀ true + origin .150 già in allowedOrigins, gateway li ha caricati → NON basta.
Il gate è lato BROWSER: la device-identity della control UI vuole secure context (HTTPS o localhost).
FIX (scelta CCP): tunnel SSH → localhost = secure context, cifrato, zero config, niente restart AIRIA.
  ssh -L 18789:localhost:18789 drskeezu@192.168.1.150  → apri http://localhost:18789 → Connect ok.
  Token gateway: passato in chat (auth mode=token). Va anche fuori-LAN se fai SSH al Pi.
FOLLOW-UP: Tailscale (OpenClaw lo supporta nativo) per HTTPS/remote persistente senza esporre 18789.
SICUREZZA: 18789 LAN/localhost-only, mai port-forward a internet; token = bearer secret, mai nel repo.
```

— **CCP** · 30 May 2026 · accesso control UI via tunnel SSH · 18789 mai su internet
