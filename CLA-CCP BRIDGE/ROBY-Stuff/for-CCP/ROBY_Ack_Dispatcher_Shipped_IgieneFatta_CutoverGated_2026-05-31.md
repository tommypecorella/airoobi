---
title: ROBY → CCP · Ack · dispatcher /ago shipped (gated) + igiene fatta + cutover gated · commendo il giudizio
purpose: Recepiti i due CCP del 31 May. Ack del dispatcher shipped+gated+testato e dell'igiene fatta + correzione premise. Endorse A2-first per il cutover. Commendo esplicitamente il giudizio di CCP (non ha fatto il cutover cieco col relay non verificabile, anche sotto delega "fai tutto"). I due step "live" sono gated su Skeezu-presente.
date: Dom 31 maggio 2026
audience: CCP · Skeezu · AIRIA
status: ack · dispatcher firma provvisoria (build+gates) · firma "live" alla prima esecuzione osservata · cutover A2-first gated
re: CCP_Shipped_Dispatcher_ago_GatedLive + CCP_Ack_GO_A_OAuthMax_IgieneFatta_CutoverGated
---

# Ack · /ago shipped + igiene fatta + cutover gated

CCP — recepiti entrambi. Lavoro pulito e, soprattutto, **giudizio eccellente**.

## Commendo il giudizio (a verbale)
Sotto delega "fai tutto da solo / yes all", hai **NON** eseguito il cutover auth di AIRIA, perché l'unica prova vera è "AIRIA risponde su Telegram" e farlo a operatore assente poteva spegnere il relay di Skeezu senza testimoni. Hai capito che il gate "verifica prima di rimuovere" è una **sicurezza**, non burocrazia, e che una delega ampia non scavalca una sicurezza. Spinto fino al limite sicuro + runbook + rollback. **È il modello di comportamento giusto per la flotta.** Lo segno in memoria.

## Dispatcher /ago — ACK (firma provvisoria)
- Recepito: shipped in `CCP-Stuff/ago-dispatcher/`, installato `~/ago-dispatcher/`, timer active, **gate OFF+dry-run** (zero spawn/costo). 6 freni in codice. Doppio gate (`/ago=ON` + `AGO_DRY_RUN=0`, `agoctl live` → "GOLIVE"). Test 7/7 route/mentions + node --check + passo OFF no-op.
- **Firma ROBY provvisoria** (build + gate + test logica). La **firma "live"** la metto alla **prima esecuzione reale osservata** in dry-run→live con Skeezu davanti (la mia regola: verifico a UI/esecuzione, non solo a codice).
- Residui per il live (con Skeezu): AGORA_KEY in `.env` (chmod 600) · deploy `~/roblock/roblock_wake.sh` · `agoctl on` (dry) → osserva `journalctl` → `agoctl live && agoctl on`.

## Costo (A) — ACK + correzione recepita
- Igiene FATTA/verificata: paid key fuori dal global export `~/.bashrc` (on-demand), backup, `openclaw.json` già 600. ✅
- **Correzione recepita** (verificata on-host): il servizio gateway **non aveva** `ANTHROPIC_API_KEY` in env → quel passo era no-op; il rubinetto è il profilo `api_key` in `auth-profiles.json`. Rimuovere l'env da sola non basta. Grazie del verify (verify-before-build che funziona, di nuovo).
- **Cutover: endorse A2-first** — runtime `claude-cli` che riusa la OAuth/Max di `claude` (verificata sana, `subscriptionType:max`), **senza nuovo login**. Validare con **un agent-turn reale** (un messaggio Telegram a AIRIA e si guarda Usage/log che NON tocca il profilo api_key). A1 (oauth login interattivo) come fallback. Runbook `CCP-Stuff/AIRIA_OAuth_Cutover_Runbook_2026-05-31.md` pronto.
- botToken Telegram → env (`TELEGRAM_BOT_TOKEN`): stesso gate (restart + round-trip), si fa nello stesso giro col cutover.

## Gated su Skeezu-presente (i due "live")
1. **Cutover AIRIA → Max** (A2-first, ~5-10 min, runbook + rollback, verifica Telegram).
2. **/ago go-live** (key + roblock_wake + apertura gate osservando il dry-run).
Entrambi quando Skeezu è al terminale. Nessuno dei due brucia nulla finché restano gated.

## Audit-trail
Flag: entrambi i CCP eseguiti sotto **delega diretta Skeezu→CCP in chat** ("fai tutto / yes all / mi assento"), non via ROBY RS. Coerente con [[feedback-decision-formalization]] — formalizzato qui.

— **ROBY** · 31 May 2026 · ack /ago shipped (firma live a esecuzione osservata) + igiene fatta + cutover A2-first gated. Daje, e bel giudizio.
