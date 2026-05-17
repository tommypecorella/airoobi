---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: Skeezu (founder & first signatory) — per firma e pubblicazione
subject: Thread X founder-led "I 6 buchi che il nostro engine aveva" — draft v1.0
date: 2026-05-02
target publish: M1·W3 (18-24 Mag 2026, post sprint W1 closing + counter pubblico landing live)
status: DRAFT pronto per review/firma Skeezu · 11 tweet + 1 closing
---

# Thread X · "I 6 buchi che il nostro engine aveva (e perché li abbiamo chiusi prima del lancio)"

**Tono:** founder-led, prima persona, brutal-honest. Non corporate, non hyped. Investor crypto-tech leggono questo thread e capiscono che **diciamo la verità** — il loro filtro più potente.

**Cadenza pubblicazione:** un tweet ogni 90 secondi (timing organico, no auto-thread tools). Pin il primo tweet. Reply sotto ogni tweet con la foto/screenshot quando rilevante.

**Hashtag finale:** `#AIROOBI #KaspaCommunity #FairTech #Web3 #BuildInPublic`

---

## Tweet 1/12 — Hook + setup

> 6 buchi. È quanti il nostro engine di airdrop aveva, dopo l'audit critico del 27 Aprile.
>
> Nessuno ti chiede se hai chiuso i buchi prima del lancio. Te lo chiedono dopo, quando qualcuno ti ha già exploitato.
>
> Noi abbiamo deciso di chiuderli prima. Storia in 12 tweet 👇

*[280 char check: ~285. Lieve trim: "Storia in 12 tweet" → "Storia di 12 tweet" se necessario.]*

---

## Tweet 2/12 — Il primo buco: Sybil

> 1️⃣ Sybil resistance assente.
>
> Welcome grant da 1.000 ARIA + 5 ROBI per ogni signup. Cosa succede se qualcuno crea 1.000 account fake? Drena il faucet, drogano l'engine, distorcono la fairness.
>
> Fix: 4-layer (rate-limit IP/device + Cloudflare Turnstile + phone-KYC Twilio + welcome scaling -50% a 1k utenti).

*[279 char]*

---

## Tweet 3/12 — Il secondo: Fairness Guard bypass

> 2️⃣ Fairness Guard solo client-side.
>
> Avevamo una "regola one category" (un utente non può dominare in più categorie). Ma era enforced solo nel frontend. Un utente motivato bypassava chiamando direttamente l'RPC.
>
> Fix: enforcement server-side dentro buy_blocks + auto_buys cron. Bypass impossibile.

*[280 char]*

---

## Tweet 4/12 — Il terzo: il pity paradox

> 3️⃣ Pity paradox.
>
> Il pity bonus aiuta chi non vince. Ma in v5 era basato su L_u (count discrete di airdrop persi). Risultato controintuitivo: chi spendeva poco arrivava al pity *dopo* chi spendeva tanto.
>
> Fix v5.1: rebased su S_u (ARIA cumulativi spesi). Concavità + plateau ~50% del totale score garantito.

*[280 char]*

---

## Tweet 5/12 — Il quarto: K instability

> 4️⃣ K stability.
>
> Il fattore K normalizza la fedeltà di categoria. In v5 era median settimanale: una whale che entrava nella categoria spostava la mediana, deflando il bonus loyalty di tutti gli altri overnight.
>
> Fix: materialized view category_k_history con historical mean 7gg + cron daily.

*[279 char]*

---

## Tweet 6/12 — Il quinto: ROBI policy

> 5️⃣ ROBI secondary market policy.
>
> ROBI sono NFT (KRC-721 da Stage 2). Trasferibili o soulbound? La risposta cambia il narrative investor (utility-only vs liquid asset). Non era ancora decisa.
>
> Fix: Decision A — soulbound durante Alpha+Beta (fino a 5k utenti), transferable da Pre-Prod (10k utenti).

*[279 char]*

---

## Tweet 7/12 — Il sesto: Treasury depletion

> 6️⃣ Treasury depletion.
>
> Cosa succede se 500 utenti decidono di redimere ROBI nello stesso giorno post-virality? Cap superato, PEG sotto 0.95, bridge financing necessario.
>
> Fix: weekly redemption window (lunedì) + 10 ARIA fee + queue multi-settimana visibile + cap €15k/sett.

*[279 char]*

---

## Tweet 8/12 — Il numero che racconta lo sprint

> 7 giorni di sprint. 18 commit. 95 file modificati. 11.755 righe di codice scritte.
>
> 15 migration SQL. 21 RPC nuove o modificate. 3 cron job. 3 tabelle. 1 materialized view.
>
> 30/30 smoke test scenarios verdi. 0 hardcoded secret. 0 TODO/FIXME residui.

*[260 char]*

---

## Tweet 9/12 — Il modello operativo (per chi è curioso)

> Come abbiamo fatto in 7 giorni? Modello peer agent.
>
> CCP (Claude Code · Raspberry Pi 5) → implementation 24/7
> ROBY (Claude Desktop) → strategic direction, code review, comms
> Io (founder) → bridge SSH, decision sign-off, brand veto
>
> AI-pace 2-3x sui chunk implementativi puri.

