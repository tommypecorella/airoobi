# BACKLOG — ROBI Rebrand (NFT REWARD → ROBI)

> Decisione: 28 Mar 2026 — Founder + CTO
> ROBI = nuovo nome brand per NFT REWARD / Tessera Rendimento
> 1 ROBI = 1 NFT. Riscossione in quantità intere → KAS.

## Completati (v1.46.0)

- [x] Rename user-facing "Tessera Rendimento" → "ROBI" in tutto il frontend
- [x] Rename user-facing "NFT Reward" → "ROBI" nei testi visibili
- [x] Aggiornare JS (home.js, dapp.js) — label e commenti user-facing
- [x] Aggiornare docs business plan e engine
- [x] Aggiornare blog posts
- [x] Aggiornare CSS class comments (se presenti)
- [x] Creare backlog file (questo file)
- [x] Aggiornare MEMORY.md

## Da fare — Stage 1

- [ ] **DB Migration**: rinominare tabella `nft_rewards` → `robi` (o `robi_nfts`)
- [ ] **DB Migration**: rinominare enum value `NFT_REWARD` → `ROBI` in tutte le RPC
- [ ] **DB Migration**: aggiornare `asset_registry` — code `NFT_REWARD` → `ROBI`, display_name → `ROBI`
- [ ] **DB Migration**: aggiornare `NFT_EARN` se necessario (discutere naming)
- [ ] **RPC**: aggiornare tutte le stored procedures che usano `'NFT_REWARD'`
- [ ] **Portafoglio ROBI**: UI dedicata con saldo totale, saldo riscuotibile (floor), storico
- [ ] **Riscossione ROBI → KAS**: logica backend per conversione interi
- [ ] **Blog**: riscrivere articolo "tessera-rendimento-airoobi-come-funziona" con branding ROBI
- [ ] **SEO**: redirect vecchi URL blog se rinominati

## Da fare — Stage 2

- [ ] **On-chain**: mint ROBI come NFT su Kaspa (KRC-721 o equivalente)
- [ ] **Wallet integration**: collegamento wallet Kaspa per riscossione ROBI
- [ ] **Smart contract**: logica riscossione on-chain

## Decisioni architetturali

| Decisione | Scelta | Motivo |
|-----------|--------|--------|
| ROBI = NFT, non token fungibile | NFT | Compliance ADM, evita classificazione strumento finanziario |
| ARIA senza peg fiat | Nessun peg | Rischio depeg (TerraLuna), ARIA è utility pura |
| DB rename posticipato | Stage 1 | Troppe dipendenze, rischio rottura in Alpha 0 |
| Riscossione solo interi | Floor | 1.5 ROBI → riscuoti 1, 0.5 resta in portafoglio |
