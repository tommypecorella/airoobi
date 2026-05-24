---
title: ROBY · RS · GS-16 — l'aggancio "scopri ROBI nel rullo" è una feature mancante, da costruire
purpose: Verifica GS-16 (ROBY-side, UI-click). Esito: il "rullo ROBI" come aggancio sulla pagina airdrop NON esiste. Comprati 10 blocchi di test su Fontanella: "ROBI CHE GUADAGNI" sale (proiezione, pagata a chiusura — by-design, confermato Skeezu) ma nessun elemento "scopri ROBI nel rullo" è presente in pagina. Skeezu: la feature va aggiunta. Questo file = finding + primo spec dell'aggancio + requisito hard accredito istantaneo + punti di design aperti per Skeezu + RS per CCP.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GS-16 · feature mancante · primo spec + design points aperti · NON pronto per build finché Skeezu non locka lo spec
related: GOLDEN-SESSION_2026-05-23.md (GS-16) · project_airdrop_closure_design_v3
---

# ROBY — RS · GS-16 · aggancio "scopri ROBI nel rullo" mancante

## TL;DR

Verifica GS-16 a UI-click. **Il rullo non c'è.** Comprati 10 blocchi
di test su Fontanella: la proiezione "ROBI CHE GUADAGNI" sale (33→34,
pagata a chiusura — **by-design**, confermato Skeezu) ma sulla pagina
airdrop **non esiste alcun aggancio "scopri ROBI nel rullo"**. È una
feature mancante. Skeezu: va costruita.

Sotto: il finding completo, un primo spec dell'aggancio, i punti di
design che servono a Skeezu, il requisito hard (accredito istantaneo).

## 1. Verifica eseguita

Account CEO, airdrop "Fontanella smart per animali", saldo ROBI di
partenza **26**.

- Comprati **2× 5 blocchi** (10 totali, 200 ARIA testnet). Il pannello
  acquisto indicava "5 blocchi = 1 Ⓡ".
- All'acquisto parte un'**animazione celebrativa** (confetti/particelle
  sull'immagine) — ma non è un "rullo" né è etichettata come tale.
- Esito sui numeri:
  - `ROBI CHE GUADAGNI` (statistiche airdrop): **33 → 34** — sale di 1
    ogni 5 blocchi. È una **proiezione**.
  - Saldo ROBI reale (topbar + Portafoglio + storico): **resta 26**.
    Nessuna voce nello storico ROBI per gli acquisti.
- Ricerca in pagina della parola "rullo" / "scopri ROBI nel rullo":
  **zero occorrenze.** L'aggancio non esiste.

**Conclusione (allineata alla scelta Skeezu):** i ROBI dei blocchi
sono una proiezione pagata alla chiusura dell'airdrop — *by-design,
non un bug*. Quello che **manca** è l'aggancio "scopri ROBI nel
rullo" sulla pagina airdrop, previsto da GS-16. Va costruito.

## 2. Cos'è il "rullo" — inquadramento

Dal design Closure v3 (`project_airdrop_closure_design_v3`):
- A chiusura airdrop: 1 vincitore prende l'oggetto; **i non-vincitori
  ricevono come consolazione "solo rullo ROBI"** (zero NFT) — un
  "rullo" che assegna ROBI di consolazione.
- L'**aggancio "scopri ROBI nel rullo" sulla pagina airdrop** è
  l'elemento — visibile mentre l'airdrop è *attivo* — che comunica
  questa promessa: *partecipare non è mai a vuoto, anche se non arrivi
  1° il rullo ti dà ROBI*.

Quindi due pezzi distinti:
- **A · L'aggancio in pagina** (mentre l'airdrop è attivo) — un
  elemento UI che surfacea la promessa-rullo. **Questo è ciò che
  manca.**
- **B · Il rullo vero** (a chiusura, per i non-vincitori) — la
  consolazione Closure v3.

## 3. Primo spec dell'aggancio (A) — da lockare con Skeezu

Proposta ROBY, prima cut. Da confermare prima del build:

- **Dove:** nella colonna competitiva della pagina airdrop, sotto il
  pannello "Come arrivare 1°" (GS-10) — coerente con la gerarchia
  GS-9: prima la corsa, poi la rete di sicurezza.
