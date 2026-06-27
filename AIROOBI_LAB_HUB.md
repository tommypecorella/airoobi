# AIROOBI LAB · hub interno (`airoobi.com/hub`)

Hub riservato che raccoglie i servizi interni dietro un gate. Pagina SSR
(`api/hub.js`), brandizzata rosso/bianco su nero, con password server-side
(cookie HttpOnly firmato HMAC) e schedine per ogni servizio.

## Come funziona

- `airoobi.com/hub` → `api/hub.js` (rewrite in `vercel.json`).
- GET senza cookie valido → **gate** (campo password).
- POST password corretta → cookie `hub_auth` firmato (12h) → **hub** con le schedine.
- Schedine: **Glassatore** (`/glassatore`, pubblico) e **Bottarella** (link a
  `BOTTARELLA_URL`, protetto a parte da Cloudflare Access).
- `?logout=1` → esci.
- Il gate **fallisce chiuso**: senza `HUB_PASSWORD` non entra nessuno.

## 1. Variabili da impostare su Vercel (progetto airoobi)

Dashboard Vercel → Settings → Environment Variables (Production):

| Variabile | Obbligatoria | Valore |
|---|---|---|
| `HUB_PASSWORD` | **sì** | la password del lab (scegline una robusta) |
| `HUB_SECRET` | consigliata | stringa random lunga (firma cookie). Se assente usa HUB_PASSWORD |
| `BOTTARELLA_URL` | quando il tunnel è pronto | `https://bottarella.airoobi.com` |

Dopo averle impostate, **redeploy** (o ri-push) perché vengano lette.
Da CLI: `vercel env add HUB_PASSWORD production`.

## 2. Esporre Bottarella in sicurezza (Cloudflare Tunnel + Access)

Bottarella gira sul Pi (`127.0.0.1:8000`). NON apriamo porte sul router: usiamo un
tunnel uscente.

### Sul Pi — Cloudflare Tunnel
```bash
# installa cloudflared (una volta)
# poi autentica al tuo account Cloudflare (apre il browser)
cloudflared tunnel login
cloudflared tunnel create bottarella
# instrada il sottodominio al servizio locale
cloudflared tunnel route dns bottarella bottarella.airoobi.com
```
Config `~/.cloudflared/config.yml`:
```yaml
tunnel: bottarella
credentials-file: /home/drskeezu/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: bottarella.airoobi.com
    service: http://127.0.0.1:8000
  - service: http_status:404
```
Avvio come servizio (sopravvive a reboot):
```bash
sudo cloudflared service install   # oppure user-service systemd come la dashboard
```

### Su Cloudflare Zero Trust — Access policy
Dashboard Cloudflare → Zero Trust → Access → Applications → Add application
(Self-hosted) su `bottarella.airoobi.com`:
- Policy: **Allow** solo la tua email (one-time-PIN o Google).
Così all'"Accedi" dalla schedina Bottarella, Cloudflare ti fa autenticare prima
ancora di toccare il Pi. Sotto resta il PIN di Bottarella → difesa a strati.

Poi imposta `BOTTARELLA_URL=https://bottarella.airoobi.com` su Vercel.

## Sicurezza — riassunto

- Hub: password server-side (non aggirabile da view-source) + cookie firmato.
- Bottarella: Cloudflare Access (identità) **+** Cloudflare Tunnel (Pi mai esposto)
  **+** PIN dell'app sulle azioni che muovono soldi.
- `noindex,nofollow` su tutto l'hub.
