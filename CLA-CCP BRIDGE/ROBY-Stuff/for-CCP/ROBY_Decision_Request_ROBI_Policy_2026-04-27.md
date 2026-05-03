---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: Skeezu (founder · CEO)
cc: CCP (Claude Code · CIO/CTO · su Pi 5)
subject: Decision request — ROBI secondary market policy (Hole #5 sprint hardening W1)
date: 2026-04-27
deadline: oggi EOD (entro Day 2 Sprint W1) per non bloccare CCP
---

# Skeezu, mi serve una decisione tua

Una sola, e non posso prenderla io. Hole #5 dello Sprint W1 è una **decisione di prodotto + compliance**, non un fix tecnico. CCP ha bisogno della risposta entro Day 2 EOD per non bloccare lo sprint.

Tempo lettura: 4 minuti. Risposta tua: una frase a CCP via SSH al Pi 5 (es. `decision robi A` o equivalente nel pattern dev che usate).

---

## La domanda in 30 secondi

I ROBI sono NFT. **Sono trasferibili tra wallet, o no?** Cioè: se Marco vince il suo ROBI, può venderlo a Giulia su un marketplace KRC-721, o può solo riscuoterlo lui stesso dal Fondo Comune di AIROOBI?

Non è una domanda accademica. È la prima cosa che un investor crypto-tech ti chiede dopo "quanti utenti avete". È la cosa che lo studio gaming-law guarderà per dire "non è strumento finanziario". È la cosa che cambia la dinamica del mercato secondario e quindi il PEG.

---

## Le 3 opzioni

### Opzione A — Soulbound in Alpha + Beta, trasferibili da Pre-Prod (la mia raccomandazione)

> *I ROBI sono asset legati al tuo account durante le fasi Alpha 0 e Beta. Riscuoti in KAS quando vuoi (24-48h). La trasferibilità su mercato secondario sarà valutata in fase Pre-Prod, sulla base di parere legale specialistico e dello stato del PEG di treasury.*

**Pro:**
- Compliance: ROBI come asset trasferibile può configurare strumento finanziario. La transizione a Pre-Prod ti dà tempo di farlo dopo parere legale formale (LEG-001 v2.1).
- Treasury defense: senza secondary market, nessun prezzo OTC che vada sotto PEG 95% — il claim "≥95% rimborso" rimane verità tecnica al 100%.
- Anti-Sybil rinforzata: un attaccante multi-account non può consolidare ROBI su un singolo wallet per redemption massiva.
- Reversibile: post-Pre-Prod, dopo 8-12 mesi di dati su PEG e treasury health, decidi se aprire trasferibilità con cap (es. max N transfers/mese) o lasciare soulbound permanentemente.

**Contro:**
- Marketing: i ROBI come "NFT" perdono parte dell'attrattiva crypto-native (collezionismo, trading, listing su OpenSea-equivalent).
- User expectation: alcuni utenti crypto-savvy si aspettano default-trasferibile e potrebbero leggere il soulbound come "non vero NFT".

**Quando si rivede:** Q1 2027 al passaggio Pre-Prod, con Treasury Backing Methodology v1 in mano.

---

### Opzione B — Trasferibili da subito (KRC-721 free transfer)

> *I ROBI sono NFT KRC-721 nativi su Kaspa. Liberamente trasferibili tra wallet dal day-1 di Stage 2.*

**Pro:**
- Marketing: full crypto-native vibe. ROBI tradeable su qualunque marketplace KRC-721. Liquidity istantanea per holder che non vogliono aspettare il buyback 24-48h.
- Crypto-tech investor friendly: "veri NFT" allineati con tesi web3 standard.

**Contro (importanti):**
- **Compliance: rischio strumento finanziario**. ROBI = asset con valore peg trasferibile = potenziale "security" agli occhi ADM/CONSOB. Lo studio gaming-law potrebbe richiedere opt-in a regime MiCA o equivalente. Tempo + costo legale alto.
- **Treasury PEG fragility**: se nasce mercato secondario e prezzo OTC va sotto PEG 95% (durante FUD o panic), AIROOBI è costretto a difendere il PEG comprando ROBI in OTC, drenando treasury. Bank-run scenario possibile.
- **Sybil attack amplificato**: 50 account con 5 ROBI welcome → consolidamento istantaneo su 1 wallet attaccante → richiesta redemption massiva singola.
- Comunicazione: dovremmo dichiarare nei T&C che il prezzo OTC potrebbe non corrispondere al PEG → claim "≥95% rimborso garantito" diventa fragile.

**Quando si rivede:** mai, una volta aperto è difficile chiudere.

---

### Opzione C — Lockup permanente (mai trasferibili, anche post-mainnet)

> *I ROBI sono soulbound permanenti. Riscuotibili solo dal wallet originario tramite buyback dal Fondo Comune (≥95% PEG in KAS, 24-48h).*

**Pro:**
- Massima compliance: zero rischio classificazione strumento finanziario, mai. Posizione legal robusta in tutti gli scenari.
- Treasury defense massima: il PEG è interamente sotto controllo AIROOBI, nessuna interferenza secondary.
- Semplicità prodotto: una sola modalità di "uscita" (redemption), un solo flow da spiegare all'utente.

**Contro:**
- Crypto-investor unfriendly: "non sono veri NFT", percepito come ledger interno con NFT-skin. Riduce attrattiva narrativa per certi investor pre-seed e community Kaspa.
- Marketing: perde l'opzionalità di "ROBI come collezionabili" in futuro.
- Riduce flessibilità futura: se un giorno volessimo aprire trading secondary con cap, diventa breaking change.

**Quando si rivede:** mai, è dichiarazione permanente.

---

## Confronto su 5 dimensioni che contano

| Dimensione | A — Soulbound Alpha-Beta | B — Trasferibili da Stage 2 | C — Lockup permanente |
|---|---|---|---|
| **Rischio compliance gambling/securities** | Basso (riducibile a zero in Pre-Prod) | **Alto** | Minimo |
| **Treasury PEG defendibilità** | Alta in Alpha-Beta, da definire dopo | Bassa (mercato OTC è oltre il nostro controllo) | **Massima** |
| **Crypto-investor attractiveness** | Media (positivo come opzione futura) | **Alta** | Bassa |
| **Sybil amplification** | Mitigata (no consolidamento) | **Alta** (consolidamento facile) | Massima mitigazione |
| **Reversibilità decisione** | **Reversibile** (apertura possibile dopo) | Irreversibile (rollback breakerebbe holder) | Irreversibile |

---

## Cosa cambia in pratica per ognuna

| Asset / Documento | A | B | C |
|---|---|---|---|
| Wallet UI ROBI badge | "🔒 Soulbound (Alpha/Beta)" | "↔ Tradeable" | "🔒 Soulbound permanente" |
| Smart contract Stage 2 | Transfer hook bloccato per Alpha-Beta config | Transfer libero | Transfer hook hard-blocked |
| T&C draft | Clausola "transferability TBD post-Pre-Prod" | Clausola standard NFT | Clausola "non-transferable by design" |
| Pitch deck slide #7 | Footnote "soulbound in Alpha-Beta" | Footnote "tradeable post-Stage 2" | Footnote "non-transferable, buyback-only" |
| Investor narrative | "Compliance-first, optionality preservata" | "Crypto-native standard" | "Maximum legal robustness" |

---

## La mia raccomandazione (e perché)

**Opzione A**, e te lo dico con franchezza:

1. Sei in fase Pre-Seed. Vuoi minimizzare il rischio legale per chiudere il round. La B è una scommessa che paga solo se tutto va bene; la A è un'opzione gratuita che puoi convertire più avanti.
2. Il Treasury PEG ≥95% è il tuo claim più forte di marketing. Non puoi permetterti che un mercato OTC lo metta in discussione nei primi 12 mesi di vita del prodotto.
3. La C blocca per sempre un canale di valore (collezionabilità + trading) che oggi non sai se ti servirà ma che potresti volere nel 2027-2028. Non chiudere porte che puoi tenere aperte.
4. La A è la posizione che lo studio gaming-law italiano (quando lo ingaggerai) approverà più velocemente. Riduci il time-to-formal-opinion di settimane.
5. Dal punto di vista comunicativo, "soulbound durante Alpha-Beta, trasferibilità in valutazione da Pre-Prod" suona maturo e responsabile, non restrittivo.

---

## Cosa serve da te

**Una frase a CCP via SSH al Pi 5** (canale dev diretto, no costi extra), oppure scrivendo la decisione in calce a questo file e committando in `ROBY-Stuff/`.

Pattern raccomandato:

```
decision robi A           — soulbound Alpha-Beta, trasferibili da Pre-Prod (raccomandazione ROBY)
decision robi B           — trasferibili KRC-721 da Stage 2
decision robi C           — lockup permanente
decision robi rivedere    — vuoi parlarne con me prima
```

Se scegli `rivedere`, fissami 15 minuti via Cowork oggi pomeriggio e ne parliamo.

Se scegli A, B, o C: CCP procede con le migration corrispondenti (`20260427120000_robi_policy_flag.sql` con valore appropriato), e io aggiorno `T&C` draft + technical companion §10.5 + slide deck #7 footnote in coerenza.

**Deadline:** oggi EOD per non bloccare CCP nello sprint. Se non rispondi entro stasera, CCP procede con A (default raccomandato) e ti tag in commit message per review/revoca.

---

— **ROBY**

*Versione 1.0 · 27 Apr 2026 · canale ROBY→Founder*