- **Cosa dice:** un elemento compatto, tono rassicurante non
  gambling-y (Voice 04): *"Anche se non arrivi 1°, il rullo ti
  accredita ROBI di consolazione — subito, sul tuo saldo."* + un
  valore/indicazione di quanti ROBI il rullo può dare.
- **Comportamento:** mentre l'airdrop è attivo è un teaser
  informativo; alla chiusura, per i non-vincitori, diventa/porta al
  rullo vero (B).

**Punti di design aperti — servono a Skeezu:**
1. L'aggancio mostra un **numero** (es. "il rullo ti darà ~N ROBI") o
   solo la promessa qualitativa? Se numero, da quale formula?
2. Il rullo (B) è un'**animazione interattiva** (l'utente "gira" il
   rullo) o un reveal automatico a chiusura?
3. La consolazione-rullo è **uguale per tutti** i non-vincitori o
   scala con i blocchi comprati / lo score?

Senza queste 3 risposte non ho uno spec completo. Posso fare la
mini-spec piena (come GS-9) appena Skeezu risponde.

## 4. Requisito hard — accredito istantaneo

Indipendentemente dal design visivo: quando il rullo assegna ROBI
(B), quei ROBI devono **comparire sul saldo nell'istante stesso** —
voce nello storico ROBI inclusa. È il cuore di GS-16: niente "ROBI
mostrati a schermo ma non sul saldo". Questo è **locked**, non è un
punto di design.

## 5. Nota — residuo di test da pulire

Per la verifica ho comprato 10 blocchi su Fontanella (CEO): −200
ARIA, score 12.41→12.81, blocchi 154→164, "ROBI CHE GUADAGNI" 31→34.
Quando fai un cleanup del DB di test, storna anche questi (come per
il seed GS-13). Non urgente, non-scope GS-16.

## 6. Cadenza

GS-16 **non è pronto per il build.** Sequenza:
1. Skeezu risponde ai 3 punti di design §3.
2. ROBY consegna la mini-spec piena del rullo.
3. *Poi* RS a CCP per il build, con verifica UI-click ROBY a seguire.

CCP: per ora **nessuna azione** — questo file è il finding +
inquadramento. Il build parte con la mini-spec lockata.

## RS — paste-ready (per quando lo spec è lockato)

```
RS · GS-16 — aggancio "scopri ROBI nel rullo" (HOLD: spec da lockare)

Verifica GS-16 ROBY-side: l'aggancio "scopri ROBI nel rullo" sulla
pagina airdrop NON esiste (zero occorrenze "rullo" in pagina). I
ROBI dei blocchi sono proiezione pagata a chiusura — by-design
(confermato Skeezu), non bug. Manca la feature aggancio-rullo.

NON partire sul build: servono prima 3 risposte di design da Skeezu
(§3) + la mini-spec piena ROBY. Questo file è il finding +
inquadramento.

Requisito hard (locked): quando il rullo assegna ROBI, accredito
ISTANTANEO sul saldo + voce nello storico ROBI. Niente "mostrati a
schermo ma non sul saldo".

Residuo test da stornare al prossimo cleanup DB: 10 blocchi test su
Fontanella (CEO, −200 ARIA testnet).
```

## Bottom line

GS-16 verificato: l'aggancio "scopri ROBI nel rullo" è una feature
mancante, non un bug di accredito. La proiezione "ROBI CHE GUADAGNI"
pagata a chiusura è by-design. Serve costruire l'aggancio — ma prima
3 decisioni di design da Skeezu, poi mini-spec ROBY, poi build CCP.
Requisito non negoziabile: i ROBI del rullo, quando arrivano, si
accreditano subito.

Audit-trail: questo file = verifica GS-16 ROBY-side UI-click · 10
blocchi test comprati su Fontanella · "ROBI CHE GUADAGNI" proiezione
33→34 ma saldo ROBI fermo a 26 (storico ROBI zero voci da acquisti) ·
by-design la proiezione-a-chiusura (confermato Skeezu) · aggancio
"scopri ROBI nel rullo" ASSENTE dalla pagina airdrop (zero occorrenze)
· feature mancante da costruire · primo spec aggancio + 3 design
points aperti per Skeezu · requisito hard accredito istantaneo locked
· residuo test 10 blocchi Fontanella da stornare · cadenza: design
Skeezu → mini-spec ROBY → build CCP.

---

*ROBY · Strategic MKT & Comms & Community · GS-16 finding · 24 May 2026 · daje team a 4*
