---
title: ROBY → CCP · Abilitare a Skeezu l'accesso LAN alla control UI di OpenClaw (Gateway Dashboard)
purpose: Skeezu vuole accedere ad AIRIA/OpenClaw dal browser via LAN per accoglierla e darle il via sulla Fase C. La Gateway Dashboard si vede ma NON si connette: OpenClaw richiede secure context (HTTPS o localhost) e Skeezu la apre in HTTP semplice da un altro PC. Richiesta a CCP (tech-ownership) di sbloccare l'accesso LAN. Vincolo: zero budget, e la control UI NON va esposta a internet.
date: Sab 30 maggio 2026
audience: CCP (azione) · Skeezu · AIRIA
status: richiesta infra · scelta del metodo = tech-ownership CCP · serve anche il Gateway Token a Skeezu
---

# Richiesta · Accesso LAN a OpenClaw per Skeezu

CCP — Skeezu apre la Gateway Dashboard di OpenClaw dal browser su `http://192.168.1.150:18789/chat?session=main`. La pagina si vede (campo WebSocket `ws://192.168.1.150:18789`, Gateway Token, Password, Connect), MA al Connect blocca con:

> **Secure browser context required** — "This page is running over plain HTTP, so the browser cannot create the device identity the Gateway expects."
> Raw error: `control ui requires device identity (use HTTPS or localhost secure context)`

Cioè: la control UI di OpenClaw vuole **HTTPS o localhost**; Skeezu la apre in HTTP da un altro PC della LAN → il browser non crea la device identity → niente connessione.

## Cosa ti chiedo
Abilitare a Skeezu l'accesso LAN alla control UI. La scelta del metodo è tua (tech-ownership); le opzioni che la schermata stessa indica:

1. **`gateway.controlUi.allowInsecureAuth: true`** (+ restart) — il più rapido per una **LAN fidata** (rete di casa). Auth token-only su HTTP. ⚠️ La schermata avvisa: "Avoid disabling device auth for remote HTTP access" → quindi **solo LAN, MAI esporre la porta 18789 a internet**.
2. **HTTPS / Tailscale Serve** — più pulito e sicuro; con Tailscale Serve Skeezu raggiungerebbe AIRIA anche da fuori casa, sempre cifrato. Più setup, ma è la strada "prodotto".
3. (Per te sul Pi: `http://127.0.0.1:18789` è già secure context — ma è locale all'host, non serve a Skeezu da un altro PC.)

**Workaround zero-config per Skeezu nel frattempo** (se vuoi sbloccarlo subito senza toccare la config): un **tunnel SSH** dalla sua PowerShell verso l'host OpenClaw —
`ssh -L 18789:localhost:18789 <user>@192.168.1.150` → poi apre `http://127.0.0.1:18789` nel browser. **localhost = secure context**, quindi la dashboard si sblocca senza cambiare niente. Confermagli tu `<user>` e che l'host `.150` è giusto.

## Mi serve anche da te per Skeezu
- Il **Gateway Token** (`OPENCLAW_GATEWAY_TOKEN`) se è impostato, così può autenticarsi al Connect. La eventuale Password.
- **Conferma host/IP:** la memoria team-workflow aveva il Pi a `192.168.1.157` (Pi 5, host `skeeberrypi`), ma OpenClaw risponde su `192.168.1.150`. Stesso Pi con IP nuovo, o un'altra macchina? Allinea così non inseguiamo l'indirizzo sbagliato.

## Sicurezza (LOCK)
Qualunque opzione: **la control UI di OpenClaw resta LAN-only**, mai port-forward verso internet. L'opzione 1 disabilita la device-identity su HTTP — accettabile su rete di casa fidata, vietata su accesso remoto/pubblico (lo dice il doc OpenClaw stesso). Se serve accesso da fuori, si fa via Tailscale (cifrato), non aprendo la porta.

## RS — paste-ready (Skeezu → CCP)
```
RS · ACCESSO LAN OPENCLAW per Skeezu. La Gateway Dashboard (http://192.168.1.150:18789) si vede
ma il Connect blocca: "Secure browser context required / control ui requires device identity
(use HTTPS or localhost)". Apro in HTTP da un altro PC → niente device identity.
CHIEDO (scegli tu, tech-ownership):
 (1) gateway.controlUi.allowInsecureAuth: true + restart → rapido per LAN fidata. SOLO LAN, mai internet.
 (2) HTTPS/Tailscale Serve → più pulito, accesso anche da fuori, cifrato.
 Workaround subito: tunnel SSH `ssh -L 18789:localhost:18789 <user>@192.168.1.150` poi http://127.0.0.1:18789 (localhost = secure context).
SERVE ANCHE: passami il Gateway Token (OPENCLAW_GATEWAY_TOKEN) + eventuale password. E conferma host:
memoria dice Pi a .157 (skeeberrypi), OpenClaw risponde su .150 — stesso Pi nuovo IP o altra macchina?
SICUREZZA: control UI LAN-only, mai esporre 18789 a internet.
```

— **ROBY** · 30 May 2026 · richiesta accesso LAN OpenClaw per Skeezu. Scelta metodo a CCP.
