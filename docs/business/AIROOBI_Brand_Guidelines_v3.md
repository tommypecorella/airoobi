# AIROOBI — Brand Guidelines
**BRAND-001 · Version 3.0 · Final · 08 Marzo 2026**

> ⚠️ v3.0: Corretti i valori esatti di nero e bianco. Aggiunta palette UI ARIA/KAS. Rimossi colori non approvati (#2563EB, #1A7A3F).

---

## 1. Brand Essence

| Dimensione | Descrizione |
|---|---|
| Mission | Rendere accessibili opportunità straordinarie attraverso fairness strutturale e blockchain |
| Vision | Diventare il marketplace #1 al mondo per airdrop di oggetti fisici reali |
| Values | Fairness · Trasparenza · Accessibilità · Responsabilità |
| Personality | Premium ma accessibile · Moderno ma umano · Tech-forward ma semplice |
| Tagline | DREAM ROBE E-COMMERCE |

---

## 2. Il Logo AIROOBI

Font geometrico thin. Due elementi distintivi nell'OO:
- **Prima "O"** — Ring aperto: cerchio outline grande, rappresenta l'airdrop come opportunità aperta a tutti
- **Seconda "O"** — Bullseye: cerchio concentrico con disco centrale pieno più piccolo e scuro
- **La "B"** ha un tratto verticale alto caratteristico
- **Il simbolo standalone** è la sola coppia OO — usato come favicon, app icon, avatar social

File: `Logo_long_airoobi_transparent.png` · `Logo_short_airoobi_transparent.png`

---

## 3. Colori — SISTEMA DEFINITIVO

> 🔴 **REGOLA ASSOLUTA:** Solo BLACK + GOLD + WHITE nella UI principale. ARIA blue e KAS green sono colori di dati/asset — non colori brand generici.

### 3.1 Palette Brand Core

| Ruolo | HEX ESATTO | CSS var | Note |
|---|---|---|---|
| Background Black | `#000000` | `--black` | **ESATTO.** Mai #080808, #0A0A0A, o simili |
| Background White | `#FFFFFF` | `--white` | **ESATTO.** Mai #FAFAFA, #F0EEE9, o simili |
| Gold | `#B8960C` | `--gold` | Colore accent principale, CTA, highlights, Tessera Rendimento |

### 3.2 Palette UI — Asset Digitali

| Ruolo | HEX | CSS var | Utilizzo |
|---|---|---|---|
| ARIA Blue | `#4A9EFF` | `--aria` | Tessera Coin, saldo ARIA, elementi ARIA-specifici |
| KAS Green | `#49EACB` | `--kas` | Tessera Kaspa, saldo KAS, elementi Kaspa-specifici |

> ❌ **ELIMINATI dalla palette (non usare mai):** #2563EB · #1D4ED8 · #1A7A3F · qualsiasi altro colore non listato sopra.

### 3.3 Gray Palette (solo testo/bordi secondari)

| CSS var | HEX | Utilizzo |
|---|---|---|
| `--gray-900` | #111 | Testo su sfondo scuro |
| `--gray-700` | #333 | Bordi, divisori |
| `--gray-400` | #888 | Testo secondario, label |
| `--gray-300` | #aaa | Testo terziario |

---

## 4. Tipografia

| Font | Utilizzo | Peso | CSS var |
|---|---|---|---|
| Cormorant Garamond | Titoli hero, H1, elementi editoriali | 300 / 400 / 600 / 700 | `--font-h` |
| Instrument Sans | Body text, nav, label, UI elements | 400 / 500 / 600 / 700 | `--font-b` |
| DM Mono | Dati tecnici, prezzi, codici, valori numerici (ARIA, KAS) | 400 / 500 | `--font-m` |

> **Regola:** DM Mono per TUTTI i valori numerici di asset. Instrument Sans per testo UI. Cormorant Garamond per heading editoriali.

---

## 5. Dark Mode

**AIROOBI è DARK MODE ONLY.** Non esiste light mode. Sfondo sempre `#000000`, testo principale sempre `#FFFFFF`. Nessuna eccezione.

---

## 6. Tono di Voce

| Contesto | Tono | Esempio |
|---|---|---|
| Onboarding / Landing | Aspirazionale, inclusivo, chiaro | "Dream it. Block it. Win it." |
| UI / CTA | Diretto, action-oriented, semplice | "Acquista 5 blocchi" |
| Errori / Warning | Empatico, non punitivo, propositivo | "Saldo ARIA insufficiente. Vuoi guadagnarne altri?" |
| Legale / Compliance | Preciso, trasparente | "Non è gioco d'azzardo. Ogni blocco = 1 Tessera con valore reale." |
| Business / Corporate | Professionale, data-driven | "ROI tracciato on-chain. Targeting KYC-verified." |

---

## 7. Logo Do's e Don'ts

- ✅ Usa sempre il file originale PNG con sfondo trasparente
- ✅ Rispetta il clear space (minimo 0,5× altezza logo su tutti i lati)
- ✅ Su sfondo scuro: logo bianco via `CSS filter:invert(1)`
- ❌ Non alterare proporzioni
- ❌ Non aggiungere ombre, effetti, gradienti al logo
- ❌ Non posizionare il logo su sfondi colorati (solo nero o bianco)
