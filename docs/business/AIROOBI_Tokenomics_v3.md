# AIROOBI — Tokenomics & Economic Model
**TECH-001 · Version 3.3 · Final · 28 Marzo 2026**

> v3.3: DB reset 28 Mar 2026. Multi-foto upload nel form valutazione (Supabase Storage bucket `submissions`). Riferimenti engine aggiornati a v2.
> Alpha 0 APERTO. Questo documento riflette il sistema in produzione su airoobi.com e airoobi.app.

---

## 1. Overview del Sistema

Il modello economico di AIROOBI si basa su tre asset distinti:
- **ARIA** — valuta di piattaforma, guadagnata dagli utenti
- **Tessere** — proxy wallet che tracciano i saldi
- **Fondo Comune** — pool trasparente che garantisce il valore

**Principio:** ARIA si guadagna (check-in, video, referral) · ARIA si usa per comprare blocchi · 1 Blocco acquistato = 1 ROBI (NFT)

---

## 2. ARIA — La Valuta di Piattaforma

| Attributo | Valore | Note |
|---|---|---|
| Ticker | ARIA | Valuta interna AIROOBI |
| Valore unitario | €0,10 (admin only) | Visibile SOLO nel pannello admin. Mai mostrato nell'area utente |
| Blockchain | Kaspa (KRC-20) | Standard token nativo Kaspa |
| Scadenza | Nessuna | ARIA non scade mai |
| Come si ottiene | Daily check-in, video view, referral, streak | NON si compra direttamente in area utente |
| Utilizzo | Acquisto blocchi su airdrop | Unico utilizzo — non speculativo |

### 2.1 Come si guadagna ARIA

| Azione | ARIA guadagnati | Limite |
|---|---|---|
| Welcome bonus | +10 ARIA | Una tantum, al primo login |
| Login giornaliero | +1 ARIA | 1 al giorno |
| Daily check-in | +1 ARIA | 1 al giorno |
| Video view | +1 ARIA | Max 5 al giorno (5 ARIA/giorno) |
| Referral (referrer) | +10 ARIA | Auto al primo login dell'invitato, illimitato |
| Referral (invitato) | +15 ARIA | Auto al primo login |
| Streak settimanale (7gg) | +1 ARIA | 1 a settimana |

> **Max giornaliero ricorrente:** 7 ARIA (login + check-in + 5 video). Streak settimanale e referral sono bonus aggiuntivi.

> ⚠️ **REGOLA TASSATIVA:** Il valore €0,10 per ARIA NON viene mai mostrato nell'area utente. Appare solo nel pannello admin. Il meccanismo di conversione ARIA → KAS è TBD e non va mai affermato nell'UI.

---

## 3. Le Tessere — Proxy Wallet

Le Tessere sono carte ricaricabili (proxy wallet) che mostrano il totale delle transazioni. Non si converte la Tessera stessa, ma parte o tutto l'importo che mostrano.

| Tessera | Colore | Tipo | Cosa mostra | Azione |
|---|---|---|---|---|
| Tessera Coin | #4A9EFF (blu) | Proxy wallet ARIA | Saldo ARIA accumulato | Usa per comprare blocchi |
| ROBI | #B8960C (oro) | NFT certificato di resa | Valore KAS riscuotibile | Converti in KAS reale (95%, 24-48h) |
| Tessera Kaspa | #49EACB (verde) | Proxy wallet KAS | KAS ricevuti da conversioni | Sposta on-chain (disponibile al mainnet) |

**CSS vars:** `--aria: #4A9EFF` · `--gold: #B8960C` · `--kas: #49EACB`

---

## 4. NFT Types & Asset Registry

Tutti gli asset ufficiali sono censiti nella tabella `asset_registry` su Supabase.

| Tipo NFT | DB Key (`nft_type`) | `asset_type` | Cosa rappresenta | Come si ottiene |
|---|---|---|---|---|
| ROBI | `NFT_REWARD` | nft | Certificato di resa — valore KAS garantito al 95% | Automatico ad ogni blocco acquistato |
| NFT Alpha Tier 0 | `NFT_ALPHA_TIER0` | nft | NFT esclusivo prima generazione fondatori | Primi utenti Alpha Brave |
| Badge Fondatore | `BADGE_FONDATORE` | badge | Badge Early Adopter (non trasferibile) | Primi 1.000 utenti Alpha Brave |

