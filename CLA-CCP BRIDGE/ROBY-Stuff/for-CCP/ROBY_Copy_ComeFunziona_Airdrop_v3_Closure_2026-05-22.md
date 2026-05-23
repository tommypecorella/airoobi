---
title: ROBY · Copy · come-funziona-airdrop.html · sezione chiusura v3
purpose: Copy aggiornata per come-funziona-airdrop.html — riscrive la sezione chiusura/fallimento secondo il Closure Design v3. Lane ROBY (copy pubblica). Da applicare INSIEME al go-live v3.
date: Ven 22 maggio 2026
audience: CCP · Skeezu
status: BOZZA COPY · da applicare con go-live v3 · 2 fix Voice 04 inclusi
---

# Copy — come-funziona-airdrop.html · sezione chiusura v3

## Scope e timing

CCP ha flaggato (closing report §6) la sezione 06 "Se l'airdrop fallisce" come obsoleta con v3 — descrive il vecchio auto-fail e la consolazione. Qui la copy nuova.

**Timing:** va live **insieme** al go-live v3 (merge `sprint-w4 → main`), non prima — altrimenti la pagina descrive un comportamento non ancora attivo.
**Caveat:** ricontrollare questa copy contro l'esito dell'UAT live v3 — se l'UAT fa emergere un delta di comportamento, si rifinisce prima del go-live.

File: `03_site_pages/come-funziona-airdrop.html`. La pagina è bilingue con pattern `<span class="it">…</span><span class="en">…</span>` — CCP wrappa, sotto fornisco le coppie IT/EN.

---

## 1. Sezione 03 · Step 6 (riga ~172-174)

Oggi: titolo "CLOSED & DRAW / Chiuso & estrazione" + desc finestra ≥15 min.

**Nuovo titolo step 6:**
- IT: `CHIUSURA`
- EN: `Closing`

**Nuova desc step 6:**
- IT: `Alla scadenza la classifica finale viene calcolata in modo deterministico — vince il punteggio più alto. Il venditore ha poi 72 ore per confermare la chiusura: alla conferma parte la consegna dell'oggetto al vincitore.`
- EN: `At the deadline the final leaderboard is computed deterministically — the highest score wins. The seller then has 72 hours to confirm the closing: on confirmation, delivery of the item to the winner begins.`

---

## 2. Sezione 06 · riscrittura completa

**TOC (riga ~115)** — da "6. Se l'airdrop fallisce / 6. If the airdrop fails":
- IT: `6. La chiusura dell'airdrop`
- EN: `6. Airdrop closing`

