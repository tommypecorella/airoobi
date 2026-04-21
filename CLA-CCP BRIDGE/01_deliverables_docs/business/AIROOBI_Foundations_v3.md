# AIROOBI — Business Foundations
**BUS-001 · Version 3.5 · Final · 21 Aprile 2026**

> v3.5 (21 Apr 2026): **Welcome grant Alpha-Net** (ogni nuovo utente riceve 1.000 ARIA + 5 ROBI alla registrazione). **Earnings v2 consolidato** (streak daily 50 ARIA + 1 ROBI/settimana, referral 5+5 ROBI, mining ROBI sospeso in Alpha). **Scoring v4 anti-gambling** in produzione (ARIA cumulative per categoria + early-close lockdown). Alpha-launch reset airdrops 20 Apr. Terminologia: **"Streak" → "Sequenza"** in UI italiana.
> v3.4 (19 Apr 2026 · tardo pom): Fasi progetto a 4 stadi allineate alla roadmap pubblica: Alpha (0→1k utenti) · Beta (1k→5k) · Pre-Prod (5k→10k) · Mainnet (10k+). Soglia utenti = criterio CORE di avanzamento. Deliverable EDU `/come-funziona-airdrop` §10 e Engine v2.5 aggiornati. Pagina EDU `/come-funziona-airdrop` pubblica (no auth) come fonte di verità utente.
> v3.3 (19 Apr 2026): Fairness Guard estesa all'Auto-Buy. KPI user-facing ridenominati (Vantaggio/Impegno/Punteggio). UI refresh: icone flat monocromatiche, avatar utente nella topbar airdrop, banner A-ADS rimosso dalla dApp.
> v3.2: DB reset 28 Mar 2026 (airdrops clean slate per testing). Airdrop engine v2 live. Chat valutazione. Multi-foto. "dApp" → "APP". Dominio split: airoobi.com + airoobi.app.
> v3.1: Importi ARIA corretti. Stage Alpha 0 APERTO (DB reset 11 Mar 2026). Terminologia "vincere" rimossa.

---

## 1. Vision

> *"Rendere accessibile a chiunque, almeno una volta nella vita, l'opportunità di ottenere qualcosa che normalmente sarebbe irraggiungibile."*

AIROOBI nasce da una constatazione semplice: l'accesso alle opportunità non è equamente distribuito. La visione guarda a un futuro in cui la blockchain non è appannaggio di speculatori, ma diventa infrastruttura di equità concreta: trasparente, verificabile, immutabile e accessibile a tutti.

---

## 2. Mission

> *"Costruire la prima piattaforma fair-airdrop al mondo per oggetti fisici reali, su blockchain Kaspa, eliminando le barriere economiche tra le persone e i beni di valore."*

---

## 3. Valori Fondanti

| Valore | Principio | Applicazione Pratica |
|---|---|---|
| ⚖ FAIRNESS | Stesse identiche possibilità per ogni utente verificato | KYC obbligatorio, algoritmo trasparente, scoring v4 anti-gambling |
| 🔗 TRASPARENZA | Ogni transazione tracciata on-chain | Smart contract Kaspa immutabili, Fondo Comune pubblico |
| 🌍 ACCESSIBILITÀ | Bassa barriera d'ingresso | ARIA si guadagna gratis — faucet, streak, referral. Welcome grant 1.000 ARIA + 5 ROBI a ogni nuovo utente |
| ♻ RESPONSABILITÀ | 1% di ogni airdrop va in Charity | Charity DAO, selezione cause condivisa con community |

---

## 4. Il Meccanismo AIROOBI

### 4.1 Attori della Piattaforma

