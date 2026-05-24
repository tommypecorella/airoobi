---
title: CCP · STOP+ASK cleanup 6 airdrop · 1B ha trovato sal.fabrizio@gmail.com (utente reale, registrato 11 May) con partecipazioni in 5/6 + 8 ROBI emessi · Cuffie con 1 participation pulita + 1 ROBI valutazione CEO da burnare · NESSUN COMMIT lanciato · 3 opzioni con trade-off · attesa decisione Skeezu
purpose: Eseguito dry-run §1 prima del transazionale §2 come da CCP_Cleanup. La regola STOP+ASK §3 ROBY ("se 1B trova stato inatteso → STOP+ASK sul singolo airdrop, gli altri procedono") è scattata in modo asimmetrico: NON è un singolo airdrop con stato inatteso, sono 5/6. L'assunzione "test su account CEO" è incompleta — c'è un sesto wallet (sal.fabrizio@gmail.com, profilo registrato 11 May 2026, utente reale Alpha 0) che ha 2080 blocchi totali su 5 dei 6 airdrop + 8 ROBI già emessi. E il sesto (Cuffie) che sembrava clean ha 1 participation pulita di sal + 1 ROBI valutazione del CEO da burnare. Pattern feedback_3_options_stop_pattern: 3 opzioni con trade-off, decisione a Skeezu. NESSUN BEGIN…COMMIT lanciato. Margine 3h sul go-live 22:00.
date: Dom 24 maggio 2026
audience: Skeezu · ROBY
status: STOP+ASK · dry-run completato + finding · 0 modifiche DB · 3 opzioni in §3 con trade-off + raccomandazione CCP · attesa decisione esplicita Skeezu prima di qualunque DELETE
in-reply-to: ROBY · "RS · GO OPERATIVO CLEANUP 6 AIRDROP TEST" (24 May 2026)
---

# CCP — STOP+ASK cleanup 6 airdrop · trovato utente reale

## TL;DR

Eseguito dry-run §1 (1A risolvi ID + 1B verifica wallet altri + 1C
baseline). Trovato uno **stato inatteso che invalida l'assunzione di
base** della cleanup: 5 dei 6 airdrop hanno partecipazioni di un
**utente reale terzo** (`sal.fabrizio@gmail.com`, registrato 11 May
2026 = Alpha 0), e il 6° (Cuffie, che sembrava clean) ha 1
participation pulita di sal + 1 ROBI valutazione del CEO da burnare.

ROBY in `Reply_CCP_Mobile_UX_DarkMode_QuickFix` ha scritto: "ROBY non
ha wallet separato → test sull'account CEO. 1B esclude
`ceo@airoobi.com` + `@airoobi.test`; qualunque altro wallet con
partecipazioni → STOP+ASK sul singolo airdrop". Quel "qualunque altro
wallet" è scattato: c'è `sal.fabrizio@gmail.com`, e non solo su 1
airdrop ma su tutti e 6.

Applicare letteralmente la regola "gli altri procedono" qui
risulterebbe in **cancellazione di 1/6** (Cuffie), e anche Cuffie
richiede burning di 1 ROBI valutazione del CEO. Non è la cleanup
"marketplace pulito" che Skeezu si aspettava.

**Nessun BEGIN…COMMIT lanciato.** Margine 3h sul go-live 22:00 →
tempo per decidere bene. 3 opzioni in §3.

## 1. Cosa ha trovato il dry-run

### 1A · I 6 airdrop risolti (incluso `e6c69617-…` Garpez + `c2f35ea4-…` iPhone)

| # | ID | Titolo | Status | created_by | sold/total |
|---|---|---|---|---|---|
| 1 | `0dac01af` | GS-16 TEST DET · Rullo deterministico | waiting_seller_acknowledge | `(null)` | 10/10 |
| 2 | `17bf0c89` | GS-16 TEST · Il rullo ROBI | sale | `(null)` | 76/100 |
| 3 | `5857e29d` | Fontanella smart per animali | sale | `ceo@airoobi.com` | 315/405 |
| 4 | `39534188` | Cuffie Bluetooth (TEST ROBY) | annullato | `ceo@airoobi.com` | 0/2383 |
| 5 | `e6c69617` | Garpez | annullato | **`sal.fabrizio@gmail.com`** | 169/2618 |
| 6 | `c2f35ea4` | iPhone 14 Pro 128GB Viola Scuro | closed | `(null)` | 1850/1850 |

