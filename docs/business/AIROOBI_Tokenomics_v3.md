# AIROOBI — Tokenomics & Economic Model
**TECH-001 · Version 3.2 · Final · 11 Marzo 2026**

> Alpha 0 APERTO (DB resettato 11 Mar 2026). Questo documento riflette il sistema in produzione su airoobi.com.

---

## 1. Overview del Sistema

Il modello economico di AIROOBI si basa su tre asset distinti:
- **ARIA** — valuta di piattaforma, guadagnata dagli utenti
- **Tessere** — proxy wallet che tracciano i saldi
- **Fondo Comune** — pool trasparente che garantisce il valore

**Principio:** ARIA si guadagna (check-in, video, referral) · ARIA si usa per comprare blocchi · 1 Blocco acquistato = 1 Tessera Rendimento (NFT)

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
| Tessera Rendimento | #B8960C (oro) | NFT certificato di resa | Valore KAS riscuotibile | Converti in KAS reale (95%, 24-48h) |
| Tessera Kaspa | #49EACB (verde) | Proxy wallet KAS | KAS ricevuti da conversioni | Sposta on-chain (disponibile al mainnet) |

**CSS vars:** `--aria: #4A9EFF` · `--gold: #B8960C` · `--kas: #49EACB`

---

## 4. NFT Types & Asset Registry

Tutti gli asset ufficiali sono censiti nella tabella `asset_registry` su Supabase.

| Tipo NFT | DB Key (`nft_type`) | `asset_type` | Cosa rappresenta | Come si ottiene |
|---|---|---|---|---|
| Tessera Rendimento | `NFT_REWARD` | nft | Certificato di resa — valore KAS garantito al 95% | Automatico ad ogni blocco acquistato |
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

---

## 6. Distribuzione Revenue per Airdrop

| Destinatario | Percentuale | Su €8.500 | Note |
|---|---|---|---|
| Venditore P2P | 76,5% | €6.502,50 | Al netto delle fee |
| Fondo Comune | 22% | €1.870,00 | Sostiene il valore delle Tessere Rendimento |
| Charity | 1% | €85,00 | DAO, causa selezionata dalla community |
| Fee Piattaforma | 1,5% | €127,50 | 0,5% valutazione + 1% piattaforma |

---

## 7. Fondo Comune — Meccanismo di Garanzia

- **Rimborso garantito:** ogni Tessera Rendimento vale almeno il 95% del suo importo in KAS
- **Buyback on-demand:** l'utente converte parte o tutto l'importo (elaborazione 24-48h)
- **Apprezzamento naturale:** man mano che il Fondo cresce, il valore delle Tessere può aumentare
- **Trasparenza on-chain:** il Fondo è pubblico e verificabile in tempo reale

> La sezione Fondo Comune nell'UI mostra solo statistiche grezze (Fondo attuale, Tessere emesse). La formula "Ogni Tessera vale: Fondo ÷ Tessere emesse" NON è esposta nell'UI.

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