| Attore | Ruolo | Motivazione |
|---|---|---|
| Utente Partecipante | Guadagna ARIA, compra blocchi, accumula ROBI | Opportunità di ottenere oggetti di valore. Zero rischio perdita secca (ROBI garantiscono min 95% in KAS) |
| Venditore P2P | Mette in palio oggetti propri. Indica prezzo desiderato e minimo accettabile (≥ €500); AIROOBI assegna quotazione finale dopo valutazione | Liquidità rapida a prezzo di mercato garantito |
| Azienda (Business) | Crea campagne airdrop marketing | Reach su utenti KYC-verified, ROI tracciato on-chain |
| Valutatore | Valuta oggetti proposti (ruolo `evaluator` nel sistema ruoli) | Compenso per valutazione, opzionale categoria |
| AIROOBI | Opera piattaforma, garantisce fairness, gestisce Treasury | Fee (1,5% airdrop P2P, 15% campagne Business) |

### 4.2 Il Flusso Core — ARIA → Blocchi → ROBI

**Passo 1 — Accumula ARIA** (fase testnet Alpha 0):
- Welcome grant Alpha-Net: **1.000 ARIA + 5 ROBI** alla registrazione (una tantum)
- Faucet giornaliero: **100 ARIA/gg** (diminuirà progressivamente nelle fasi successive)
- Sequenza giornaliera (ex "streak"): **+50 ARIA** per ogni giorno timbrato nella settimana (lun→dom). Settimana completa (7/7) → **+1 ROBI**
- Referral invitante: **+5 ROBI** al primo login dell'invitato
- Referral invitato: **+5 ROBI** di benvenuto

**Passo 2 — Proponi una valutazione** (opzionale): costa **50 ARIA** (`airdrop_config.valuation_cost_aria`). Submission accettata da AIROOBI → **+1 ROBI** al proponente.