**Titolo sezione (riga ~266)** — da "Se l'airdrop fallisce":
- IT: `La chiusura dell'airdrop`
- EN: `Airdrop closing`
(L'id `#fallimento` può restare o diventare `#chiusura` — se cambia, aggiornare anche il link nel TOC.)

**Intro:**
- IT: `Quando un airdrop raggiunge la scadenza, il sistema calcola la classifica finale e individua il vincitore. Da lì la palla passa al venditore: ha 72 ore per confermare l'esito. Niente è automatico — ogni passaggio è una scelta esplicita.`
- EN: `When an airdrop reaches its deadline, the system computes the final leaderboard and identifies the winner. From there it's the seller's turn: they have 72 hours to confirm the outcome. Nothing is automatic — every step is an explicit choice.`

**H3 · Airdrop in linea con il valore**
- IT titolo: `Airdrop in linea con il valore` / EN: `Airdrop in line with value`
- IT: `Se l'incasso copre il prezzo minimo del venditore, il venditore conferma e l'airdrop si chiude regolarmente: il 1° in classifica ottiene l'oggetto e parte la consegna.`
- EN: `If the proceeds cover the seller's minimum price, the seller confirms and the airdrop closes regularly: the #1 gets the item and delivery starts.`

**H3 · Airdrop sotto il prezzo minimo**
- IT titolo: `Airdrop sotto il prezzo minimo` / EN: `Airdrop below minimum price`
- IT: `Può succedere: un oggetto valido che non ha raccolto abbastanza interesse. Non è colpa di nessuno. In questo caso il venditore sceglie — incassare comunque la cifra raccolta (l'airdrop si chiude, il 1° ottiene l'oggetto), oppure rifiutare e tenersi l'oggetto (l'airdrop viene annullato). Nessuna delle due scelte penalizza il venditore.`
- EN: `It can happen: a valid item that didn't gather enough interest. Nobody's fault. Here the seller chooses — take the collected amount anyway (the airdrop closes, #1 gets the item), or decline and keep the item (the airdrop is cancelled). Neither choice penalises the seller.`

**H3 · Se l'airdrop viene annullato**
- IT titolo: `Se l'airdrop viene annullato` / EN: `If the airdrop is cancelled`
- IT: `In caso di annullamento — per scelta del venditore o perché le 72 ore scadono senza risposta — gli ARIA spesi vengono rimborsati ai partecipanti. I ROBI del rullo restano comunque tuoi: scoprirli al momento dell'acquisto è definitivo. Non esistono premi di consolazione di altro tipo — l'unica ricompensa di un airdrop sono i ROBI, sempre. La fee di valutazione pagata dal venditore non viene rimborsata: la piattaforma è stata comunque usata.`
- EN: `If an airdrop is cancelled — by the seller's choice, or because the 72 hours expire with no answer — the ARIA spent is refunded to participants. The ROBI from the reel stay yours anyway: discovering them at purchase is final. There are no other consolation prizes — the only reward of an airdrop is ROBI, always. The valuation fee paid by the seller is not refunded: the platform was used regardless.`

**H3 · La consegna dell'oggetto**
- IT titolo: `La consegna dell'oggetto` / EN: `Item delivery`
- IT: `Quando l'airdrop si chiude con un vincitore, la consegna avviene in tre passi dentro la piattaforma: il vincitore inserisce l'indirizzo di spedizione, il venditore spedisce e registra il tracking, il vincitore conferma di aver ricevuto l'oggetto e lascia una valutazione al venditore.`
- EN: `When an airdrop closes with a winner, delivery happens in three steps inside the platform: the winner enters the shipping address, the seller ships and registers the tracking, the winner confirms receipt and rates the seller.`

**H3 · Annullamenti ripetuti**
- IT titolo: `Annullamenti ripetuti` / EN: `Repeated cancellations`
- IT: `Annullare un airdrop è una scelta legittima, ma non a costo zero. Ogni annullamento deciso dal venditore viene contato nell'arco dell'anno solare. Al terzo annullamento in un anno il venditore non può proporre nuovi airdrop per un mese — può comunque partecipare agli airdrop degli altri. Per rientrare subito e azzerare il contatore può versare 1.000 ARIA; il contatore si azzera comunque ogni 1° gennaio. Gli airdrop sotto il prezzo minimo non contano: non sono colpa del venditore.`
- EN: `Cancelling an airdrop is a legitimate choice, but not free. Every cancellation decided by the seller is counted within the calendar year. On the third cancellation in a year the seller cannot propose new airdrops for one month — they can still take part in others' airdrops. To return immediately and reset the counter they can pay 1,000 ARIA; the counter resets every January 1st anyway. Airdrops below the minimum price don't count: they're not the seller's fault.`

**Nota per CCP** — la vecchia sezione 06 conteneva anche "Chiusura anticipata" (trigger early-close) e i "blocchi non venduti bruciati". Quei meccanismi non sono toccati dal Closure v3: tienili se ancora validi nell'engine, riallineandoli solo nel wording (niente "fallimento", niente "ROBI milestone di consolazione"). Sono dettagli tecnici lato tuo — la copy sopra copre la narrativa di chiusura v3.

---

## 3. Fix Voice 04 — 2 punti sulla stessa pagina

Già che la pagina si tocca, due residui Voice 04 (vocabolario azzardo bannato, anche in negazione — coerenza con lo sweep Voice 04 di FASE 2):

1. **Step 6 (riga ~173)** — "CLOSED & **DRAW**" / "Chiuso & **estrazione**" → già corretto sopra in "CHIUSURA / Closing". "draw/estrazione" implica casualità: la classifica è deterministica.
2. **Riga ~182** — "**Nessuna lotteria**, nessun elemento casuale" → "lotteria" è bannato anche in negazione. Sostituire con: IT `Tutto deterministico, nessun elemento casuale` · EN `Fully deterministic, no randomness`. (Stesso reframe del fix "Nessuna lotteria" → "Tutto deterministico" già fatto in FASE 2.)

---

Audit-trail: questo file = bozza copy ROBY per la sezione chiusura di come-funziona-airdrop.html, allineata al Closure Design v3. Da applicare con il go-live v3.

---

*ROBY · Strategic MKT & Comms & Community · Copy come-funziona-airdrop v3 · 22 May 2026 · daje team a 4*
