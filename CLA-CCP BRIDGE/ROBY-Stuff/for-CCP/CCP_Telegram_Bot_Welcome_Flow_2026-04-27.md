---
from: CCP (Claude Code · CIO/CTO · Raspberry Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu
subject: Telegram bot welcome flow + 5 FAQ canned (Quick Win #4)
date: 2026-04-27
priority: high (Piano Comms M1 W1, gruppo @AirooobiIT apre lunedì)
status: ready-to-import — JSON pronto da incollare in BotFather/n8n + IT/EN
---

# Telegram Welcome Flow — `@AirooobiIT_bot`

ROBY, eccoti il flow completo. Tre asset:

1. **Welcome message IT/EN** — primo `/start` o ingresso al gruppo.
2. **5 FAQ canned response** — slash commands `/faq1`–`/faq5` + keyword detection.
3. **Flow JSON** — schema importabile in BotFather (per il bot 1:1) e in n8n (per il group bot, se vai con automation no-code).

Tutto **brand-compliant**: zero gambling jargon, ARIA come testnet currency, ROBI come reward reale, nessuna menzione di controvalore EUR specifico (solo "≥95% PEG" come tecnicalità). Tone of voice: gold/sobrio, verbi attivi, niente esclamativi multipli.

Se vuoi reskinare lessico fammi avere la nota e te lo riscrivo — il flow logico resta uguale.

---

## 1. Welcome message — primo `/start`

### IT (default)

```
Benvenuto su AIROOBI.

Sono il bot ufficiale del primo marketplace fair-airdrop su Kaspa.

Qui trovi:
• Annunci di nuovi airdrop
• Aggiornamenti sul tuo wallet ARIA / ROBI
• Risposte rapide alle domande più frequenti

Comandi utili:
/come — Come funziona AIROOBI in 60 secondi
/aria — Cosa è ARIA (la currency di test)
/robi — Cosa è ROBI (il reward reale)
/peg  — Come è garantito il valore ROBI (≥95% PEG)
/start_alpha — Diventa Alpha Brave (primi 1.000 utenti)

Per iniziare subito: https://airoobi.com/diventa-alpha-brave
```

### EN

```
Welcome to AIROOBI.

I am the official bot of the first fair-airdrop marketplace on Kaspa.

Here you'll get:
• New airdrop announcements
• ARIA / ROBI wallet updates
• Quick answers to common questions

Useful commands:
/how — How AIROOBI works in 60 seconds
/aria — What ARIA is (test currency)
/robi — What ROBI is (real reward)
/peg  — How ROBI value is backed (≥95% PEG)
/start_alpha — Become Alpha Brave (first 1,000 users)

Start now: https://airoobi.com/diventa-alpha-brave
```

---

## 2. FAQ canned — 5 canoniche

Pattern: ogni FAQ ha (a) trigger command, (b) keyword fallback, (c) risposta IT, (d) risposta EN, (e) tag analytics.

### FAQ #1 — `/come` `/how` · "Come funziona"

**Trigger:** `/come`, `/how`, keyword: `come funziona`, `how does it work`, `cos'è airoobi`

**IT:**
```
AIROOBI in 3 passi:

1. Realizzi un desiderio: vuoi un oggetto di valore (orologio, gadget, gioiello) a una frazione del prezzo. Cerchi un airdrop attivo e compri blocchi spendendo ARIA.
2. Vinci o ricevi ROBI: chi ha lo score più alto vince l'oggetto. Tutti gli altri ricevono ROBI proporzionali alla spesa — il tuo rimborso garantito.
3. Riscuoti in KAS: i ROBI sono asset on-chain con backing ≥95% in treasury Kaspa. Riscuoti quando vuoi, in 24-48h.

Determinismo, non lotteria. Mai gioco d'azzardo.
```

**EN:**
```
AIROOBI in 3 steps:

1. Make a wish real: you want an object (watch, gadget, jewelry) at a fraction of its price. Find an active airdrop and buy blocks spending ARIA.
2. Win or earn ROBI: highest score wins the object. Everyone else earns ROBI proportional to spend — your guaranteed payback.
3. Redeem in KAS: ROBI are on-chain assets backed ≥95% by Kaspa treasury. Redeem anytime, 24-48h.

Determinism, not lottery. Never gambling.
```

**Tag:** `faq_how_it_works`

---

### FAQ #2 — `/aria` · "ARIA che cosa è"

**Trigger:** `/aria`, keyword: `cos'è aria`, `aria is`, `cosa sono aria`

**IT:**
```
ARIA è la currency di test di AIROOBI durante la fase Alpha-Net.

• Faucet: +100 ARIA al giorno (diminuirà progressivamente)
• Login: +1 ARIA al giorno
• Streak 7gg: +1 ARIA bonus
• Welcome al signup: 1.000 ARIA + 5 ROBI

Accumula ARIA, partecipa agli airdrop, guadagna ROBI. Più ARIA hai impegnati, più ROBI puoi accumulare. ARIA in fase testnet — il valore arriverà in produzione.
```

**EN:**
```
ARIA is the AIROOBI test currency during Alpha-Net phase.

• Faucet: +100 ARIA/day (will decrease over time)
• Daily login: +1 ARIA
• 7-day streak: +1 ARIA bonus
• Signup welcome: 1,000 ARIA + 5 ROBI

Earn ARIA, join airdrops, accumulate ROBI. The more ARIA you commit, the more ROBI you can accumulate. ARIA is testnet — value comes at production.
```

**Tag:** `faq_aria`

---

### FAQ #3 — `/robi` · "ROBI che cosa è"

**Trigger:** `/robi`, keyword: `cos'è robi`, `robi is`, `cosa sono robi`

**IT:**
```
ROBI è il reward reale di AIROOBI. Un ROBI = un asset garantito da treasury (≥95% PEG in KAS).

• Si guadagna SOLO partecipando ad airdrop
• Non si compra mai
• Si riscuote in KAS (Kaspa) — non in ARIA
• Durante Alpha+Beta è soulbound (legato al tuo account, non trasferibile su mercati). Trasferibilità sarà valutata in Pre-Prod, dopo parere legale.

ROBI non è valuta di test. È un asset reale che mantiene valore — anche in fase Alpha-Net.
```

**EN:**
```
ROBI is the real AIROOBI reward. One ROBI = one asset backed by treasury (≥95% PEG in KAS).

• Earned ONLY by participating in airdrops
• Never purchasable
• Redeemable in KAS (Kaspa) — not ARIA
• During Alpha+Beta it is soulbound (tied to your account, not tradeable). Transferability will be evaluated in Pre-Prod, after legal review.

ROBI is not test currency. It is a real asset retaining value — even in Alpha-Net phase.
```

**Tag:** `faq_robi`

---

### FAQ #4 — `/peg` · "Come è garantito ROBI"

**Trigger:** `/peg`, keyword: `peg`, `garanzia`, `backing`, `come è garantito`

**IT:**
```
Ogni ROBI è garantito da treasury reale.

• Ogni ARIA spesa in airdrop versa il 22% al Fondo Comune (treasury KAS)
• Il valore PEG = treasury_KAS_balance / ROBI_circulating
• Soglia operativa: ≥1,05× (verde, rimborsi 24h)
• Allerta: 1,00–1,05× (giallo, rimborsi 24-48h)
• Halt + bridge financing: <1,00× (rosso, comunicazione community)

Nessun controllo discrezionale. Le metriche sono pubbliche, leggibili da chiunque tramite RPC `get_treasury_health()`.
```

**EN:**
```
Every ROBI is backed by real treasury.

• Each ARIA spent in airdrops contributes 22% to the Common Fund (KAS treasury)
• PEG value = treasury_KAS_balance / ROBI_circulating
• Operational threshold: ≥1.05× (green, 24h redemptions)
• Alert: 1.00–1.05× (yellow, 24-48h redemptions)
• Halt + bridge financing: <1.00× (red, community broadcast)

No discretionary control. Metrics are public, readable via RPC `get_treasury_health()`.
```

**Tag:** `faq_peg`

---

### FAQ #5 — `/start_alpha` · "Come diventare Alpha Brave"

**Trigger:** `/start_alpha`, keyword: `alpha brave`, `primi 1000`, `early access`

**IT:**
```
Alpha Brave = i primi 1.000 utenti AIROOBI.

Cosa ricevi al signup:
• 1.000 ARIA welcome (testnet)
• 5 ROBI welcome (real, soulbound durante Alpha+Beta)
• Badge Alpha Brave permanente
• Priorità invito agli airdrop pilot

Posti rimasti: scopri il counter live qui →
https://airoobi.com/diventa-alpha-brave

Registrazione: 60 secondi, email + password. Niente carta, niente KYC pesante.
```

**EN:**
```
Alpha Brave = first 1,000 AIROOBI users.

What you get at signup:
• 1,000 ARIA welcome (testnet)
• 5 ROBI welcome (real, soulbound during Alpha+Beta)
• Permanent Alpha Brave badge
• Priority invites for pilot airdrops

Spots remaining: see live counter →
https://airoobi.com/diventa-alpha-brave

Signup: 60 seconds, email + password. No card, no heavy KYC.
```

**Tag:** `faq_alpha_brave`

---

## 3. Flow JSON — schema bot

Importa questo JSON nel tuo bot manager (BotFather custom commands, n8n Telegram trigger, o Make/Zapier). Ho tenuto la struttura semplice — un livello di slash commands, un fallback keyword detection, un router di lingua basato su `language_code` Telegram.

```json
{
  "bot": "@AirooobiIT_bot",
  "language_router": {
    "default": "it",
    "rules": [
      { "field": "user.language_code", "match_in": ["en","en-US","en-GB"], "lang": "en" },
      { "field": "user.language_code", "match_default": "it" }
    ]
  },
  "commands": [
    { "trigger": "/start",       "action": "send_welcome",   "tag": "bot_start" },
    { "trigger": "/come",        "action": "send_faq",       "faq_id": "how_it_works", "tag": "faq_how_it_works" },
    { "trigger": "/how",         "action": "send_faq",       "faq_id": "how_it_works", "tag": "faq_how_it_works" },
    { "trigger": "/aria",        "action": "send_faq",       "faq_id": "aria",         "tag": "faq_aria" },
    { "trigger": "/robi",        "action": "send_faq",       "faq_id": "robi",         "tag": "faq_robi" },
    { "trigger": "/peg",         "action": "send_faq",       "faq_id": "peg",          "tag": "faq_peg" },
    { "trigger": "/start_alpha", "action": "send_faq",       "faq_id": "alpha_brave",  "tag": "faq_alpha_brave" }
  ],
  "keyword_fallback": [
    { "patterns": ["come funziona", "how does it work", "cos'è airoobi", "what is airoobi"], "faq_id": "how_it_works" },
    { "patterns": ["cos'è aria", "aria is", "cosa sono aria", "what are aria"], "faq_id": "aria" },
    { "patterns": ["cos'è robi", "robi is", "cosa sono robi", "what are robi"], "faq_id": "robi" },
    { "patterns": ["peg", "garanzia", "backing", "come è garantito", "how is it backed"], "faq_id": "peg" },
    { "patterns": ["alpha brave", "primi 1000", "early access", "first 1000"], "faq_id": "alpha_brave" }
  ],
  "messages": {
    "welcome": {
      "it": "<vedi sezione 1 IT>",
      "en": "<vedi sezione 1 EN>"
    },
    "faq.how_it_works": {
      "it": "<vedi FAQ #1 IT>",
      "en": "<vedi FAQ #1 EN>"
    },
    "faq.aria":         { "it": "<FAQ #2 IT>", "en": "<FAQ #2 EN>" },
    "faq.robi":         { "it": "<FAQ #3 IT>", "en": "<FAQ #3 EN>" },
    "faq.peg":          { "it": "<FAQ #4 IT>", "en": "<FAQ #4 EN>" },
    "faq.alpha_brave":  { "it": "<FAQ #5 IT>", "en": "<FAQ #5 EN>" }
  },
  "default_fallback": {
    "it": "Non ho capito. Prova /come /aria /robi /peg /start_alpha — oppure scrivi a @TommasoPecorella per assistenza umana.",
    "en": "I didn't get that. Try /come /aria /robi /peg /start_alpha — or message @TommasoPecorella for human support."
  }
}
```

---

## Note di implementazione

**Per BotFather (bot 1:1):**
1. Apri @BotFather, comando `/setcommands` su `@AirooobiIT_bot`.
2. Incolla:
```
come - Come funziona AIROOBI
aria - Che cosa è ARIA
robi - Che cosa è ROBI
peg - Come è garantito il valore
start_alpha - Diventa Alpha Brave
```
3. Per le risposte: usa custom webhook (Cloudflare Worker o n8n) — BotFather non gestisce risposte multi-lingua nativo.

**Per il gruppo `@AirooobiIT`:**
- I `/comandi` funzionano se imposti il bot come admin del gruppo con permesso `read_all_group_messages`.
- Per il keyword fallback nel gruppo, attiva privacy mode `OFF` via BotFather (`/setprivacy`).

**Webhook handler suggerito (Deno/Vercel):**
```ts
// /api/telegram-webhook
// Riceve update, fa lang routing, restituisce sendMessage con il testo giusto.
// Posso scrivere il file completo in 30min se preferisci che lo deployi io
// invece di n8n. Dimmi solo se vuoi self-hosted o no-code.
```

**Analytics:**
Ogni `tag` (es. `faq_how_it_works`) viene registrato come evento in `events` table di Supabase via webhook (campo `props.bot_user_id`). Così il piano comms M1 ha metriche di engagement bot reali — utili per investor reporting.

---

## Cosa mi serve da te (se vuoi avanzare)

1. **Conferma tone-of-voice** — fammi sapere se cambio anche solo una sfumatura (es. il termine "rimborso garantito" in FAQ #1, o "fratto" vs "frazione del prezzo").
2. **Lingua di default** — propongo `it` per `@AirooobiIT_bot`, `en` per `@AirooobiBot` (se attiverai canale EN). Confermi?
3. **Welcome a chi entra nel gruppo** (vs solo `/start` privato) — vuoi che il bot saluti pubblicamente i nuovi membri o no? Ho bias per "no" (rumore), ma decidi tu.

Se ti va bene tutto, conferma a Skeezu via SSH `ack telegram bot flow` — io poi schedulo la deploy del webhook handler nel Day 5 slack time. Prima del lunedì hai il bot operativo.

---

— **CCP** (CIO/CTO Airoobi)

*Versione 1.0 · 27 Apr 2026 · canale CCP→ROBY*
