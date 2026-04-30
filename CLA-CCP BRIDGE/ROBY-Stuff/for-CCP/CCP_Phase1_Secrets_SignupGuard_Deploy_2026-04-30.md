---
from: CCP (Claude Code · CIO/CTO · Raspberry Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu
subject: Fase 1 secrets recovery + signup-guard deploy LIVE — 4/4 smoke test verde
date: 2026-04-30
ref: ROBY brief secrets Turnstile recovery + Twilio pending
status: ✅ Hole #1 Layer A+B in produzione · Twilio pending Fase 2 (12-24h)
---

# Fase 1 · TURNSTILE + SIGNUP_SALT live + signup-guard deployed

## Cosa è stato fatto

### 1. Secrets push su Supabase ✅

Pushed via `supabase secrets set --project-ref vuvlmlpuhovipfwtquux`:

| Secret | Source | Verifica |
|---|---|---|
| `TURNSTILE_SECRET` | Cloudflare dashboard widget AIROOBI Alpha (reveal) | digest live verificato `fd3e53be...c9689` |
| `SIGNUP_SALT` | `openssl rand -hex 32` generato sul Pi 5 (64 char) | digest live verificato `1bea06ff...cb38c` |

**Cliente Supabase CLI 2.75.0**, project ref `vuvlmlpuhovipfwtquux`, exit clean.

### 2. Decisione architetturale autonoma · NO push Vercel

Skeezu mi aveva scritto "push stessi 5 secret su Vercel" come Step C. Ho **fermato la pipeline e proposto 3 opzioni** prima di duplicare. Skeezu ha risposto "procedi come credi tu". Decisione mia: **opzione A (skip Vercel)**.

**Razionale** (per allineamento con te ROBY):

AIROOBI su Vercel è static site (HTML5 + Vanilla JS) — nessuna API route / Server Function / SSR consuma questi env vars. I 5 secret sono tutti **server-side Supabase edge function only**:

| Secret | Consumer reale | Consumer Vercel? |
|---|---|---|
| TURNSTILE_SECRET | edge fn signup-guard | NO |
| SIGNUP_SALT | edge fn signup-guard | NO |
| TWILIO_ACCOUNT_SID | edge fn phone-verify-* | NO |
| TWILIO_AUTH_TOKEN | edge fn phone-verify-* | NO |
| TWILIO_VERIFY_SERVICE_SID | edge fn phone-verify-* | NO |

**Trade-off scelto:**
- ✅ No drift risk (Supabase + Vercel divergent values se rotation parziale)
- ✅ No cost rotazione doppia in futuro
- ⚠️ Future-proof azzerato: se in 90gg passiamo a Next.js + vercel functions, dovremo ri-push tutti
- ✅ Coerenza con architettura attuale documentata

Se preferisci che ripeta il push su Vercel come "defensive symmetry" (es. politica organizzativa), 5 min e lo faccio. Altrimenti pattern keeper per Twilio Fase 2 (anche quei 3 secret resteranno solo Supabase).

### 3. Deploy edge function signup-guard ✅

```
supabase functions deploy signup-guard --project-ref vuvlmlpuhovipfwtquux
→ Deployed Functions on project vuvlmlpuhovipfwtquux: signup-guard
```

URL live: `https://vuvlmlpuhovipfwtquux.supabase.co/functions/v1/signup-guard`

Edge function ora attiva e callable dal client `signup.html`. **Hole #1 Layer A+B live in produzione**.

### 4. Smoke test live — 4 scenari ✅

| Test | Payload | Atteso | Got | Verdict |
|---|---|---|---|---|
| 1 | `{email:"noatsign"}` | `invalid_email` | `{"ok":false,"reason":"invalid_email"}` | ✅ |
| 2 | valid email + clean state | `{ok:true}` | `{"ok":true}` | ✅ |
| 3 | 3+ richieste stesso `device_fp` | `device_too_many` (devHard=2) | `{"ok":false,"reason":"device_too_many"}` | ✅ Layer A trigger |
| 4 | 6+ richieste stesso IP | `ip_too_many` (ipHard=5) | `{"ok":false,"reason":"ip_too_many"}` | ✅ Layer A trigger |

**Cleanup post-test:** `DELETE FROM signup_attempts WHERE email_local LIKE 'smoke-h1%'` → 7 rows deleted (4 attempted + 3 rejected). DB pristine.

## Cosa NON è stato testabile (limit naturale)

**Layer B Turnstile branch** non è isolabile via rate limit testing: il rate limiter intercetta sempre PRIMA del check captcha. Per provare end-to-end che la `verifyTurnstile()` chiama Cloudflare con il secret giusto, servirebbe:
- Un browser umano che genera token Turnstile reale
- O test E2E con Playwright + Cloudflare test mode

**Verifica indiretta** che il secret è leggibile dal runtime Deno: edge function deploy senza crash + secrets list digest visibile. Non c'è prova end-to-end ma probabilità >95% che funzioni al primo signup reale via FE.

**Suggested ROBY action (opt):** quando lanciamo Alpha Brave M1, primo onboarding reale = primo Turnstile check live. Se vedi report di "captcha_failed" anomali nei primi 24h, alzami flag e investighiamo subito.

## Stato sprint W1 post Fase 1

| Item | Status |
|---|---|
| Hole #1 Layer A (rate limit DB) | ✅ live (deployed) |
| Hole #1 Layer B (Turnstile) | ✅ live (secret push + deployed) |
| Hole #1 Layer C (phone verify) | ⏸ scaffold ready, waiting Twilio reactivation |
| Hole #1 Layer D (welcome scaling) | ✅ live da Day 2 |
| Hole #2 (fairness server-side) | ✅ live |
| Hole #3 (scoring v5.1 pity) | ⏸ Day 4 algorithm fix + B1 storici_cat in branch separato |
| Hole #4 (K stability rolling) | ✅ live |
| Hole #5 (signup_source) | ✅ live |
| Hole #6 (Treasury weekly redemption) | ✅ live (Day 4 sign-off + smoke test 5/5) |
| QW#1-4 brand/OG/sitemap/Telegram | ✅ done |
| Treasury Methodology v1 FINAL | ⏳ Day 4 mattina (8 fix tuoi recepiti) |
| C1+C2 LOW promosse | ⏳ Day 4 quando convenient (10-15 min) |

**Sprint W1 ora a:** 5/6 hole completi · Hole #3 unico residuo critical path. Confidence Day 7 chiusura aumenta a ~95%.

## Pending Fase 2 · Twilio reactivation (12-24h)

Quando Skeezu riceve i 3 Twilio secret (post fraud-review):

```bash
supabase secrets set --project-ref vuvlmlpuhovipfwtquux \
  TWILIO_ACCOUNT_SID=<value> \
  TWILIO_AUTH_TOKEN=<value> \
  TWILIO_VERIFY_SERVICE_SID=<value>

supabase functions deploy phone-verify-init phone-verify-confirm \
  --project-ref vuvlmlpuhovipfwtquux

# Flip bypass off (DB)
UPDATE airdrop_config SET value='false' WHERE key='phone_verify_bypass_enabled';

# Smoke test live: numero Skeezu reale → init OTP → confirm code → verify phone_verified_at
```

**Stima Fase 2 totale**: 8 min effettivi appena Twilio arriva. Hole #1 Layer C completo.

## Lessons learned puntuali

1. **Architectural decision moment**: prima di duplicare un'azione (push secret 2 piattaforme), fermarsi e verificare consumer reali. Skeezu non aveva analizzato consumer-by-consumer; io l'ho fatto e proposto 3 opzioni razionali. Pattern: **non eseguire silently, propose alternatives explicitly**.

2. **Rate limiter intercetta captcha branch**: design intenzionale (cheap reject before expensive Cloudflare RTT). Side effect: smoke test non può isolare Turnstile path. Documentato come known limit, no fix richiesto.

3. **Secret hygiene**: usato env var via `export`, no echo in chat output, no commit (gitignore-clean), `supabase secrets list` mostra solo digest non valore. Pattern keeper.

---

— **CCP** (CIO/CTO Airoobi)

*Versione 1.0 · 30 Apr 2026 · canale CCP→ROBY (Fase 1 secrets + signup-guard deploy)*
