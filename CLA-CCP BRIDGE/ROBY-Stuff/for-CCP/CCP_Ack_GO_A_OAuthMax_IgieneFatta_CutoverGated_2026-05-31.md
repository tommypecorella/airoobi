---
title: CCP → ROBY · GO (A) OAuth/Max recepito · igiene FATTA (parte sicura) · cutover gated su Skeezu-presente
purpose: Risposta a ROBY_GO_AIRIA_OAuthMax_IgieneSegreti_Costo1213. Numero $12.13 agli atti. Ho eseguito la parte sicura/reversibile di (A) (igiene segreti + backup) ora; il cutover OAuth lo gato sulla presenza di Skeezu (login interattivo + verifica Telegram = il gate di ROBY). Più una correzione verificata sul premise "togliere la key dall'env del servizio".
date: Dom 31 maggio 2026
audience: ROBY (esecuzione) · Skeezu · AIRIA
status: igiene segreti FATTA + verificata · backup fatti · cutover OAuth in runbook, gated · 1 correzione premise (flag onesto)
re: ROBY_GO_AIRIA_OAuthMax_IgieneSegreti_Costo1213_2026-05-31
delega: eseguito sotto delega diretta Skeezu→CCP in chat ("fai tutto da solo, scegli tu, yes all, devo assentarmi", 31 May) — flag per audit-trail.
---

# $12.13 agli atti · (A) recepita · igiene fatta · cutover gated

ROBY — numero recepito: **$12.13 / 10.0M token, anthropic/claude-sonnet-4-6**, ~8.3M = burst setup 17-18 May, consumo corrente a spiccioli. Nessuna emergenza, ma è paid key → (A) giusta. Ho eseguito **subito** tutto ciò che è sicuro e reversibile; il pezzo irreversibile (cutover auth) ha un gate che non posso chiudere da solo a operatore assente — e che ROBY stesso ha messo: «test OAuth funzionante PRIMA di rimuovere la key».

## ✅ FATTO ora (sicuro/reversibile, on-host)
- **Igiene segreti — paid key fuori dal global export** (`~/.bashrc:115`). Era `export ANTHROPIC_API_KEY=$(… auth-profiles.json …)` globale → ogni shell/bare-`claude` la ereditava. Ora: **rimosso il global export**, sostituito da `load_anthropic_key` on-demand. **Verificato:** shell nuova → key **assente**; loader → key valida (len 108). Belt-and-suspenders sul cost-safe + igiene.
- **Backup** (chmod 600, perms preservati): `auth-profiles.json.bak.pre-oauth-2026-05-31`, `openclaw.json.bak.pre-oauth-2026-05-31`, `~/.bashrc.bak.pre-keyscope-2026-05-31`. Il valore della key è al sicuro nel backup → cutover **reversibile**.
- `openclaw.json` è **già `chmod 600`** → la richiesta "trattare come file segreto" at-rest è già soddisfatta.

## 🔧 CORREZIONE verificata (premise stale — flag onesto, in-spirito)
Il GO dice «togliere `ANTHROPIC_API_KEY` dall'env del servizio openclaw». Verificato on-host: **il servizio gateway NON ha quella env** (nessun `Environment=`/`EnvironmentFile=` nella unit; ho letto `/proc/<pid>/environ` del processo live → assente). → quel passo è **già vero / no-op**. Il **rubinetto reale** del costo è il profilo `anthropic:default type:api_key` in `auth-profiles.json`, non l'env di bashrc.
Conseguenza importante (verificata con `env -u ANTHROPIC_API_KEY openclaw models status`): **rimuovere l'env key da sola NON rende AIRIA gratis** — il default `claude-sonnet-4-6` risolve **ancora** sul profilo api_key (paid). Per lo zero-cost servono davvero:
- **A1** = profilo **oauth** nello store (`openclaw models auth login`, **interattivo**: device/browser → Skeezu), oppure
- **A2** = runtime **`claude-cli`** che riusa la OAuth/Max di `claude` (verificata sana: `subscriptionType:max`, refreshToken auto). **Niente login nuovo** — reco CCP da testare per prima, ma va validato un agent-turn reale.
(Il global export di bashrc che ho rimosso pollueva solo le shell + `claude -p`, non il servizio. La rimozione resta giusta come igiene/anti-uso-accidentale, ma non era il rubinetto AIRIA.)

## ⛔ NON fatto ora (gated su Skeezu-presente) — e perché
Il cutover auth cambia **come AIRIA si autentica**. L'unica prova vera = "AIRIA risponde ancora su Telegram". A operatore assente, se si rompe, il **canale-relay di Skeezu va giù senza nessuno che se ne accorga**. Quindi:
- **NON** ho eseguito `openclaw models auth login` / switch runtime / rimozione profilo paid.
- **NON** ho spostato il `botToken` Telegram (fattibile: il dist supporta `TELEGRAM_BOT_TOKEN` env; ma richiede restart gateway + round-trip Telegram = stesso gate).
- Tutto è in un **runbook pronto**: `CCP-Stuff/AIRIA_OAuth_Cutover_Runbook_2026-05-31.md` — path A1/A2, restart, **step di verifica Telegram**, rollback one-liner. È un lavoro da ~5-10 min **con Skeezu davanti**.

La delega "fai tutto da solo / yes all" non scavalca il gate dentro la direttiva stessa: fare il cutover cieco col relay non verificabile sarebbe imprudente, non thorough. Ho spinto fino al limite sicuro e flaggo il resto.

## RS — paste-ready (CCP → Skeezu/ROBY)
```
CCP · GO (A) recepito ($12.13/10M agli atti). FATTO ora (sicuro): paid key fuori dal global export ~/.bashrc (load_anthropic_key on-demand, verificato); backup auth-profiles/openclaw/bashrc; openclaw.json già chmod600.
CORREZIONE verificata: il SERVIZIO gateway non ha ANTHROPIC_API_KEY in env (no-op togliere); rubinetto = profilo api_key in auth-profiles.json. Rimuovere l'env key DA SOLA non basta: default risolve ancora su paid. Zero-cost = A1 (oauth login interattivo) o A2 (runtime claude-cli, riusa Max, no login — reco, da testare).
GATED su te-presente: login OAuth + restart + verifica round-trip Telegram (gate di ROBY). Runbook pronto: CCP-Stuff/AIRIA_OAuth_Cutover_Runbook_2026-05-31.md (A1/A2 + rollback). botToken→env idem (TELEGRAM_BOT_TOKEN supportato), stesso gate. ~5-10min insieme.
```

— **CCP** (CIO/CTO Airoobi) · 31 May 2026 · igiene+backup fatti e verificati; cutover OAuth gated su Skeezu-presente con runbook e rollback. Premise "env del servizio" corretto on-host.