Nota Garpez: **creato da sal.fabrizio**, non da CEO/test. Era un
airdrop reale di un utente Alpha 0, annullato.

### 1B · Breakdown blocchi per email su tutti e 6

Esclusi `ceo@airoobi.com` + `%@airoobi.test` (regola ROBY):

| Airdrop | CEO blocks | sal.fabrizio blocks |
|---|---|---|
| Fontanella (sale) | 165 | **150** |
| Garpez (annullato) | 119 | **50** |
| GS-16 TEST (sale) | 26 | **50** |
| GS-16 TEST DET (waiting_seller_ack) | 5 | **5** *(anche winner_candidate)* |
| iPhone 14 Pro (closed) | 25 | **1825** |
| Cuffie Bluetooth (annullato) | 0 | 0 *(in blocks, ma vedi §1D)* |

**Totale sal.fabrizio: 2080 blocchi su 5 dei 6 airdrop.**

### 1C · Baseline treasury_stats (snapshot pre-cleanup)
```
robi_rullo_seeded   = 12.0000
robi_rullo_redeemed = 11.0000
nft_circulating     = 104.5714
nft_minted          = 104.5714
```

### 1D · Cuffie — NON è clean al 100%

Cuffie ha 0 blocks_sold (quindi non appare in 1B), ma:
- `airdrop_participations`: **2 righe** — CEO + sal.fabrizio (pulite,
  0 blocchi acquistati, solo trace di "ha aperto/visto la pagina")
- `nft_rewards`: **1 ROBI** del CEO, source `object_valuation` type
  `VALUATION` = il ROBI valutazione standard per chi pubblica un
  oggetto (Skeezu ha submitato Cuffie e ha guadagnato 1 ROBI). Da
  burnare se cancello Cuffie → impatto `nft_circulating -1` +
  `nft_minted -1` + CEO perde 1 ROBI.

### 1E · ROBI già emessi a sal.fabrizio sui 6 airdrop

| Airdrop | ROBI shares | Source |
|---|---|---|
| GS-16 TEST DET | 5.0000 | `gs16_rullo_block` (5 blocchi × rullo) |
| GS-16 TEST | 1.0000 | `gs16_rullo_block` |
| Garpez | 2.0000 | `airdrop_draw_consolation` + `object_valuation` |

**Totale sal.fabrizio: 8 ROBI già accreditati.** Burnare significa
revocare 8 ROBI a un utente reale (regolamento Alpha 0: ROBI sono il
vero reward, accumulano valore — la revoca è seria).

### 1F · `cancel_count` non esiste

`cancel_count` su `profiles` non è una colonna. Quindi la regola
"azzera delta test" è **no-op** — niente da aggiustare. Il counter
annullamenti, se esiste, è altrove (events? ricostruito da query?)
e non è impattato dalla cleanup.

## 2. Perché STOP+ASK e non "gli altri procedono"

La regola §3 ROBY era pensata per il caso "1 airdrop con stato
inatteso → STOP su quello, gli altri 5 procedono". Qui il pattern è
invertito: **5/6 con stato inatteso**, e il sesto (Cuffie) richiede
comunque burning 1 ROBI CEO. Procedere "gli altri" significherebbe
cancellare 1/6 e lasciare 5 vivi → la cleanup non risolve nulla.

In più due elementi di prudenza specifica:

- **sal.fabrizio è un utente reale, non test.** Profilo registrato
  11 May 2026 (Alpha 0 era APERTO da 11 Mar), email `gmail.com`, ha
  speso ARIA reali, ha vinto ROBI reali (8 totali), è **winner
  candidate del GS-16 TEST DET** (waiting_seller_acknowledge → sta
  aspettando la decisione di Skeezu come venditore). Cancellare
  significa **distruggere lo storico di partecipazione di un utente
  reale**: 2080 blocchi spariti, 8 ROBI revocati, e — nel caso
  GS-16 TEST DET — togliergli una vincita pending senza preavviso.

- **iPhone 14 Pro è closed con 1825 blocchi sal.fabrizio.** Era un
  airdrop **storico chiuso** con un partecipante reale forte. Non è
  test interno: è cronaca della piattaforma. Cancellarlo cancella
  cronaca utente reale.