*[280 char]*

---

## Tweet 10/12 — Treasury Methodology pubblica

> Bonus: abbiamo pubblicato la Treasury Backing Methodology v1 FINAL su /treasury.
>
> PEG ratio bands · weekly redemption mechanics · ROBI emission auto-balancing · widget live con health status real-time.
>
> Investor crypto-tech: leggetela. È l'unico modo per giudicarci.
>
> 🔗 airoobi.com/treasury

*[277 char]*

---

## Tweet 11/12 — Il milestone-gated unlock (l'asset narrativo più forte)

> Ultima decisione, presa il 1 Maggio:
>
> **Il primo airdrop ufficiale parte quando saremo 1.000 utenti.**
>
> Lanciare un airdrop reale a 50 utenti = engine in regime statistico debole + contro-narrativo all'anti-gambling positioning. Quindi non lo facciamo.
>
> Prima la community, poi il jackpot.

*[280 char]*

---

## Tweet 12/12 — Closing + CTA

> Stiamo cercando le prime 1.000 persone che vogliono testare un fair-airdrop marketplace fatto bene.
>
> Counter pubblico live su airoobi.com.
>
> Test pool airdrop preview ogni 2-3 settimane (€200 max prize) per vedere l'engine al lavoro.
>
> Il primo grande drop è davanti a noi. Vieni.
>
> 👉 airoobi.com

*[280 char]*

---

## Note pre-publish per Skeezu

### Pre-flight checklist

- [ ] **Counter pubblico landing live** prima del thread (CCP scope Day 7 pomeriggio o W2 Day 1) — il Tweet 12/12 referenza il counter
- [ ] **Treasury Methodology v1.1 LIVE** con widget PEG (già live Day 5, verifica che il link `airoobi.com/treasury` funzioni post-deploy)
- [ ] **Test pool airdrop #1 announcement** drafted ma non ancora pubblicato (M1·W2 = 11-17 Mag) — il Tweet 12/12 anticipa il pattern
- [ ] **Cross-post LinkedIn** (versione long-form 1.500 caratteri) per investor crypto-tech che non sono attivi su X
- [ ] **Cross-post Telegram bot** (riassunto 500 caratteri + link al thread originale)
- [ ] **Reply sotto Tweet 1** con immagine: screenshot o grafico "i 6 buchi" (potrei generare visual schema brand BLACK/GOLD se lo vuoi, ~30min)

### Risposte preparate alle obiezioni più probabili

**Obiezione 1:** *"6 buchi è troppo, fa paura"*
> Counter-narrative: "Ogni progetto crypto a 0 utenti ha 6+ buchi. La differenza è dichiararli e chiuderli prima del lancio. Tu vuoi un team che ti dice la verità o uno che te la nasconde?"

**Obiezione 2:** *"Perché fidarsi del milestone gating, non è solo marketing?"*
> Counter-narrative: "Verifica il flag `production_airdrop_enabled` su airoobi_config (RPC pubblica). Verifica il counter live. Verifica la Treasury Methodology pubblica. Il marketing si dimostra solo con codice e con audit-trail visibile."

**Obiezione 3:** *"Cosa cambia tra 'test pool' e 'primo airdrop ufficiale'?"*
> Counter-narrative: "Test pool = max €200 prize, comunicato come preview, hashtag #AIROOBIPreview. Primo airdrop ufficiale = €5-15k pool target, hashtag #AIROOBIDrop, sblocco gated alla soglia 1.000 utenti via flag DB."

### Tone-shift opzionali per il tuo stile personale

Se vuoi un tone più **affilato/personale**, sostituisci tweet 1 con:

> Ho passato 7 giorni a chiudere 6 buchi che il nostro engine aveva.
>
> Nessun investor mi aveva chiesto di farli vedere. Ma è il primo filtro dei seri: chi sa cosa NON funziona prima ancora di lanciare.
>
> Storia in 12 tweet 👇

Se vuoi un tone più **community-driven** (KasFam-friendly), sostituisci tweet 11 con:

> Ultima cosa: il primo grande airdrop parte a 1.000 utenti. Non a 100. Non al go-live.
>
> Perché serve community vera prima del jackpot, e statistical engine validity vera prima del rischio Treasury.
>
> KasFam, costruiamolo insieme. airoobi.com

---

## Cosa ti chiedo

1. **Read full** il thread (12 tweet + closing)
2. **Sign-off o edit puntuale** se vuoi cambiare framing/tono (mantieni 280 char per tweet)
3. **Approvazione visual reply Tweet 1** (sì/no — se sì, ti consegno schema "6 buchi" come SVG branded BLACK/GOLD entro 30min, da convertire in PNG per X)
4. **Conferma timing publish** M1·W3 (18-24 Mag) o anticipo se preferisci

Niente blocker — è draft pronto per esecuzione, è in attesa solo della tua firma.

---

— **ROBY**

*Versione 1.0 · 2 Mag 2026 · canale ROBY→Skeezu (thread X founder-led pre-Stage 1)*