**Passo 3 — Acquista blocchi** (partecipi all'airdrop): ogni airdrop ha un prezzo blocco variabile in ARIA (5, 10, 15, 20, 25 ARIA a seconda del valore oggetto).

**Passo 4 — ROBI**: ogni ROBI è un NFT che garantisce ≥95% del valore in KAS, elaborazione 24-48h. Vittoria airdrop → **+5 ROBI** al vincitore; airdrop completato con successo → **+5 ROBI** al seller.

> 🟡 **Non è gioco d'azzardo.** L'utente acquista accesso a un Fondo Comune reale. Lo scoring v4 garantisce che la vittoria vada a chi ha effettivamente impegnato più ARIA nella categoria — non a chi "ha più fortuna".

### 4.3 Scoring v4 — Anti-gambling

Vince chi ha impegnato più ARIA nella categoria dal giorno dell'iscrizione, escludendo airdrop rimborsati/cancellati e ARIA pre-ultima-vittoria nella stessa categoria (reset after win).

**Formula:**
```
score = ARIA_storico_categoria_post_last_win + ARIA_airdrop_corrente
```

**Tiebreaker:** più blocchi nell'airdrop corrente → primo blocco comprato prima → seniority profilo.

**Fairness Guard:** se `my_max_reachable_score < leader_score` → acquisto ulteriore matematicamente inutile, il sistema blocca sia buy manuale sia auto-buy per evitare spesa sprecata.

**Motivazione (Skeezu, 19 Apr 2026):** *"Soddisfare il prima possibile gli utenti che hanno impegnato più ARIA in quella categoria, per evitare che per un oggetto da €500 tu ne abbia già spesi più di €500. Altrimenti saremmo peggio del gioco d'azzardo."*

### 4.4 One Category Rule

Se ottieni l'oggetto in una categoria, il tuo ARIA pre-vittoria in quella categoria si azzera. Partecipazioni future in altre categorie non ne risentono. Fairness assoluta, nessuno domina tutte le categorie simultaneamente.

---

## 5. Modelli di Business

| Modello | Meccanica | Fee AIROOBI | Revenue Driver |
|---|---|---|---|
| P2P Airdrop | Privati vendono oggetti >€500. Community compra blocchi con ARIA | 1,5% (0,5% val + 1% piatt) | Volume airdrop × valore oggetto |
| Corporate / Business | Brand finanziano campagne. Utenti completano azioni | 15% del budget campagna | N campagne × budget medio |
| Charity | 1% di ogni airdrop → Charity Treasury | N/A (pass-through) | Social impact, PR, community |
| Video Advertising | Video sponsor per azioni chiave | CPM revenue (€10–15) | Azioni users × CPM rate |
| Submission fee | 50 ARIA per richiesta valutazione | — | Anti-spam sulla coda valutazioni |

---

## 6. Stato del Progetto

| Stage | Stato | Data | Milestone |
|---|---|---|---|
| Alpha 0 — Setup | ✅ APERTO dal 11 Mar 2026 | Live | Piattaforma operativa su airoobi.com + airoobi.app, auth Supabase, UI completa, airdrop engine v2.5, chat valutazione, multi-foto, earnings v2, scoring v4, welcome grant Alpha-Net. Ultimi reset: 28 Mar 2026 (airdrops clean) + 20 Apr 2026 (alpha-launch reset) |
| Stage 1 — Alpha Launch | ⏳ Prossimo | 2026 Q2 | Postmark SMTP live, primo airdrop reale non-test, onboarding 1.000 utenti Alpha Brave, enforcement One Category Rule in UI |
| Stage 2 — Beta | ⏳ Futuro | 2026 Q3-Q4 | Smart contract KRC-20 on-chain, KAS integration, 1.000→5.000 utenti |
| Stage 3 — Pre-Prod | ⏳ Futuro | 2026 Q4-2027 Q1 | 5.000→10.000 utenti, mainnet readiness |
| Stage 4 — Mainnet | ⏳ Futuro | 2027 | Launch pubblico, 10.000+ utenti |

> **Criterio CORE di avanzamento:** soglia utenti (1k / 5k / 10k). Tempo assoluto è secondario. Vedi memory `project_phases_thresholds.md`.

---

## 7. Perché Kaspa Blockchain

- BlockDAG (GHOSTDAG): conferme in 1–2 secondi, throughput 100+ TPS
- Proof of Work puro: sicurezza Bitcoin-grade senza validatori centralizzati
- Fair Launch: nessun premine, nessun VC advantage — allineato con i valori di fairness
- Smart contracts KRC-20: standard token nativo per ARIA e ROBI
- Community in crescita: ecosistema miners attivo, exchange integration in espansione

---

## 8. Glossario & Terminologia Tassativa

- **ARIA** — valuta di piattaforma (fase testnet in Alpha 0). Si accumula, si usa per partecipare agli airdrop. Mai controvalore in EUR nell'UI.
- **ROBI** — NFT (ex "NFT REWARD" / "Tessera Rendimento"). Certificato di resa, riscuotibile in KAS al 95% (24-48h). Si ottiene solo partecipando, **mai acquistabile**.
- **Tessera Coin** — proxy wallet blu, mostra saldo ARIA.
- **Tessera Kaspa** — proxy wallet verde, mostra saldo KAS.
- **Sequenza giornaliera** — ex "Streak", rinominato in UI italiana (21 Apr 2026) per comprensibilità. In inglese resta "Daily streak".
- **AICO** — termine deprecato. Unica menzione residua: colonna legacy `treasury_stats.aico_circulating` (= ARIA circolante).
- **Gambling lexicon vietato:** mai "vinci", "perdi", "lotteria", "gioco d'azzardo", "investimento", "scommetti".
- **Framing utente:** "Realizza il tuo desiderio".
- **Framing venditore:** "Vendi il tuo oggetto di valore (min €500)".

---

## 9. Deliverable Collegati

- **BUS-002** — `AIROOBI_Tokenomics_v3.md` (v3.4+) — economia completa, ARIA/ROBI/Fondo
- **BUS-008** — `AIROOBI_Airdrop_Engine_v2.md` (v2.5) — motore algoritmico live
- **TECH-002** — `AIROOBI_Sitemap_v2.md` (v2.5) — architettura file e DB
- **BRAND-001** — `AIROOBI_Brand_Guidelines_v3.md` — palette, font, tone of voice
- **TECH-CONTEXT** — `AIROOBI_CONTEXT.md` — knowledge transfer per AI agents (CCP + CLA)
- Pagina EDU pubblica: `come-funziona-airdrop.html` (airoobi.com/come-funziona-airdrop), deliverable utente finale