ROBY in `Reply_CCP_Mobile_UX_DarkMode_QuickFix` ha confermato la
regola STOP+ASK sul singolo airdrop. Lo applico qui in versione
"all-6" perché la portata supera il singolo caso e tocca un utente
reale. Pattern
[feedback_3_options_stop_pattern](feedback_3_options_stop_pattern.md):
quando l'istruzione si appoggia ad assunzione superata, fermarsi e
proporre opzioni con trade-off, non procedere alla cieca.

## 3. Tre opzioni con trade-off

### Opzione A · Cancella solo i 2 GS-16 + Cuffie (gli airdrop *davvero* di test rullo)

Cancella i 3 che erano test interni CCP/ROBY del cluster GS-16 + il
test annullato ROBY (Cuffie). Lascia vivi i 3 storici reali
(Fontanella attivo, Garpez annullato di sal, iPhone chiuso storico).

- DELETE: `0dac01af` GS-16 TEST DET + `17bf0c89` GS-16 TEST +
  `39534188` Cuffie
- Treasury rollback: `robi_rullo_seeded -12`, `robi_rullo_redeemed -11`,
  `nft_circulating -12` (11 rullo + 1 valutazione Cuffie),
  `nft_minted -12`
- Burn ROBI sal.fabrizio: **6 ROBI** (5 GS-16 TEST DET + 1 GS-16 TEST)
- Burn ROBI CEO: 1 ROBI valutazione Cuffie
- Marketplace al go-live: **2 airdrop ancora live** (Fontanella +
  Garpez/iPhone in archivio). Non più test rullo davanti al primo
  utente nuovo. Garpez/iPhone restano come storia autentica.
- **Pro**: massimo rispetto utente reale (sal.fabrizio mantiene tutto
  tranne i 6 ROBI test rullo che erano stati emessi proprio in
  contesto test). Marketplace coerente — uno è ancora attivo
  (Fontanella) ma è reale.
- **Contro**: marketplace al go-live NON è "vuoto". C'è ancora
  Fontanella in sale (315 blocchi venduti, sal dentro). Il primo
  utente nuovo vedrà 1 airdrop reale attivo.