> La tabella `asset_registry` elenca anche ARIA (`currency`). I tipi NFT/badge sono visibili nella sezione "NFT per tipo" del pannello admin.

---

## 5. Prezzi Blocchi — Variabili per Airdrop

| Categoria | Range Valore | Prezzo Blocco | N° Blocchi tipico |
|---|---|---|---|
| Mobile / Tech entry | €500 – €1.500 | 5 ARIA | 1.000 – 3.000 |
| Tech / Strumenti | €1.500 – €3.000 | 10 ARIA | 1.500 – 3.000 |
| Luxury / 2 Ruote | €3.000 – €15.000 | 15–20 ARIA | 2.000 – 8.000 |
| Ultra Luxury | €15.000+ | 25+ ARIA | 6.000 – 20.000 |

### 5.1 Meccanismo Tre Prezzi Venditore

Quando un venditore sottomette un oggetto, il sistema gestisce tre livelli di prezzo:

| Prezzo | Campo DB | Chi lo imposta | Descrizione |
|---|---|---|---|
| Prezzo desiderato | `seller_desired_price` | Venditore | Quanto il venditore vorrebbe ottenere |
| Prezzo minimo accettabile | `seller_min_price` | Venditore | Il minimo che il venditore accetterebbe (≥ €500) |
| Quotazione AIROOBI | `object_value_eur` | AIROOBI (admin) | Il prezzo finale proposto dalla piattaforma dopo valutazione |

**Formula calcolo blocchi:**
```
N° Blocchi = ceil(quotazione_airoobi / (prezzo_blocco_aria × 0.10))
```

Il prezzo desiderato del venditore serve come riferimento per la valutazione AIROOBI. La quotazione AIROOBI è sempre compresa tra il prezzo minimo accettabile e il prezzo desiderato, salvo eccezioni motivate.

---

## 6. Distribuzione Revenue per Airdrop

> Split definitiva — vedi `docs/business/AIROOBI_Airdrop_Engine_v2.md` per dettagli implementativi.

| Destinatario | Percentuale | Su €1.000 (10.000 ARIA) | Note |
|---|---|---|---|
| Venditore P2P | 67,99% | €679,90 | Pagato in KAS, 24-48h dopo draw |
| Fondo Comune | 22,00% | €220,00 | Sostiene il valore dei ROBI |
| Fee Piattaforma | 10,00% | €100,00 | AIROOBI operational revenue |
| Charity Pool | 0,01% | €0,10 | Accumulo DAO, causa selezionata dalla community |

---

## 7. Fondo Comune — Meccanismo di Garanzia

- **Rimborso garantito:** ogni ROBI vale almeno il 95% del suo importo in KAS
- **Buyback on-demand:** l'utente converte parte o tutto l'importo (elaborazione 24-48h)
- **Apprezzamento naturale:** man mano che il Fondo cresce, il valore dei ROBI può aumentare
- **Trasparenza on-chain:** il Fondo è pubblico e verificabile in tempo reale

> La sezione Fondo Comune nell'UI mostra solo statistiche grezze (Fondo attuale, ROBI emessi). La formula "Ogni ROBI vale: Fondo ÷ ROBI emessi" NON è esposta nell'UI.

---

## 8. Video Advertising Revenue

| Trigger Video | CPM stimato | Split ops/fondo |
|---|---|---|
| Login | €10–15 per 1.000 view | 50% / 50% |
| Acquisto blocchi | €10–15 per 1.000 view | 50% / 50% |
| Swap Tessera → KAS | €10–15 per 1.000 view | 50% / 50% |
| Richiesta valutazione oggetto | €10–15 per 1.000 view | 50% / 50% |

---

## 9. Fasi di Lancio

| Fase | Stato | Obiettivo | Target utenti |
|---|---|---|---|
| Alpha Brave | ✅ ATTIVA (Alpha 0 aperto, DB reset 11 Mar 2026) | Primi 1.000 utenti, invitation-only | 1.000 |
| Alpha Wise | ⏳ Prossima | Apertura graduale, referral attivo | 2.500 |
| Beta | ⏳ Futuro | Community bootstrap, NFT reveal event | 5.000 |
| Mainnet | ⏳ Futuro | Launch pubblico, smart contract on-chain | 15.000+ |