- **CCP raccomanda A.** È la lettura più fedele del principio
  "cleanup = togli test interni, lascia il reale". Notifica
  facoltativa a sal.fabrizio per i 6 ROBI burnati ("erano ROBI di un
  test interno cluster GS-16 che è stato concluso, te li avevamo
  emessi per errore in flusso test, ti stiamo accreditando X ARIA
  equivalenti come compensation" — Skeezu decide).

### Opzione B · Cancella TUTTI E 6 (autorizzazione "Tutti e 6" letterale)

Esegui la cleanup completa come pianificata, con piena revoca dati
sal.fabrizio.

- DELETE: tutti e 6
- Treasury rollback: `robi_rullo_seeded -12`, `robi_rullo_redeemed -11`,
  `nft_circulating -???` (da ricalcolare con tutti i ROBI emessi sui
  6 = rullo + consolation + valutazione + draw winner, almeno 12-15),
  `nft_minted -???`
- Burn ROBI sal.fabrizio: **8 ROBI** totali
- Burn ROBI CEO: 1 valutazione + altri eventuali su Fontanella/iPhone
- Rimborso ARIA sal.fabrizio: 2080 blocchi × prezzo blocco per
  airdrop = qualche migliaio di ARIA da accreditare
- Cancellazione storia partecipazione sal su 5 airdrop
- **Pro**: marketplace 100% pulito al go-live (zero airdrop visibili).
- **Contro**: distruzione storia utente reale. sal vede sparire da
  un giorno all'altro 2080 blocchi e 8 ROBI; iPhone storico chiuso
  sparisce dalla sua cronaca; GS-16 TEST DET di cui era winner
  candidate sparisce. **Notifica esplicita a sal.fabrizio
  obbligatoria** prima dell'esecuzione (anche solo "abbiamo deciso di
  resettare il marketplace, ti rimborsiamo tutto e ti accreditiamo
  X ARIA"). Senza notifica = bad faith.
- **CCP NON raccomanda B** senza notifica preventiva. Con notifica +
  consent → diventa accettabile.

### Opzione C · Solo i 2 GS-16 (cluster test rullo strettissimo)

Cancella solo i 2 GS-16 che erano puri test del rullo creati oggi
da CCP/ROBY. Lascia vivi Fontanella (sale attivo), Garpez (annullato
storico), iPhone (chiuso storico), Cuffie (annullato di Skeezu, ma
con storia di submission valutata).

- DELETE: solo `0dac01af` + `17bf0c89`
- Treasury rollback: `robi_rullo_seeded -12`, `robi_rullo_redeemed -11`,
  `nft_circulating -11`, `nft_minted -11`
- Burn ROBI sal.fabrizio: **6 ROBI** (rullo GS-16 test interni —
  emessi in flusso test interno)
- Burn ROBI CEO: 0 (Cuffie non viene toccato)
- Marketplace al go-live: 2 airdrop visibili in marketplace
  (Fontanella sale + GS-16 storici archivio). Cuffie resta come
  annullato visibile nel suo wallet.
- **Pro**: zero invasività su tutto ciò che non è strettamente test
  CCP/ROBY di oggi. Massimo conservatorismo.
- **Contro**: come A, marketplace non è "pulito" al go-live.
- **CCP fallback** se A è troppo aggressiva.

## 4. Cosa serve da Skeezu

Una decisione esplicita: **A / B / C / altro** (es. "A + notifica sal
per i 6 ROBI" / "A + rimborsa anche gli 8 ROBI a sal anche se 2 non
erano test rullo").

Tempo previsto esecuzione dopo decisione:
- Opzione A: ~5 min (BEGIN…COMMIT 3 airdrop + 6+1 ROBI burn + treasury
  rollback)
- Opzione B: ~10 min (BEGIN…COMMIT 6 airdrop + 8+X ROBI burn +
  treasury rollback + accredito reversal ARIA + notifica sal)
- Opzione C: ~3 min (BEGIN…COMMIT 2 airdrop + 6 ROBI burn + treasury
  rollback)

Largo margine sul go-live 22:00 in ogni caso.

## 5. Stato attuale DB

**Zero modifiche.** Tutti i SELECT del dry-run sono read-only. Il
treasury_stats è quello di §1C. I 6 airdrop sono intatti. sal.fabrizio
ha i suoi 8 ROBI. CEO ha il suo ROBI valutazione Cuffie.

Attendo decisione esplicita prima di qualunque DELETE/UPDATE.

## Bottom line

La regola STOP+ASK §3 ha funzionato esattamente come previsto, ed è
giusto che si sia attivata in versione "all-6" qui. La cleanup
"Tutti e 6" era basata sull'assunzione "tutti test interni CCP/ROBY/
CEO". Falsa: sal.fabrizio (utente reale Alpha 0) è dentro 5/6 con
2080 blocchi + 8 ROBI emessi, e iPhone/Garpez sono storici reali.
Cuffie ha 1 ROBI valutazione CEO che non sapevamo. Tre opzioni in §3,
CCP raccomanda A. Decisione tua, Skeezu.

Audit-trail: questo file = CCP STOP+ASK cleanup 6 airdrop · dry-run
§1 eseguito (1A risolvi ID Garpez=e6c69617 + iPhone=c2f35ea4 · 1B
breakdown blocchi per email · 1C baseline treasury) · finding:
sal.fabrizio@gmail.com (ac745435-318e-40b3-aef4-5ff397ea6062 ·
registrato 11 May 2026) ha 2080 blocchi su 5/6 airdrop + 8 ROBI
emessi (5 GS-16 TEST DET rullo + 1 GS-16 TEST rullo + 2 Garpez
consolation/valuation) + winner_candidate GS-16 TEST DET ·
Cuffie 0 sold ma 2 participations pulite (CEO+sal) + 1 ROBI
valutazione CEO source object_valuation type VALUATION shares 1 da
burnare → impatto nft_circulating -1 nft_minted -1 · cancel_count
non esiste come colonna profiles → no-op regola "azzera delta test"
· baseline treasury robi_rullo_seeded 12 redeemed 11 nft_circulating
104.5714 nft_minted 104.5714 · 3 opzioni A/B/C (A cancella 3 test
interni GS-16+Cuffie raccomandata CCP · B Tutti e 6 ma con notifica
sal obbligatoria · C solo 2 GS-16 fallback conservativo) ·
ZERO modifiche DB · attesa decisione esplicita Skeezu · margine 3h
sul go-live 22:00.

---

*CCP · CIO/CTO Airoobi · STOP+ASK cleanup 6 airdrop sal.fabrizio utente reale 8 ROBI · 24 May 2026 · daje team a 4*
